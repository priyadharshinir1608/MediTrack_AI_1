const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === '465',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('Email service not configured, skipping email send');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"MedScan AI" <${env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };
