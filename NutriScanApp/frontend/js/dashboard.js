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
  } catch {
    // silencioso
  }
}

/* ── Aceptar términos ── */
document.getElementById('btn-aceptar').addEventListener('click', async () => {
  try {
    await fetch('/api/perfil/terminos', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token }
    });
  } catch {
    // silencioso
  }
  modalTerminos.style.display = 'none';
});

/* ── Rechazar términos ── */
document.getElementById('btn-rechazar').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

/* ── 2. Cargar perfil y meta ── */
async function cargarPerfil() {
  try {
    const res  = await fetch('/api/user/perfil', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById('meta-total').textContent = data.meta_calorica;
  } catch {
    // silencioso
  }
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
  } catch {
    // silencioso
  }
}

/* ── 4. Historial de alimentos del día ── */
async function cargarHistorial() {
  try {
    const res   = await fetch('/api/food/historial', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const lista = await res.json();

    if (!lista.length) return;

    historialLista.innerHTML = lista.map(item => `
      <li class="historial-item">
        <span>${item.nombre}</span>
        <span>${item.calorias} kcal</span>
      </li>
    `).join('');
  } catch {
    // silencioso
  }
}

/* ── 5. Preview al seleccionar imagen ── */
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

/* ── 6. Analizar foto con IA ── */
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
