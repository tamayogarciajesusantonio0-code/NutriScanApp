/* ============================================================
   perfilRoutes.js — Rutas del perfil de usuario
   Base: /api/perfil
   ============================================================ */

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  obtenerPerfil,
  actualizarPerfil,
  aceptarTerminos
} = require('../controllers/perfilController');

router.get('/',         auth, obtenerPerfil);
router.put('/',         auth, actualizarPerfil);
router.put('/terminos', auth, aceptarTerminos);

module.exports = router;