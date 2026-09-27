const nodemailer = require('nodemailer');

// Initialize Transporter
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const emailPass = rawPass ? rawPass.replace(/\s+/g, '') : null;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    console.log(`[Email Service] Live Gmail SMTP initialized for: ${emailUser}`);
  } else {
    // Fallback development transporter
    transporter = null;
    console.log('[Email Service] Running in Simulation/Development Mode (Configure EMAIL_USER & GMAIL_APP_PASSWORD in .env for live sending).');
  }

  return transporter;
};

/**
 * Sends a medicine expiry alert email
 */
const sendExpiryAlertEmail = async ({ toEmail, userName = 'Pharmacist', medicine, daysLeft, milestone }) => {
  if (!toEmail) return { success: false, message: 'No recipient email provided' };

  const formattedDate = new Date(medicine.expiryDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isExpired = daysLeft <= 0;
  const subject = isExpired
    ? `🚨 URGENT: ${medicine.name} has EXPIRED - MedScan AI`
    : `⚠️ Medicine Expiry Notice: ${medicine.name} expires in ${daysLeft} days - MedScan AI`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; border-bottom: 2px solid ${isExpired ? '#ef4444' : '#f59e0b'};">
        <h2 style="margin: 0; color: #38bdf8; font-size: 20px;">🏥 MedScan AI Pharmacy Alert</h2>
        <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Smart Expiry & Inventory Telemetry</p>
      </div>
      
      <div style="padding: 24px;">
        <div style="padding: 12px 16px; border-radius: 8px; background: ${isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; border: 1px solid ${isExpired ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}; color: ${isExpired ? '#fca5a5' : '#fde68a'}; font-weight: bold; margin-bottom: 20px;">
          ${isExpired ? '🚨 Immediate Action Required: Medicine has reached expiration!' : `🔔 Notice: Medicine will expire in ${daysLeft} days.`}
        </div>

        <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 16px;">
          Hello <strong>${userName}</strong>, our daily automated inspection detected the following medicine stock:
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Medicine Name:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #ffffff;">${medicine.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Batch Serial No:</td>
            <td style="padding: 10px 0; font-family: monospace; color: #38bdf8;">${medicine.batchNumber || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Category / Formulation:</td>
            <td style="padding: 10px 0; color: #ffffff;">${medicine.category || 'Tablet'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Current Quantity:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #ffffff;">${medicine.quantity} units</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Expiry Date:</td>
            <td style="padding: 10px 0; font-weight: bold; color: ${isExpired ? '#ef4444' : '#f59e0b'};">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94a3b8;">Timeline Status:</td>
            <td style="padding: 10px 0; font-weight: bold; color: ${isExpired ? '#ef4444' : '#38bdf8'};">${isExpired ? 'EXPIRED' : `${daysLeft} Days Remaining`}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="http://localhost:5173/medicines" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            Open Inventory Dashboard
          </a>
        </div>
      </div>

      <div style="background: #090d16; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b;">
        This automated notification was generated by MedScan AI based on your scheduled daily alert preferences.
      </div>
    </div>
  `;

  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({
        from: `"MedScan AI Pharmacy" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
      console.log(`[Email Service] Live Expiry alert email delivered to: ${toEmail}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`[Email Service] Sending failed:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[Email Simulation] Expiry alert prepared for ${toEmail}: ${subject}`);
    return { success: true, simulated: true };
  }
};

/**
 * Sends a low stock alert email
 */
const sendLowStockAlertEmail = async ({ toEmail, userName = 'Pharmacist', medicine, threshold = 10 }) => {
  if (!toEmail) return { success: false, message: 'No recipient email provided' };

  const isOutOfStock = medicine.quantity <= 0;
  const subject = isOutOfStock
    ? `🚨 OUT OF STOCK: ${medicine.name} (0 Units Left) - MedScan AI`
    : `⚠️ Low Stock Reorder Warning: ${medicine.name} (${medicine.quantity} Units Left) - MedScan AI`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; border-bottom: 2px solid ${isOutOfStock ? '#ef4444' : '#f59e0b'};">
        <h2 style="margin: 0; color: #38bdf8; font-size: 20px;">🏥 MedScan AI Stock Reorder Alert</h2>
        <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Daily Automated Stock Telemetry</p>
      </div>
      
      <div style="padding: 24px;">
        <div style="padding: 12px 16px; border-radius: 8px; background: ${isOutOfStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; border: 1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}; color: ${isOutOfStock ? '#fca5a5' : '#fde68a'}; font-weight: bold; margin-bottom: 20px;">
          ${isOutOfStock ? '🚨 CRITICAL: Item is completely OUT OF STOCK.' : `⚠️ WARNING: Stock level has dropped below safety threshold (${threshold} units).`}
        </div>

        <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 16px;">
          Hello <strong>${userName}</strong>, please restock the following item:
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Medicine Name:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #ffffff;">${medicine.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Batch Serial No:</td>
            <td style="padding: 10px 0; font-family: monospace; color: #38bdf8;">${medicine.batchNumber || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Current Quantity:</td>
            <td style="padding: 10px 0; font-weight: bold; color: ${isOutOfStock ? '#ef4444' : '#f59e0b'}; font-size: 16px;">${medicine.quantity} units</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">Safety Threshold:</td>
            <td style="padding: 10px 0; color: #ffffff;">${threshold} units</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="http://localhost:5173/stock" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            Quick Restock in Inventory
          </a>
        </div>
      </div>
    </div>
  `;

  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({
        from: `"MedScan AI Pharmacy" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
      console.log(`[Email Service] Live Low Stock alert email delivered to: ${toEmail}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`[Email Service] Sending failed:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[Email Simulation] Low Stock alert prepared for ${toEmail}: ${subject}`);
    return { success: true, simulated: true };
  }
};

/**
 * Sends a test email to verify Gmail / SMTP connectivity
 */
const sendTestEmail = async ({ toEmail, userName = 'Pharmacy Owner' }) => {
  if (!toEmail) return { success: false, message: 'No recipient email provided' };

  const subject = `✅ MedScan AI: Email Alert Test Successful`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155; padding: 24px;">
      <h2 style="color: #10b981; margin-top: 0;">🎉 Gmail Alert Integration Active!</h2>
      <p style="color: #cbd5e1; font-size: 14px;">
        Hello <strong>${userName}</strong>,<br/><br/>
        This confirms your MedScan AI Email Notification channel is successfully configured. You will receive daily automated expiry and low-stock alerts at your chosen daily alert time.
      </p>
      <div style="margin-top: 20px; padding: 12px; border-radius: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 13px;">
        Recipient Address: <strong>${toEmail}</strong>
      </div>
    </div>
  `;

  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({
        from: `"MedScan AI Pharmacy" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
      return { success: true, delivered: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[Email Simulation] Test email verified for ${toEmail}`);
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendExpiryAlertEmail,
  sendLowStockAlertEmail,
  sendTestEmail
};
