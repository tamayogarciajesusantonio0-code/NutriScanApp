/* ============================================================
   reset-password.js — Nueva contraseña
   ============================================================ */

const errorMsg = document.getElementById('error-msg');
const params   = new URLSearchParams(window.location.search);
const token    = params.get('token');

if (!token) window.location.href = 'login.html';

document.getElementById('btn-guardar').addEventListener('click', async () => {
  const password  = document.getElementById('password').value;
  const confirmar = document.getElementById('confirmar').value;

  errorMsg.textContent = '';

  if (!password || !confirmar) {
    errorMsg.textContent = 'Por favor completa todos los campos.';
    return;
  }
  if (password.length < 6) {
    errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }
  if (password !== confirmar) {
    errorMsg.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.textContent = 'Guardando…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('¡Contraseña actualizada! Ahora inicia sesión.');
      window.location.href = 'login.html';
    } else {
      errorMsg.textContent = data.error || 'Error al actualizar.';
    }
  } catch {
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  } finally {
    btn.textContent = 'Guardar Contraseña';
    btn.disabled = false;
  }
});