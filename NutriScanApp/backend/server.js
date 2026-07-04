/* ============================================================
   server.js — Punto de entrada del servidor Express
   Puerto: definido en .env (default 3000)
   ============================================================ */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app = express();

app.use((req, res, next) => {
  res.setTimeout(120000);
  next();
});

// ── Crear carpeta de uploads si no existe ──
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Middlewares globales ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Servir archivos estáticos del frontend ──
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Rutas de la API ──
app.use('/api/auth', require('./routes/authRoutes'));   // Login / Registro
app.use('/api/food', require('./routes/foodRoutes'));   // Analizar foto / Historial
app.use('/api/user', require('./routes/userRoutes'));   // Perfil / Meta calórica

// ── Ruta catch-all: cualquier otra ruta devuelve el frontend ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// ── Iniciar servidor ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
