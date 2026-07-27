/* ============================================================
   dashboard.js — Lógica principal del dashboard
   ============================================================ */

const token   = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
if (!token) window.location.href = 'login.html';

const uploadZone     = document.getElementById('upload-zone');
const fotoInput      = document.getElementById('foto-input');
const imgPreview     = document.getElementById('img-preview');
const btnAnalizar    = document.getElementById('btn-analizar');
const spinner        = document.getElementById('spinner');
const estadoVacio    = document.getElementById('estado-vacio');
const resultadoIA    = document.getElementById('resultado-ia');
const historialLista = document.getElementById('historial-lista');
const modalTerminos  = document.getElementById('modal-terminos');

/* ── Cargar datos al iniciar ── */
window.addEventListener('DOMContentLoaded', async () => {
  await cargarPerfil();
  await cargarCaloriasHoy();
  await cargarHistorial();
  await verificarTerminos();
});

/* ── 1. Verificar términos y condiciones ── */
async function verificarTerminos() {
  try {
    const res  = await fetch('/api/perfil', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.terminos_aceptados) {
      modalTerminos.style.display = 'flex';
    }
  } catch {}
}

/* ── Aceptar términos ── */
document.getElementById('btn-aceptar').addEventListener('click', async () => {
  try {
    await fetch('/api/perfil/terminos', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token }
    });
  } catch {}
  modalTerminos.style.display = 'none';
});

/* ── Rechazar términos ── */
document.getElementById('btn-rechazar').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

/* ── 2. Cargar perfil, meta y foto de usuario ── */
async function cargarPerfil() {
  try {
    const res  = await fetch('/api/user/perfil', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById('meta-total').textContent = data.meta_calorica;

    // Mostrar nombre y foto en el header
    const nombreUsuario = document.getElementById('nombre-usuario');
    const fotoUsuario   = document.getElementById('foto-usuario');
    const avatarLetra   = document.getElementById('avatar-letra');

    if (nombreUsuario) nombreUsuario.textContent = data.nombre;

    if (data.foto_perfil) {
      fotoUsuario.src = data.foto_perfil;
      fotoUsuario.style.display = 'block';
      if (avatarLetra) avatarLetra.style.display = 'none';
    } else {
      if (avatarLetra) avatarLetra.textContent = data.nombre.charAt(0).toUpperCase();
      fotoUsuario.style.display = 'none';
    }
  } catch {}
}

/* ── 3. Calorías consumidas hoy ── */
async function cargarCaloriasHoy() {
  try {
    const res   = await fetch('/api/user/calorias-hoy', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data  = await res.json();
    const total = data.total || 0;
    const meta  = parseInt(document.getElementById('meta-total').textContent) || 2000;

    document.getElementById('calorias-hoy').textContent = total;
    const porcentaje = Math.min((total / meta) * 100, 100);
    document.getElementById('barra-meta').style.width = porcentaje + '%';
  } catch {}
}

/* ── 4. Historial de alimentos del día ── */
async function cargarHistorial() {
  try {
    const res   = await fetch('/api/food/historial', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const lista = await res.json();

    historialLista.innerHTML = '';

    if (!lista.length) {
      historialLista.innerHTML = `
        <li style="color:#aaa; font-size:14px; text-align:center; padding:16px 0;">
          Aún no has registrado alimentos hoy
        </li>`;
      return;
    }

    historialLista.innerHTML = lista.map(item => `
      <li class="historial-item" data-id="${item.id}">
        <span>${item.nombre}</span>
        <div style="display:flex; align-items:center; gap:10px;">
          <span>${item.calorias} kcal</span>
          <button class="btn-eliminar" onclick="eliminarAlimento(${item.id})"
            style="background:none; border:none; cursor:pointer; color:#c0392b; font-size:18px; line-height:1;">
            🗑️
          </button>
        </div>
      </li>
    `).join('');
  } catch {}
}

/* ── 5. Eliminar alimento ── */
async function eliminarAlimento(id) {
  if (!confirm('¿Quieres eliminar este alimento del registro?')) return;

  try {
    const res = await fetch(`/api/food/alimento/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });

    if (res.ok) {
      await cargarCaloriasHoy();
      await cargarHistorial();
    } else {
      alert('Error al eliminar el alimento.');
    }
  } catch {
    alert('No se pudo conectar con el servidor.');
  }
}

/* ── 6. Preview al seleccionar imagen ── */
fotoInput.addEventListener('change', () => {
  const archivo = fotoInput.files[0];
  if (!archivo) return;

  const reader = new FileReader();
  reader.onload = e => {
    imgPreview.src = e.target.result;
    imgPreview.style.display = 'block';
    uploadZone.style.display = 'none';
  };
  reader.readAsDataURL(archivo);
});

/* ── 7. Analizar foto con IA ── */
btnAnalizar.addEventListener('click', async () => {
  const archivo = fotoInput.files[0];
  if (!archivo) {
    alert('Selecciona una imagen primero.');
    return;
  }

  mostrarEstado('cargando');

  const formData = new FormData();
  formData.append('foto', archivo);

  try {
    const res  = await fetch('/api/food/analizar', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al analizar');

    mostrarResultado(data);
    await cargarCaloriasHoy();
    await cargarHistorial();

  } catch (err) {
    mostrarEstado('vacio');
    alert('Error: ' + err.message);
  }
});

/* ── Helpers de UI ── */
function mostrarEstado(estado) {
  estadoVacio.style.display  = estado === 'vacio'     ? 'block' : 'none';
  spinner.style.display      = estado === 'cargando'  ? 'flex'  : 'none';
  resultadoIA.style.display  = estado === 'resultado' ? 'block' : 'none';
}

function mostrarResultado(d) {
  document.getElementById('res-nombre').textContent    = d.nombre;
  document.getElementById('res-confianza').textContent = `Confianza IA: ${d.confianza}%`;
  document.getElementById('res-calorias').textContent  = d.calorias + ' kcal';
  document.getElementById('res-peso').textContent      = (d.peso_estimado_g || '—') + 'g';
  document.getElementById('res-proteinas').textContent = d.proteinas + 'g';
  document.getElementById('res-grasas').textContent    = d.grasas + 'g';

  document.getElementById('label-prot').textContent = `Proteínas (${d.proteinas}g)`;
  document.getElementById('label-carb').textContent = `Carbohidratos (${d.carbohidratos}g)`;
  document.getElementById('label-gras').textContent = `Grasas (${d.grasas}g)`;

  document.getElementById('bar-prot').style.width = Math.min(d.proteinas, 100) + '%';
  document.getElementById('bar-carb').style.width = Math.min(d.carbohidratos, 100) + '%';
  document.getElementById('bar-gras').style.width = Math.min(d.grasas, 100) + '%';

  mostrarEstado('resultado');
}

/* ── Logout ── */
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
});
