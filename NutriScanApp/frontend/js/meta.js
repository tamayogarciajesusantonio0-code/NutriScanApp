/* ============================================================
   meta.js — Editar meta calórica diaria
   Conecta con:
     GET /api/user/perfil   → cargar meta actual
     PUT /api/user/meta     → guardar nueva meta
   ============================================================ */

const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const errorMsg  = document.getElementById('error-msg');
const metaInput = document.getElementById('meta-input');
let valorSeleccionado = null;

/* ── Cargar meta actual ── */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/user/perfil', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    document.getElementById('meta-actual').textContent = data.meta_calorica;
    valorSeleccionado = data.meta_calorica;

    // Marcar la opción activa si coincide con alguna predeterminada
    document.querySelectorAll('.meta-opcion').forEach(op => {
      if (parseInt(op.dataset.valor) === data.meta_calorica) {
        op.classList.add('activa');
      }
    });
  } catch {
    // silencioso
  }
});

/* ── Seleccionar opción rápida ── */
document.getElementById('meta-opciones').addEventListener('click', e => {
  const opcion = e.target.closest('.meta-opcion');
  if (!opcion) return;

  document.querySelectorAll('.meta-opcion').forEach(o => o.classList.remove('activa'));
  opcion.classList.add('activa');

  valorSeleccionado = parseInt(opcion.dataset.valor);
  metaInput.value   = valorSeleccionado;
});

/* ── Input personalizado ── */
metaInput.addEventListener('input', () => {
  document.querySelectorAll('.meta-opcion').forEach(o => o.classList.remove('activa'));
  valorSeleccionado = parseInt(metaInput.value) || null;
});

/* ── Guardar meta ── */
document.getElementById('btn-guardar').addEventListener('click', async () => {
  errorMsg.textContent = '';
  const meta = valorSeleccionado || parseInt(metaInput.value);

  if (!meta || meta < 800 || meta > 5000) {
    errorMsg.textContent = 'Ingresa una meta entre 800 y 5000 kcal.';
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.textContent = 'Guardando…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/user/meta', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ meta_calorica: meta })
    });

    if (res.ok) {
      // Actualizar display y regresar
      document.getElementById('meta-actual').textContent = meta;
      window.location.href = 'dashboard.html';
    } else {
      const data = await res.json();
      errorMsg.textContent = data.error || 'Error al guardar.';
    }
  } catch {
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  } finally {
    btn.textContent = 'Guardar Meta';
    btn.disabled = false;
  }
});
