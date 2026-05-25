// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const API_KEY  = '1dce940e7ef0026ffb9f1e27b5ab22de';
const BASE_URL = 'https://v3.football.api-sports.io';

// ─── CACHÉ EN SESIÓN (30 minutos) ─────────────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000;

function cacheGet(key) {
  try {
    const d = JSON.parse(sessionStorage.getItem('scout_' + key));
    if (d && (Date.now() - d.ts) < CACHE_TTL) return d.val;
  } catch (e) {}
  return null;
}

function cacheSet(key, val) {
  try {
    sessionStorage.setItem('scout_' + key, JSON.stringify({ ts: Date.now(), val }));
  } catch (e) {}
}

// ─── FETCH PRINCIPAL ──────────────────────────────────────────────────────────
// Llama directo a la API con tu key en el header.
// Funciona desde archivo local (file://) y desde localhost.
async function apiFetch(endpoint) {
  const cached = cacheGet(endpoint);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY,
    }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(Object.values(data.errors).join(', '));
  }

  cacheSet(endpoint, data);
  return data;
}

// ─── ESTADO DE LA API ─────────────────────────────────────────────────────────
async function checkStatus() {
  try {
    const data = await apiFetch('/status');
    const req = data.response?.requests;
    document.getElementById('sdot').className = 'dot live';
    document.getElementById('stxt').textContent = 'API conectada';
    if (req) document.getElementById('quota').textContent = `${req.current} / ${req.limit_day}`;
  } catch (e) {
    document.getElementById('sdot').className = 'dot error';
    document.getElementById('stxt').textContent = 'Error de conexión';
  }
}

// ─── UTILIDADES DE FECHA ──────────────────────────────────────────────────────
function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}
