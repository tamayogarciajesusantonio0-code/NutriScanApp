/* ============================================================
   authMiddleware.js — Verifica el token JWT en cada petición
   Uso: añadir como middleware en cualquier ruta protegida
   Agrega req.usuario = { id, nombre, correo }
   ============================================================ */

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, nombre, correo }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};
