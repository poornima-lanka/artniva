// backend/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter object using Nodemailer
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // 'gmail'
    auth: {
      user: process.env.EMAIL_USER,     // Your Gmail address
      pass: process.env.EMAIL_PASS,     // The 16-character App Password
    },
    // Required for some environments like older Nodemailer/less secure apps
    // We are using App Password, so this is often not needed, but good to have
    // secure: true, // true for 465, false for other ports
  });

  // 2. Define email content
  const mailOptions = {
    from: `${process.env.EMAIL_USER}`, // Sender address
    to: options.email,                 // List of receivers (user's email)
    subject: options.subject,          // Subject line
    text: options.message,             // Plain text body
    // html: options.htmlMessage,       // If you want to send rich HTML content
  };

  // 3. Send the email
  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;