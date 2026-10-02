const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_PASS;
  const emailPass = rawPass ? rawPass.replace(/\s+/g, '') : null;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    console.log(`[Email Service] Live Gmail SMTP initialized for MedScan AI: ${emailUser}`);
  } else {
    transporter = null;
    console.warn('[Email Service] Gmail credentials (EMAIL_USER & GMAIL_APP_PASSWORD) not found. Email receipts will run in simulation mode.');
  }

  return transporter;
};

/**
 * Basic email sender helper
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || 'no-reply@medscan.ai';

  if (!mailer) {
    console.warn('[Email Service] Gmail transporter not available, simulation logged for:', to);
    return { success: true, simulated: true };
  }

  try {
    const info = await mailer.sendMail({
      from: `"MedScan AI Pharmacy" <${emailUser}>`,
      to,
      subject,
      html
    });
    console.log(`[Email Service] Email dispatched to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a detailed billing receipt / invoice email to the customer
 */
const sendBillEmail = async ({ to, sale }) => {
  if (!to || !to.includes('@')) {
    return { success: false, message: 'Invalid or missing customer email address.' };
  }

  const mailer = getTransporter();
  const senderEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'billing@medscan.ai';
  const invoiceCode = sale.invoiceNumber || sale.billNumber || `INV-${Date.now()}`;
  const customer = sale.customerName || 'Valued Customer';

  const formattedDate = new Date(sale.createdAt || sale.date || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Build items rows
  const items = (sale.items || []).map((item, idx) => {
    const name = item.medicineName || item.name || 'Medicine';
    const batch = item.batchNumber ? `<span style="font-size: 11px; color: #94a3b8; display: block;">Batch: ${item.batchNumber}</span>` : '';
    const qty = Number(item.quantity) || 1;
    const unitPrice = (Number(item.unitPrice) || Number(item.price) || 0).toFixed(2);
    const totalPrice = (Number(item.totalPrice) || (qty * unitPrice)).toFixed(2);

    return `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 10px 12px; color: #94a3b8; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #f8fafc; font-size: 13px;">
          ${name}
          ${batch}
        </td>
        <td style="padding: 10px 12px; text-align: center; color: #e2e8f0; font-size: 13px;">${qty}</td>
        <td style="padding: 10px 12px; text-align: right; color: #cbd5e1; font-size: 13px;">₹${unitPrice}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #38bdf8; font-size: 13px;">₹${totalPrice}</td>
      </tr>
    `;
  }).join('');

  const subtotal = (Number(sale.totalAmount) || 0).toFixed(2);
  const discount = (Number(sale.discount) || 0).toFixed(2);
  const tax = (Number(sale.taxAmount) || 0).toFixed(2);
  const grandTotal = (Number(sale.grandTotal) || 0).toFixed(2);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MedScan AI Billing Receipt</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc;">
      
      <div style="max-width: 620px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 26px 30px; border-bottom: 2px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                🏥 MedScan AI Pharmacy
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd;">
                AI-Powered Smart Pharmacy Management & Prescription Billing
              </p>
            </div>
          </div>
        </div>

        <!-- Receipt Body -->
        <div style="padding: 26px 30px;">
          
          <!-- Greeting & Status Notice -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <div>
              <p style="margin: 0; font-size: 15px; color: #e2e8f0;">
                Dear <strong>${customer}</strong>,
              </p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">
                Your medicine purchase has been completed successfully. Here is your official billing receipt.
              </p>
            </div>
            <div>
              <span style="display: inline-block; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                ✓ Payment SUCCESS
              </span>
            </div>
          </div>

          <!-- Metadata Box -->
          <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 22px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #94a3b8; width: 40%;">Invoice Number:</td>
                <td style="padding: 4px 0; font-weight: 700; color: #38bdf8;">${invoiceCode}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #94a3b8;">Date & Time:</td>
                <td style="padding: 4px 0; color: #e2e8f0;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #94a3b8;">Payment Method:</td>
                <td style="padding: 4px 0; color: #e2e8f0;">${sale.paymentMethod || 'Cash'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #94a3b8;">Customer Contact:</td>
                <td style="padding: 4px 0; color: #e2e8f0;">${sale.customerPhone || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <!-- Medicine Items Table -->
          <div style="margin-bottom: 22px; border-radius: 8px; overflow: hidden; border: 1px solid #334155;">
            <table style="width: 100%; border-collapse: collapse; background: #0f172a;">
              <thead>
                <tr style="background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em;">
                  <th style="padding: 10px 12px; text-align: left; width: 30px;">#</th>
                  <th style="padding: 10px 12px; text-align: left;">Medicine</th>
                  <th style="padding: 10px 12px; text-align: center; width: 50px;">Qty</th>
                  <th style="padding: 10px 12px; text-align: right; width: 80px;">Price</th>
                  <th style="padding: 10px 12px; text-align: right; width: 90px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items}
              </tbody>
            </table>
          </div>

          <!-- Financial Summary -->
          <div style="width: 100%; display: flex; justify-content: flex-end; margin-bottom: 24px;">
            <div style="width: 250px; margin-left: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Subtotal:</td>
                  <td style="padding: 5px 0; text-align: right; color: #e2e8f0;">₹${subtotal}</td>
                </tr>
                ${Number(discount) > 0 ? `
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Discount:</td>
                  <td style="padding: 5px 0; text-align: right; color: #f87171;">- ₹${discount}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Tax / GST:</td>
                  <td style="padding: 5px 0; text-align: right; color: #e2e8f0;">+ ₹${tax}</td>
                </tr>
                <tr style="border-top: 2px solid #334155;">
                  <td style="padding: 10px 0 4px 0; font-size: 16px; font-weight: 800; color: #ffffff;">Grand Total:</td>
                  <td style="padding: 10px 0 4px 0; text-align: right; font-size: 18px; font-weight: 800; color: #22c55e;">₹${grandTotal}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Support & Compliance Footer Notice -->
          <div style="background: rgba(15, 23, 42, 0.7); border-top: 1px solid #1e293b; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 6px 0;">
              🔒 <strong>Electronic Tax Invoice:</strong> This receipt was generated automatically by MedScan AI system. Stored stock levels have been synchronized in real-time.
            </p>
            <p style="margin: 0;">
              If you have any questions regarding your prescription dosage or billing, please contact the pharmacy counter or reply directly to this email.
            </p>
          </div>

        </div>

        <!-- Bottom Footer -->
        <div style="background: #090d16; padding: 16px 30px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #475569;">
          © ${new Date().getFullYear()} MedScan AI • All Rights Reserved
        </div>

      </div>

    </body>
    </html>
  `;

  if (!mailer) {
    console.log(`[Email Service Simulation] Mock email dispatched for ${invoiceCode} to ${to} (Total: ₹${grandTotal})`);
    return {
      success: true,
      simulated: true,
      message: `Simulation: Email receipt generated for ${to}`
    };
  }

  try {
    const info = await mailer.sendMail({
      from: `"MedScan AI Pharmacy" <${senderEmail}>`,
      to,
      subject: `MedScan AI Invoice Receipt - ${invoiceCode}`,
      html: htmlContent
    });
    console.log(`[Email Service] Live billing receipt sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send invoice email to ${to}:`, err);
    return { success: false, message: err.message };
  }
};

module.exports = {
  sendEmail,
  sendBillEmail
};
