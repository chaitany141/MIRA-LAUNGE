const nodemailer = require('nodemailer');

let transporter;

/**
 * Lazily initializes and returns the SMTP transporter
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4, // Force IPv4 to resolve Render network issues
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
};

/**
 * Sends an email using SMTP
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Mira Lounge" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const activeTransporter = getTransporter();
    await activeTransporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to handle in controllers
  }
};

module.exports = sendEmail;
