/* ============================================================
   foodRoutes.js — Rutas protegidas de alimentos
   Base: /api/food
   Requieren: Authorization: Bearer <token>
   ============================================================ */

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const auth    = require('../middleware/authMiddleware');
const { analizarFoto, obtenerHistorial, eliminarAlimento } = require('../controllers/foodController');

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `foto_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// POST /api/food/analizar → Analizar foto con Claude Vision
router.post('/analizar', auth, upload.single('foto'), analizarFoto);

// GET /api/food/historial → Alimentos del día actual
router.get('/historial', auth, obtenerHistorial);

// DELETE /api/food/alimento/:id → Eliminar alimento del historial
router.delete('/alimento/:id', auth, eliminarAlimento);

module.exports = router;