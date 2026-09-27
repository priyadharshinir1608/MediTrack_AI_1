const axios = require('axios');

/**
 * Sends a WhatsApp message via Meta Cloud API or Twilio WhatsApp API
 */
const sendWhatsAppMessage = async ({ toPhone, text }) => {
  if (!toPhone) return { success: false, message: 'No recipient phone number provided' };

  // Normalize phone number (strip spaces, hyphens, ensure leading +)
  let cleanPhone = toPhone.replace(/[^0-9+]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+91' + cleanPhone; // Default to India (+91) if country code omitted
  }

  // 1. Meta WhatsApp Cloud API
  const metaToken = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // 2. Twilio WhatsApp API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'; // Default Twilio Sandbox number

  // 3. CallMeBot API (Free WhatsApp Bot Key)
  const callMeBotKey = process.env.CALLMEBOT_API_KEY;

  if (metaToken && metaPhoneId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${metaPhoneId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone.replace('+', ''),
        type: 'text',
        text: { body: text }
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`[WhatsApp Service] Live Meta Cloud API message sent to ${cleanPhone}:`, response.data);
      return { success: true, delivered: true, provider: 'meta', data: response.data };
    } catch (err) {
      console.error(`[WhatsApp Service - Meta] Sending failed:`, err.response?.data || err.message);
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  } else if (twilioSid && twilioAuth) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      params.append('To', `whatsapp:${cleanPhone}`);
      params.append('Body', text);

      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64')}`
        },
        timeout: 10000
      });

      console.log(`[WhatsApp Service] Live Twilio message sent to ${cleanPhone} (SID: ${response.data.sid})`);
      return { success: true, delivered: true, provider: 'twilio', sid: response.data.sid };
    } catch (err) {
      console.error(`[WhatsApp Service - Twilio] Sending failed:`, err.response?.data || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  } else if (callMeBotKey) {
    try {
      const targetPhone = cleanPhone.replace('+', '');
      const url = `https://api.callmebot.com/whatsapp.php?phone=${targetPhone}&text=${encodeURIComponent(text)}&apikey=${callMeBotKey}`;
      const response = await axios.get(url, { timeout: 10000 });

      console.log(`[WhatsApp Service] Live CallMeBot message sent to ${cleanPhone}:`, response.data);
      return { success: true, delivered: true, provider: 'callmebot' };
    } catch (err) {
      console.error(`[WhatsApp Service - CallMeBot] Sending failed:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Development / Simulation Mode
    console.log(`==================================================`);
    console.log(`💬 [WhatsApp Alert Simulation] To: ${cleanPhone}`);
    console.log(`ℹ️ [Config Note] To enable real WhatsApp delivery, add either:`);
    console.log(`   • Meta: WHATSAPP_API_TOKEN & WHATSAPP_PHONE_NUMBER_ID`);
    console.log(`   • Twilio: TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN`);
    console.log(`--------------------------------------------------`);
    console.log(text);
    console.log(`==================================================`);
    return { success: true, simulated: true, to: cleanPhone };
  }
};

/**
 * Sends a medicine expiry WhatsApp alert
 */
const sendExpiryAlertWhatsApp = async ({ toPhone, userName = 'Pharmacist', medicine, daysLeft, milestone }) => {
  const formattedDate = new Date(medicine.expiryDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isExpired = daysLeft <= 0;
  const header = isExpired ? '🚨 *CRITICAL: MEDICINE EXPIRED*' : `⚠ *MEDICINE EXPIRY NOTICE (${daysLeft} DAYS)*`;

  const text = `${header}

Hello *${userName}*,
The following stock item has triggered your daily expiry schedule:

💊 *Medicine:* ${medicine.name}
🏷 *Batch Number:* ${medicine.batchNumber || 'N/A'}
📦 *Current Stock:* ${medicine.quantity} units
📅 *Expiry Date:* ${formattedDate}
⏳ *Timeline:* ${isExpired ? 'EXPIRED' : `${daysLeft} Days Remaining`}

${isExpired ? '⛔ *Action Required:* Please quarantine or remove this batch immediately.' : '👉 *Action Recommended:* Prioritize dispensing or schedule restock.'}

_MedScan AI Pharmacy System_`;

  return await sendWhatsAppMessage({ toPhone, text });
};

/**
 * Sends a low stock WhatsApp alert
 */
const sendLowStockAlertWhatsApp = async ({ toPhone, userName = 'Pharmacist', medicine, threshold = 10 }) => {
  const isOutOfStock = medicine.quantity <= 0;
  const header = isOutOfStock ? '🚨 *OUT OF STOCK ALERT*' : '⚠️ *LOW STOCK REORDER ALERT*';

  const text = `${header}

Hello *${userName}*,
The following stock level has dropped below safety limits:

💊 *Medicine:* ${medicine.name}
🏷 *Batch Number:* ${medicine.batchNumber || 'N/A'}
📦 *Current Stock:* ${medicine.quantity} units
🛡 *Minimum Threshold:* ${threshold} units

${isOutOfStock ? '⛔ *Urgent:* Stock is completely exhausted (0 units).' : '👉 *Notice:* Please place a replenishment order with supplier.'}

_MedScan AI Pharmacy System_`;

  return await sendWhatsAppMessage({ toPhone, text });
};

/**
 * Sends a test WhatsApp message
 */
const sendTestWhatsApp = async ({ toPhone, userName = 'Pharmacy Owner' }) => {
  const text = `✅ *MedScan AI WhatsApp Alerts Activated!*

Hello *${userName}*,
Your WhatsApp alert channel is successfully connected. You will receive daily automated medicine expiry and low-stock alerts at your configured delivery time.

_MedScan AI Automated System_`;

  return await sendWhatsAppMessage({ toPhone, text });
};

module.exports = {
  sendExpiryAlertWhatsApp,
  sendLowStockAlertWhatsApp,
  sendTestWhatsApp
};
