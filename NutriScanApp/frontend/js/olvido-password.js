/* ============================================================
   olvido-password.js — Recuperar contraseña
   ============================================================ */

const errorMsg   = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');

document.getElementById('btn-enviar').addEventListener('click', async () => {
  const correo = document.getElementById('correo').value.trim();

  errorMsg.textContent   = '';
  successMsg.textContent = '';

  if (!correo) {
    errorMsg.textContent = 'Por favor escribe tu correo.';
    return;
  }

  const btn = document.getElementById('btn-enviar');
  btn.textContent = 'Enviando…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth/olvido-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    });

    const data = await res.json();
    successMsg.textContent = data.mensaje || 'Revisa tu correo.';

  } catch {
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  } finally {
    btn.textContent = 'Enviar Link';
    btn.disabled = false;
  }
});