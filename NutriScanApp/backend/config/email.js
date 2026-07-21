/* ============================================================
   email.js — Envío de correos con Resend
   ============================================================ */

const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarEmail = async ({ destinatario, asunto, html }) => {
  await resend.emails.send({
    from: 'FIT IA <onboarding@resend.dev>',
    to: destinatario,
    subject: asunto,
    html
  });
};

module.exports = enviarEmail;