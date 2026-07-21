/* ============================================================
   perfilController.js — Perfil de usuario y términos
   ============================================================ */

const db = require('../config/db');

/* ── GET /api/perfil ── */
exports.obtenerPerfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, correo, meta_calorica, foto_perfil, telefono, terminos_aceptados
       FROM usuarios WHERE id = ?`,
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── PUT /api/perfil ── */
exports.actualizarPerfil = async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
    await db.query(
      'UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?',
      [nombre, telefono, req.usuario.id]
    );
    res.json({ mensaje: 'Perfil actualizado correctamente.' });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── PUT /api/perfil/terminos ── */
exports.aceptarTerminos = async (req, res) => {
  try {
    await db.query(
      'UPDATE usuarios SET terminos_aceptados = TRUE WHERE id = ?',
      [req.usuario.id]
    );
    res.json({ mensaje: 'Términos aceptados.' });
  } catch (err) {
    console.error('Error al aceptar términos:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};