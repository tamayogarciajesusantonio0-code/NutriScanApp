/* ============================================================
   authRoutes.js — Rutas públicas de autenticación
   Base: /api/auth
   ============================================================ */

const express = require('express');
const router  = express.Router();
const { login, registro } = require('../controllers/authController');

// POST /api/auth/registro → Crear cuenta nueva
router.post('/registro', registro);

// POST /api/auth/login → Iniciar sesión (devuelve JWT)
router.post('/login', login);

module.exports = router;
