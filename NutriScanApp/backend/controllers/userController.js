/* ============================================================
   userController.js — Perfil y meta calórica del usuario
   Rutas que lo usan:
     GET /api/user/perfil        → datos del usuario
     PUT /api/user/meta          → actualizar meta calórica
     GET /api/user/calorias-hoy  → suma de kcal del día actual
   ============================================================ */

const db = require('../config/db');

/* ── GET /api/user/perfil ── */
exports.obtenerPerfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, correo, meta_calorica FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── PUT /api/user/meta ── */
exports.actualizarMeta = async (req, res) => {
  const { meta_calorica } = req.body;

  // Validar rango
  if (!meta_calorica || meta_calorica < 800 || meta_calorica > 5000) {
    return res.status(400).json({ error: 'La meta debe estar entre 800 y 5000 kcal.' });
  }

  try {
    await db.query(
      'UPDATE usuarios SET meta_calorica = ? WHERE id = ?',
      [meta_calorica, req.usuario.id]
    );
    res.json({ mensaje: 'Meta calórica actualizada.', meta_calorica });

  } catch (err) {
    console.error('Error al actualizar meta:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── GET /api/user/calorias-hoy ── */
exports.caloriasHoy = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(calorias), 0) AS total
       FROM alimentos
       WHERE usuario_id = ? AND fecha = CURRENT_DATE`,
      [req.usuario.id]
    );

    res.json({ total: rows[0].total });

  } catch (err) {
    console.error('Error al calcular calorías:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
