/* ============================================================
   authRoutes.js — Rutas de autenticación
   ============================================================ */

const express = require('express');
const router  = express.Router();
const {
  login,
  registro,
  verificarCorreo,
  olvidoPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/registro',        registro);
router.post('/login',           login);
router.get('/verificar/:token', verificarCorreo);
router.post('/olvido-password', olvidoPassword);
router.post('/reset-password',  resetPassword);

module.exports = router;