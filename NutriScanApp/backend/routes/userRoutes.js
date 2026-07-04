/* ============================================================
   userRoutes.js — Rutas protegidas del perfil de usuario
   Base: /api/user
   Requieren: Authorization: Bearer <token>
   ============================================================ */

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  obtenerPerfil,
  actualizarMeta,
  caloriasHoy
} = require('../controllers/userController');

// GET /api/user/perfil → Datos del usuario + meta calórica
router.get('/perfil', auth, obtenerPerfil);

// PUT /api/user/meta → Actualizar meta calórica diaria
router.put('/meta', auth, actualizarMeta);

// GET /api/user/calorias-hoy → Total de kcal consumidas hoy
router.get('/calorias-hoy', auth, caloriasHoy);

module.exports = router;
