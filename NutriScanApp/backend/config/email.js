/* ============================================================
   email.js — Envío de correos con Gmail (nodemailer)
   ============================================================ */

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const enviarEmail = async ({ destinatario, asunto, html }) => {
  await transporter.sendMail({
    from: `"FIT IA" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: asunto,
    html
  });
};

module.exports = enviarEmail;