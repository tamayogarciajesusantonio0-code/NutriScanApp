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

  // Validar formato de correo
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexCorreo.test(correo)) {
    errorMsg.textContent = 'El correo debe tener un formato válido (ejemplo@correo.com).';
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
      alert('¡Cuenta creada! Revisa tu correo para verificarla.');
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