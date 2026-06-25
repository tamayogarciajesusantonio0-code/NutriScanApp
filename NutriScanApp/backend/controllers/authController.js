/* ============================================================
   authController.js — Registro e inicio de sesión
   Rutas que lo usan:
     POST /api/auth/registro
     POST /api/auth/login
   ============================================================ */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

/* ── Registro de nuevo usuario ── */
exports.registro = async (req, res) => {
  const { nombre, correo, password } = req.body;

  // Validar campos requeridos
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );

    res.status(201).json({ mensaje: 'Cuenta creada correctamente.' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Este correo ya está registrado.' });
    }
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── Inicio de sesión ── */
exports.login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const usuario = rows[0];

    // Comparar contraseña
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar token JWT (expira en 24 horas)
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id:            usuario.id,
        nombre:        usuario.nombre,
        meta_calorica: usuario.meta_calorica
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
