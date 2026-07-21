/* ============================================================
   perfil.js — Perfil de usuario
   ============================================================ */

const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const errorMsg   = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');

/* ── Cargar perfil ── */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res  = await fetch('/api/perfil', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();

    document.getElementById('perfil-nombre').textContent = data.nombre;
    document.getElementById('perfil-correo').textContent = data.correo;
    document.getElementById('nombre').value    = data.nombre;
    document.getElementById('telefono').value  = data.telefono || '';

    // Inicial en el avatar
    document.getElementById('avatar-circle').textContent =
      data.nombre.charAt(0).toUpperCase();

  } catch {
    errorMsg.textContent = 'Error al cargar el perfil.';
  }
});

/* ── Guardar cambios ── */
document.getElementById('btn-guardar').addEventListener('click', async () => {
  const nombre   = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();

  errorMsg.textContent   = '';
  successMsg.textContent = '';

  if (!nombre) {
    errorMsg.textContent = 'El nombre no puede estar vacío.';
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.textContent = 'Guardando…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ nombre, telefono })
    });

    const data = await res.json();

    if (res.ok) {
      successMsg.textContent = '¡Perfil actualizado correctamente!';
      document.getElementById('perfil-nombre').textContent = nombre;
      document.getElementById('avatar-circle').textContent =
        nombre.charAt(0).toUpperCase();
    } else {
      errorMsg.textContent = data.error || 'Error al actualizar.';
    }
  } catch {
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  } finally {
    btn.textContent = 'Guardar Cambios';
    btn.disabled = false;
  }
});