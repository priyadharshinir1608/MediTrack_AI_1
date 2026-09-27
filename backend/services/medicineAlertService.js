const Medicine = require('../models/Medicine');
const User = require('../models/User');
const SentAlert = require('../models/SentAlert');
const { sendExpiryAlertEmail, sendLowStockAlertEmail } = require('./emailAlertService');
const { sendExpiryAlertWhatsApp, sendLowStockAlertWhatsApp } = require('./whatsappAlertService');
const { addNotification, logActivity } = require('./firestoreService');

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates calendar days remaining until expiry date
 */
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return 9999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffMs = exp.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Evaluates whether daysLeft matches the user's configured milestone schedule
 */
const matchExpiryMilestone = (daysLeft, configuredDays = [30, 10, 5, 1]) => {
  if (daysLeft <= 0) return 'expired';
  for (const targetDay of configuredDays) {
    if (daysLeft === targetDay) return `${targetDay}_days`;
  }
  return null;
};

/**
 * Executes alert checks for a specific user and their inventory
 */
const runUserAlertCheck = async (user) => {
  if (!user) return { success: false, message: 'Invalid user' };

  const todayStr = getTodayDateString();
  const alertSettings = user.alertSettings || {};
  
  const isEmailEnabled = alertSettings.email !== false;
  const isWhatsAppEnabled = alertSettings.whatsapp !== false;
  const isExpiryEnabled = alertSettings.expiry?.enabled !== false;
  const isLowStockEnabled = alertSettings.lowStock?.enabled !== false;

  const milestoneDays = alertSettings.expiry?.days || [30, 10, 5, 1];
  const stockThreshold = alertSettings.lowStock?.threshold || 10;

  const userEmail = user.email;
  const userPhone = user.contactNumber || user.phone;

  const medicines = await Medicine.find();
  let emailCount = 0;
  let whatsappCount = 0;
  const summary = [];

  for (const med of medicines) {
    // ----------------------------------------------------
    // 1. MEDICINE EXPIRY CHECK
    // ----------------------------------------------------
    if (isExpiryEnabled && med.expiryDate) {
      const daysLeft = getDaysUntilExpiry(med.expiryDate);
      const milestone = matchExpiryMilestone(daysLeft, milestoneDays);

      if (milestone) {
        // A. Email Channel
        if (isEmailEnabled && userEmail) {
          const emailKey = `user_${user._id}_med_${med._id}_expiry_${milestone}_email_${todayStr}`;
          const alreadySentEmail = await SentAlert.findOne({ notificationKey: emailKey, status: 'delivered' });

          if (!alreadySentEmail) {
            const emailRes = await sendExpiryAlertEmail({
              toEmail: userEmail,
              userName: user.name,
              medicine: med,
              daysLeft,
              milestone
            });

            await SentAlert.findOneAndUpdate(
              { notificationKey: emailKey },
              {
                notificationKey: emailKey,
                userId: user._id,
                medicineId: med._id,
                medicineName: med.name,
                batchNumber: med.batchNumber || '',
                type: 'expiry',
                alertLevel: milestone,
                channel: 'email',
                notificationDate: todayStr,
                recipient: userEmail,
                status: emailRes.delivered ? 'delivered' : 'simulated'
              },
              { upsert: true, new: true }
            );

            if (emailRes.delivered) emailCount++;
          }
        }

        // B. WhatsApp Channel
        if (isWhatsAppEnabled && userPhone) {
          const waKey = `user_${user._id}_med_${med._id}_expiry_${milestone}_whatsapp_${todayStr}`;
          const alreadySentWA = await SentAlert.findOne({ notificationKey: waKey, status: 'delivered' });

          if (!alreadySentWA) {
            const waRes = await sendExpiryAlertWhatsApp({
              toPhone: userPhone,
              userName: user.name,
              medicine: med,
              daysLeft,
              milestone
            });

            await SentAlert.findOneAndUpdate(
              { notificationKey: waKey },
              {
                notificationKey: waKey,
                userId: user._id,
                medicineId: med._id,
                medicineName: med.name,
                batchNumber: med.batchNumber || '',
                type: 'expiry',
                alertLevel: milestone,
                channel: 'whatsapp',
                notificationDate: todayStr,
                recipient: userPhone,
                status: waRes.delivered ? 'delivered' : 'simulated'
              },
              { upsert: true, new: true }
            );

            if (waRes.delivered) whatsappCount++;
          }
        }

        // Save in-app notification once per day
        const inAppKey = `med_${med._id}_expiry_${milestone}_inapp_${todayStr}`;
        const alreadyInApp = await SentAlert.findOne({ notificationKey: inAppKey });
        if (!alreadyInApp) {
          await addNotification({
            title: daysLeft <= 0 ? '🚨 Medicine EXPIRED Alert' : `⚠️ Expiry Warning: ${daysLeft} Days Left`,
            message: `${med.name} (Batch ${med.batchNumber}) expires on ${new Date(med.expiryDate).toLocaleDateString('en-GB')}.`,
            type: daysLeft <= 0 ? 'danger' : 'warning',
            medicineId: med._id.toString()
          });

          await SentAlert.create({
            notificationKey: inAppKey,
            userId: user._id,
            medicineId: med._id,
            medicineName: med.name,
            batchNumber: med.batchNumber || '',
            type: 'expiry',
            alertLevel: milestone,
            channel: 'firestore',
            notificationDate: todayStr,
            recipient: 'In-App'
          });
        }

        summary.push({ medicine: med.name, type: 'expiry', milestone, daysLeft });
      }
    }

    // ----------------------------------------------------
    // 2. LOW STOCK CHECK
    // ----------------------------------------------------
    if (isLowStockEnabled && med.quantity <= stockThreshold) {
      const isOutOfStock = med.quantity <= 0;

      // A. Email Channel
      if (isEmailEnabled && userEmail) {
        const emailKey = `user_${user._id}_med_${med._id}_lowstock_email_${todayStr}`;
        const alreadySentEmail = await SentAlert.findOne({ notificationKey: emailKey, status: 'delivered' });

        if (!alreadySentEmail) {
          const emailRes = await sendLowStockAlertEmail({
            toEmail: userEmail,
            userName: user.name,
            medicine: med,
            threshold: stockThreshold
          });

          await SentAlert.findOneAndUpdate(
            { notificationKey: emailKey },
            {
              notificationKey: emailKey,
              userId: user._id,
              medicineId: med._id,
              medicineName: med.name,
              batchNumber: med.batchNumber || '',
              type: 'low_stock',
              alertLevel: isOutOfStock ? 'out_of_stock' : 'low_stock',
              channel: 'email',
              notificationDate: todayStr,
              recipient: userEmail,
              status: emailRes.delivered ? 'delivered' : 'simulated'
            },
            { upsert: true, new: true }
          );

          if (emailRes.delivered) emailCount++;
        }
      }

      // B. WhatsApp Channel
      if (isWhatsAppEnabled && userPhone) {
        const waKey = `user_${user._id}_med_${med._id}_lowstock_whatsapp_${todayStr}`;
        const alreadySentWA = await SentAlert.findOne({ notificationKey: waKey, status: 'delivered' });

        if (!alreadySentWA) {
          const waRes = await sendLowStockAlertWhatsApp({
            toPhone: userPhone,
            userName: user.name,
            medicine: med,
            threshold: stockThreshold
          });

          await SentAlert.findOneAndUpdate(
            { notificationKey: waKey },
            {
              notificationKey: waKey,
              userId: user._id,
              medicineId: med._id,
              medicineName: med.name,
              batchNumber: med.batchNumber || '',
              type: 'low_stock',
              alertLevel: isOutOfStock ? 'out_of_stock' : 'low_stock',
              channel: 'whatsapp',
              notificationDate: todayStr,
              recipient: userPhone,
              status: waRes.delivered ? 'delivered' : 'simulated'
            },
            { upsert: true, new: true }
          );

          if (waRes.delivered) whatsappCount++;
        }
      }

      // In-App Notification
      const inAppKey = `med_${med._id}_lowstock_inapp_${todayStr}`;
      const alreadyInApp = await SentAlert.findOne({ notificationKey: inAppKey });
      if (!alreadyInApp) {
        await addNotification({
          title: isOutOfStock ? '🚨 Out of Stock Alert' : '⚠️ Low Stock Reorder Alert',
          message: `${med.name} stock level is ${med.quantity} units (Safety Threshold: ${stockThreshold}).`,
          type: isOutOfStock ? 'danger' : 'warning',
          medicineId: med._id.toString()
        });

        await SentAlert.create({
          notificationKey: inAppKey,
          userId: user._id,
          medicineId: med._id,
          medicineName: med.name,
          batchNumber: med.batchNumber || '',
          type: 'low_stock',
          alertLevel: isOutOfStock ? 'out_of_stock' : 'low_stock',
          channel: 'firestore',
          notificationDate: todayStr,
          recipient: 'In-App'
        });
      }

      summary.push({ medicine: med.name, type: 'low_stock', quantity: med.quantity });
    }
  }

  console.log(`[Medicine Alert Service] User ${user.email} scan completed: ${emailCount} emails, ${whatsappCount} WhatsApp messages dispatched.`);
  return {
    success: true,
    user: user.email,
    emailsDispatched: emailCount,
    whatsappDispatched: whatsappCount,
    itemsTriggered: summary.length,
    summary
  };
};

module.exports = {
  runUserAlertCheck,
  getTodayDateString,
  getDaysUntilExpiry
};
