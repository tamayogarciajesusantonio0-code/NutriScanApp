/* ============================================================
   registro.js — Crear nueva cuenta
   Conecta con: POST /api/auth/registro
   ============================================================ */

const btnRegistro = document.getElementById('btn-registro');
const errorMsg    = document.getElementById('error-msg');

btnRegistro.addEventListener('click', async () => {
  const nombre    = document.getElementById('nombre').value.trim();
  const correo    = document.getElementById('correo').value.trim();
  const password  = document.getElementById('password').value;
  const confirmar = document.getElementById('confirmar').value;

  // ── Validaciones ──
  errorMsg.textContent = '';

  if (!nombre || !correo || !password || !confirmar) {
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

  // ── Estado de carga ──
  btnRegistro.textContent = 'Creando cuenta…';
  btnRegistro.disabled = true;

  try {
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Redirigir al login con mensaje de éxito
      alert('¡Cuenta creada! Ahora inicia sesión.');
      window.location.href = 'login.html';
    } else {
      errorMsg.textContent = data.error || 'Error al crear la cuenta.';
    }
  } catch {
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  } finally {
    btnRegistro.textContent = 'Crear Cuenta';
    btnRegistro.disabled = false;
  }
});
