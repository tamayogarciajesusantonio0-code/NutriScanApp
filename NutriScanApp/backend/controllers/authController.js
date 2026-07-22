/* ============================================================
   authController.js — Registro, login, verificación y reset
   ============================================================ */

const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const crypto      = require('crypto');
const db          = require('../config/db');
const enviarEmail = require('../config/email');

/* ── Registro ── */
exports.registro = async (req, res) => {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });

  try {
    const hash  = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
      `INSERT INTO usuarios (nombre, correo, password, token_verificacion, verificado)
       VALUES (?, ?, ?, ?, FALSE)`,
      [nombre, correo, hash, token]
    );

    const link = `${process.env.URL_APP}/api/auth/verificar/${token}`;
    console.log('URL_APP:', process.env.URL_APP);
    console.log('Link generado:', link);

    await enviarEmail({
      destinatario: correo,
      asunto: '✅ Verifica tu cuenta en FIT IA',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;">
          <h2 style="color:#0f9d58;">¡Bienvenido a FIT IA, ${nombre}!</h2>
          <p>Gracias por registrarte. Haz click en el botón para verificar tu cuenta:</p>
          <a href="${link}" style="display:inline-block;margin-top:20px;padding:14px 28px;
             background:#0f9d58;color:white;border-radius:12px;text-decoration:none;
             font-weight:bold;">Verificar mi cuenta</a>
          <p style="color:#999;margin-top:24px;font-size:13px;">
            Si no creaste esta cuenta, ignora este mensaje.</p>
        </div>`
    });

    res.status(201).json({ mensaje: 'Cuenta creada. Revisa tu correo para verificarla.' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Este correo ya está registrado.' });
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── Verificar correo ── */
exports.verificarCorreo = async (req, res) => {
  const { token } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE token_verificacion = ?', [token]
    );

    if (!rows.length)
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FIT IA — Link Inválido</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #0f9d58, #25c97b);
              padding: 20px;
            }
            .card {
              background: white;
              border-radius: 24px;
              padding: 50px 40px;
              max-width: 460px;
              width: 100%;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,.15);
              animation: slideUp .4s ease;
            }
            .icono {
              width: 80px;
              height: 80px;
              background: #fdecea;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              font-size: 36px;
            }
            h1 { color: #c0392b; font-size: 26px; margin-bottom: 12px; }
            p  { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
            a {
              display: inline-block;
              padding: 14px 36px;
              background: #0f9d58;
              color: white;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              text-decoration: none;
              transition: background .2s, transform .2s;
            }
            a:hover { background: #0d874c; transform: translateY(-2px); }
            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icono">❌</div>
            <h1>Link inválido</h1>
            <p>Este link de verificación ya fue utilizado o ha expirado.<br>
               Intenta registrarte nuevamente.</p>
            <a href="${process.env.URL_APP}">Volver a la app</a>
          </div>
        </body>
        </html>`);

    await db.query(
      'UPDATE usuarios SET verificado = TRUE, token_verificacion = NULL WHERE id = ?',
      [rows[0].id]
    );

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FIT IA — Cuenta Verificada</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #0f9d58, #25c97b);
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 24px;
            padding: 50px 40px;
            max-width: 460px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,.15);
            animation: slideUp .4s ease;
          }
          .icono {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #0f9d58, #25c97b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 36px;
          }
          h1 { color: #0f9d58; font-size: 26px; margin-bottom: 12px; }
          p  { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
          a {
            display: inline-block;
            padding: 14px 36px;
            background: #0f9d58;
            color: white;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-decoration: none;
            transition: background .2s, transform .2s;
          }
          a:hover { background: #0d874c; transform: translateY(-2px); }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icono">✅</div>
          <h1>¡Cuenta verificada!</h1>
          <p>Tu correo ha sido verificado exitosamente.<br>
             Ya puedes iniciar sesión en FIT IA.</p>
          <a href="${process.env.URL_APP}">Ir a la app</a>
        </div>
      </body>
      </html>`);

  } catch (err) {
    console.error('Error verificando:', err);
    res.status(500).send('Error interno.');
  }
};

/* ── Login ── */
exports.login = async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password)
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (!rows.length)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    const usuario = rows[0];

    if (!usuario.verificado)
      return res.status(401).json({ error: 'Debes verificar tu correo antes de iniciar sesión.' });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id:                 usuario.id,
        nombre:             usuario.nombre,
        meta_calorica:      usuario.meta_calorica,
        terminos_aceptados: usuario.terminos_aceptados
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── Olvidé mi contraseña ── */
exports.olvidoPassword = async (req, res) => {
  const { correo } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (!rows.length)
      return res.json({ mensaje: 'Si ese correo existe, recibirás un email.' });

    const token  = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000);

    await db.query(
      'UPDATE usuarios SET token_reset = ?, token_reset_expira = ? WHERE id = ?',
      [token, expira, rows[0].id]
    );

    const link = `${process.env.URL_APP}/reset-password.html?token=${token}`;

    await enviarEmail({
      destinatario: correo,
      asunto: '🔑 Recupera tu contraseña de FIT IA',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;">
          <h2 style="color:#0f9d58;">Recuperar contraseña</h2>
          <p>Haz click en el botón para crear una nueva contraseña. 
             Este link expira en <strong>1 hora</strong>.</p>
          <a href="${link}" style="display:inline-block;margin-top:20px;padding:14px 28px;
             background:#0f9d58;color:white;border-radius:12px;text-decoration:none;
             font-weight:bold;">Crear nueva contraseña</a>
          <p style="color:#999;margin-top:24px;font-size:13px;">
            Si no solicitaste esto, ignora este mensaje.</p>
        </div>`
    });

    res.json({ mensaje: 'Si ese correo existe, recibirás un email.' });
  } catch (err) {
    console.error('Error en olvido password:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/* ── Resetear contraseña ── */
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE token_reset = ? AND token_reset_expira > NOW()',
      [token]
    );
    if (!rows.length)
      return res.status(400).json({ error: 'Link inválido o expirado.' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE usuarios SET password = ?, token_reset = NULL, token_reset_expira = NULL WHERE id = ?',
      [hash, rows[0].id]
    );

    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('Error en reset password:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};