/* ============================================================
   login.js — Autenticación de usuario
   Conecta con: POST /api/auth/login
   ============================================================ */

const btnLogin  = document.getElementById('btn-login');
const inputEmail = document.getElementById('correo');
const inputPass  = document.getElementById('password');
const errorMsg   = document.getElementById('error-msg');

btnLogin.addEventListener('click', async () => {
  const correo   = inputEmail.value.trim();
  const password = inputPass.value;

  // ── Validación básica ──
  errorMsg.textContent = '';
  if (!correo || !password) {
    errorMsg.textContent = 'Por favor completa todos los campos.';
    return;
  }

  // ── Estado de carga ──
  btnLogin.textContent = 'Ingresando…';
  btnLogin.disabled = true;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar sesión en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      // Redirigir al dashboard
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = data.error || 'Credenciales incorrectas.';
    }
  } catch {
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  } finally {
    btnLogin.textContent = 'Iniciar Sesión';
    btnLogin.disabled = false;
  }
});

// Permitir Enter para enviar
[inputEmail, inputPass].forEach(el =>
  el.addEventListener('keydown', e => { if (e.key === 'Enter') btnLogin.click(); })
);
