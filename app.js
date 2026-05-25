// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const LEAGUES = [39, 140, 2, 135, 78];

const LEAGUE_INFO = {
  39:  { name: 'Premier League',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  140: { name: 'La Liga',          flag: '🇪🇸' },
  2:   { name: 'Champions League', flag: '⭐' },
  135: { name: 'Serie A',          flag: '🇮🇹' },
  78:  { name: 'Bundesliga',       flag: '🇩🇪' },
};

const DAY_NAMES = {
  Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles',
  Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
};

const MONTH_NAMES = {
  January: 'enero', February: 'febrero', March: 'marzo', April: 'abril',
  May: 'mayo', June: 'junio', July: 'julio', August: 'agosto',
  September: 'septiembre', October: 'octubre', November: 'noviembre', December: 'diciembre',
};

const LIVE_STATUS  = ['1H','HT','2H','ET','BT','P','SUSP','INT'];
const DONE_STATUS  = ['FT','AET','PEN'];

// ─── ESTADO ───────────────────────────────────────────────────────────────────
let currentLeague = null;   // null = todas
let currentDate   = 'today';
let allFixtures   = [];
let bets          = [];

// Cargar apuestas guardadas
try {
  const saved = JSON.parse(localStorage.getItem('scout_bets') || '[]');
  if (Array.isArray(saved)) bets = saved;
} catch (e) {}

// ─── HELPERS UI ───────────────────────────────────────────────────────────────
function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dayEn  = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthEn = d.toLocaleDateString('en-US', { month: 'long' });
  const isToday    = dateStr === getDateStr(0);
  const isTomorrow = dateStr === getDateStr(1);
  const prefix = isToday ? 'Hoy — ' : isTomorrow ? 'Mañana — ' : '';
  return `${prefix}${DAY_NAMES[dayEn] || dayEn} ${d.getDate()} ${MONTH_NAMES[monthEn] || monthEn}`;
}

function localTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function isLive(status) { return LIVE_STATUS.includes(status); }
function isDone(status)  { return DONE_STATUS.includes(status); }

// ─── FILTROS ──────────────────────────────────────────────────────────────────
function filterLeague(id, el) {
  currentLeague = id;
  document.querySelectorAll('.sidebar .league-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  loadFixtures();
}

function setDate(d, el) {
  currentDate = d;
  document.querySelectorAll('.sidebar .league-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  loadFixtures();
}

function switchMain(view) {
  document.querySelectorAll('.htab').forEach((b, i) => {
    b.classList.toggle('active', i === (view === 'matches' ? 0 : 1));
  });
  if (view === 'matches') loadFixtures();
  else renderTracker();
}

// ─── CARGA DE PARTIDOS ────────────────────────────────────────────────────────
async function loadFixtures() {
  const mc = document.getElementById('main-content');
  mc.innerHTML = '<div class="loader"><div class="spinner"></div><span>Cargando partidos...</span></div>';

  // Construir lista de fechas según filtro
  let dates = [];
  if (currentDate === 'today')    dates = [getDateStr(0)];
  else if (currentDate === 'tomorrow') dates = [getDateStr(1)];
  else dates = Array.from({ length: 7 }, (_, i) => getDateStr(i));

  const leaguesToFetch = currentLeague ? [currentLeague] : LEAGUES;
  allFixtures = [];

  try {
    for (const date of dates) {
      for (const lid of leaguesToFetch) {
        const season = new Date().getFullYear();
        const data = await apiFetch(`/fixtures?league=${lid}&season=${season}&date=${date}`);
        if (data.response) {
          data.response.forEach(f => {
            f._leagueId   = lid;
            f._leagueInfo = LEAGUE_INFO[lid];
            allFixtures.push(f);
          });
        }
      }
    }

    if (!allFixtures.length) {
      mc.innerHTML = '<div class="empty">No hay partidos para este período.<br>Prueba con "Mañana" o "Esta semana".</div>';
      return;
    }

    renderFixtureList();
  } catch (e) {
    mc.innerHTML = `
      <div class="error-box">
        ⚠️ Error al cargar datos: ${e.message}<br><br>
        <small>Verifica tu conexión a internet. Si el problema persiste, la API puede estar temporalmente caída.</small>
      </div>`;
  }
}

// ─── RENDER LISTA ─────────────────────────────────────────────────────────────
function renderFixtureList() {
  const mc = document.getElementById('main-content');

  // Agrupar por fecha
  const grouped = {};
  allFixtures.forEach(f => {
    const date = f.fixture.date.split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(f);
  });

  let html = '<div class="cache-notice">📡 Datos reales · Caché 30 min para conservar cuota diaria</div>';

  Object.keys(grouped).sort().forEach(date => {
    const fixtures = grouped[date];
    html += `
      <div class="section-header">
        <div class="section-title">${formatDateHeader(date)}</div>
        <div class="section-sub">${fixtures.length} partido${fixtures.length > 1 ? 's' : ''}</div>
      </div>`;

    fixtures.forEach(f => {
      html += renderMatchCard(f);
    });

    html += '<br>';
  });

  mc.innerHTML = html;
}

function renderMatchCard(f) {
  const status   = f.fixture.status.short;
  const live     = isLive(status);
  const done     = isDone(status);
  const timeStr  = localTime(f.fixture.date);
  const scoreStr = `${f.goals.home ?? '?'} - ${f.goals.away ?? '?'}`;

  // Predicción rápida con defaults (se refina en el detalle con datos reales)
  const p = predict(f.teams.home.name, f.teams.away.name, 1.4, 1.1, 1.1, 1.2, [], []);

  const homeLogo = f.teams.home.logo
    ? `<img class="team-logo" src="${f.teams.home.logo}" onerror="this.style.display='none'" alt="">`
    : '';
  const awayLogo = f.teams.away.logo
    ? `<img class="team-logo" src="${f.teams.away.logo}" onerror="this.style.display='none'" alt="">`
    : '';

  return `
    <div class="match-card" onclick="showDetail('${f.fixture.id}')">
      <div class="match-meta">
        <div class="match-league">${f._leagueInfo?.flag || '⚽'} ${f.league.name}</div>
        <div style="display:flex;align-items:center;gap:8px">
          ${live ? '<span class="live-badge">EN VIVO</span>' : ''}
          <div class="match-time">
            ${done  ? `<strong>${scoreStr}</strong> FT` : ''}
            ${live  ? scoreStr : ''}
            ${!done && !live ? timeStr : ''}
          </div>
        </div>
      </div>
      <div class="match-teams">
        <div class="team">
          <div class="team-logo-wrap">${homeLogo}<span class="team-name">${f.teams.home.name}</span></div>
        </div>
        <div class="vs-badge">${done ? scoreStr : 'VS'}</div>
        <div class="team away">
          <div class="team-logo-wrap">${awayLogo}<span class="team-name">${f.teams.away.name}</span></div>
        </div>
      </div>
      ${!done ? `
        <div class="prob-labels">
          <span>${f.teams.home.name.split(' ')[0]}</span>
          <span>Empate</span>
          <span>${f.teams.away.name.split(' ')[0]}</span>
        </div>
        <div class="prob-bar">
          <div class="pb-h" style="flex:${(p.h * 100).toFixed(0)}"></div>
          <div class="pb-d" style="flex:${(p.d * 100).toFixed(0)}"></div>
          <div class="pb-a" style="flex:${(p.a * 100).toFixed(0)}"></div>
        </div>
        <div class="prob-vals">
          <span class="pv-h">${(p.h * 100).toFixed(0)}%</span>
          <span class="pv-d">${(p.d * 100).toFixed(0)}%</span>
          <span class="pv-a">${(p.a * 100).toFixed(0)}%</span>
        </div>` : ''}
    </div>`;
}

// ─── DETALLE DEL PARTIDO ──────────────────────────────────────────────────────
async function showDetail(fixtureId) {
  const mc = document.getElementById('main-content');
  mc.innerHTML = `
    <button class="btn btn-sm" onclick="renderFixtureList()" style="margin-bottom:16px">← Volver</button>
    <div class="loader"><div class="spinner"></div><span>Cargando análisis completo...</span></div>`;

  const f = allFixtures.find(x => String(x.fixture.id) === String(fixtureId));
  if (!f) return;

  try {
    const season = new Date().getFullYear();

    // Peticiones en paralelo para optimizar cuota
    const [h2hData, homeStand, awayStand] = await Promise.all([
      apiFetch(`/fixtures/headtohead?h2h=${f.teams.home.id}-${f.teams.away.id}&last=5`).catch(() => ({ response: [] })),
      apiFetch(`/standings?league=${f._leagueId}&season=${season}&team=${f.teams.home.id}`).catch(() => ({ response: [] })),
      apiFetch(`/standings?league=${f._leagueId}&season=${season}&team=${f.teams.away.id}`).catch(() => ({ response: [] })),
    ]);

    // Estadísticas de clasificación
    const hStats = getStandingStats(homeStand, f.teams.home.id);
    const aStats = getStandingStats(awayStand,  f.teams.away.id);

    // Predicción con datos reales
    const p = predict(
      f.teams.home.name, f.teams.away.name,
      hStats.goalsFor, aStats.goalsFor,
      hStats.goalsAgainst, aStats.goalsAgainst,
      hStats.form, aStats.form
    );

    // H2H
    const h2h = (h2hData.response || []).slice(0, 5).map(fx => {
      const hg = fx.goals.home ?? '?', ag = fx.goals.away ?? '?';
      const w  = hg > ag ? 'home' : hg < ag ? 'away' : 'draw';
      return {
        date:  new Date(fx.fixture.date).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
        home:  fx.teams.home.name,
        away:  fx.teams.away.name,
        score: `${hg}-${ag}`,
        w,
      };
    });

    const h2hHome = h2h.filter(x => x.w === 'home' && x.home === f.teams.home.name).length;
    const h2hDraw = h2h.filter(x => x.w === 'draw').length;
    const h2hAway = h2h.filter(x => x.w === 'away' && x.away === f.teams.away.name).length;

    const status = f.fixture.status.short;
    const done   = isDone(status);
    const live   = isLive(status);
    const scoreStr = `${f.goals.home ?? '?'} — ${f.goals.away ?? '?'}`;

    const homeLogo = f.teams.home.logo ? `<img src="${f.teams.home.logo}" style="width:44px;height:44px;object-fit:contain" onerror="this.style.display='none'" alt="">` : '';
    const awayLogo = f.teams.away.logo ? `<img src="${f.teams.away.logo}" style="width:44px;height:44px;object-fit:contain" onerror="this.style.display='none'" alt="">` : '';

    const winnerClass = w => p.winner === w ? ' winner' : '';

    let html = `
      <button class="btn btn-sm" onclick="renderFixtureList()" style="margin-bottom:16px">← Volver</button>

      <div class="detail">
        <div class="detail-header">
          <div style="font-size:12px;color:var(--text3);margin-bottom:8px">
            ${f._leagueInfo?.flag || '⚽'} ${f.league.name} · ${f.league.round || ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:10px">
            ${homeLogo}
            <div class="detail-teams">${f.teams.home.name} <span style="color:var(--text3)">vs</span> ${f.teams.away.name}</div>
            ${awayLogo}
          </div>
          ${done ? `<div style="font-family:var(--font-display);font-size:40px;color:var(--green)">${scoreStr} <span style="font-size:14px;color:var(--text3);font-family:var(--font-body)">Finalizado</span></div>` : ''}
          ${live ? `<div style="font-family:var(--font-display);font-size:40px;color:var(--red)">${scoreStr} <span class="live-badge">EN VIVO</span></div>` : ''}
        </div>

        ${!done ? `
        <div style="font-size:12px;color:var(--text3);margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">Predicción del modelo</div>
        <div class="big-probs">
          <div class="big-prob${winnerClass('home')}">
            <div class="big-prob-label">${f.teams.home.name}</div>
            <div class="big-prob-val">${(p.h * 100).toFixed(0)}%</div>
            <div class="big-prob-odd">Cuota impl. ${p.oddH}</div>
          </div>
          <div class="big-prob${winnerClass('draw')}">
            <div class="big-prob-label">Empate</div>
            <div class="big-prob-val">${(p.d * 100).toFixed(0)}%</div>
            <div class="big-prob-odd">Cuota impl. ${p.oddD}</div>
          </div>
          <div class="big-prob${winnerClass('away')}">
            <div class="big-prob-label">${f.teams.away.name}</div>
            <div class="big-prob-val">${(p.a * 100).toFixed(0)}%</div>
            <div class="big-prob-odd">Cuota impl. ${p.oddA}</div>
          </div>
        </div>` : ''}

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Goles esperados</div>
            <div class="stat-val">${p.lambdaH.toFixed(1)} – ${p.lambdaA.toFixed(1)}</div>
            <div class="stat-sub">λ local / visitante (Poisson)</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total goles</div>
            <div class="stat-val">${p.expGoals.toFixed(1)}</div>
            <div class="stat-sub">Over 2.5: ${(p.over25 * 100).toFixed(0)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Ambos marcan</div>
            <div class="stat-val">${(p.btts * 100).toFixed(0)}%</div>
            <div class="stat-sub">BTTS — basado en promedios</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">H2H reciente</div>
            <div class="stat-val">${h2hHome}V ${h2hDraw}E ${h2hAway}D</div>
            <div class="stat-sub">Últimos ${h2h.length} enfrentamientos</div>
          </div>
        </div>

        ${h2h.length ? `
        <div style="margin-bottom:16px">
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Historial H2H</div>
          ${h2h.map(x => {
            const wc = x.w === 'home' && x.home === f.teams.home.name ? 'hw'
                     : x.w === 'draw' ? 'hd' : 'hl';
            return `<div class="h2h-row">
              <span class="h2h-date">${x.date}</span>
              <span class="h2h-teams-txt">${x.home} vs ${x.away}</span>
              <span class="h2h-score ${wc}">${x.score}</span>
            </div>`;
          }).join('')}
        </div>` : ''}

        ${!done ? `
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Confianza del modelo</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width:${(p.conf * 100).toFixed(0)}%"></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <span class="badge-conf badge-${p.confClass}">⬡ ${p.confLabel}</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">${(p.conf * 100).toFixed(0)}% certeza</span>
        </div>
        <div class="prediction-box">
          <div class="pred-label">✦ Apuesta recomendada</div>
          <div class="pred-value">${p.best}</div>
          <div class="pred-sub">Basado en clasificación real, H2H y distribución de Poisson</div>
        </div>` : ''}
      </div>

      <!-- Registrar apuesta -->
      <div class="detail">
        <div style="font-size:13px;font-weight:600;margin-bottom:12px">Registrar apuesta</div>
        <div class="form-row">
          <div>
            <div class="field-label">Mercado</div>
            <select id="bet-market">
              <option>1X2 — ${f.teams.home.name}</option>
              <option>1X2 — Empate</option>
              <option>1X2 — ${f.teams.away.name}</option>
              <option>Over 2.5 goles</option>
              <option>Under 2.5 goles</option>
              <option>BTTS — Sí</option>
              <option>BTTS — No</option>
              <option>Doble oportunidad 1X</option>
              <option>Doble oportunidad X2</option>
            </select>
          </div>
          <div>
            <div class="field-label">Cuota</div>
            <input type="number" id="bet-odd" placeholder="ej. 1.85" step="0.01" min="1">
          </div>
        </div>
        <div class="form-row">
          <div>
            <div class="field-label">Stake ($)</div>
            <input type="number" id="bet-stake" placeholder="ej. 10" min="0">
          </div>
          <div>
            <div class="field-label">Resultado</div>
            <select id="bet-result-sel">
              <option value="P">Pendiente</option>
              <option value="W">Ganada ✓</option>
              <option value="L">Perdida ✗</option>
            </select>
          </div>
        </div>
        <button class="btn btn-green"
          onclick="addBet(${f.fixture.id}, '${f.teams.home.name.replace(/'/g,"\\'")}', '${f.teams.away.name.replace(/'/g,"\\'")}', '${f.league.name.replace(/'/g,"\\'")}')">
          + Guardar apuesta
        </button>
      </div>`;

    mc.innerHTML = html;

  } catch (e) {
    mc.innerHTML = `
      <button class="btn btn-sm" onclick="renderFixtureList()" style="margin-bottom:16px">← Volver</button>
      <div class="error-box">⚠️ Error al cargar detalle: ${e.message}</div>`;
  }
}

// ─── TRACKER DE APUESTAS ──────────────────────────────────────────────────────
function addBet(fid, home, away, league) {
  const market = document.getElementById('bet-market').value;
  const odd    = parseFloat(document.getElementById('bet-odd').value);
  const stake  = parseFloat(document.getElementById('bet-stake').value);
  const result = document.getElementById('bet-result-sel').value;

  if (!odd || !stake || isNaN(odd) || isNaN(stake)) {
    alert('Completa la cuota y el stake antes de guardar.');
    return;
  }

  bets.unshift({
    id: Date.now(), fid, home, away, league, market, odd, stake, result,
    date: new Date().toLocaleDateString('es-CO'),
  });

  try { localStorage.setItem('scout_bets', JSON.stringify(bets)); } catch (e) {}
  alert('✓ Apuesta guardada correctamente');
}

function updateBetResult(betId, newResult) {
  const bet = bets.find(b => b.id === betId);
  if (bet) {
    bet.result = newResult;
    try { localStorage.setItem('scout_bets', JSON.stringify(bets)); } catch (e) {}
    renderTracker();
  }
}

function renderTracker() {
  const mc = document.getElementById('main-content');

  const won     = bets.filter(b => b.result === 'W');
  const lost    = bets.filter(b => b.result === 'L');
  const pending = bets.filter(b => b.result === 'P');
  const settled = bets.filter(b => b.result !== 'P');

  const totalStake  = bets.reduce((a, b) => a + b.stake, 0);
  const totalReturn = won.reduce((a, b) => a + b.stake * b.odd, 0);
  const profit      = totalReturn - totalStake;
  const roi         = totalStake > 0 ? (profit / totalStake * 100) : 0;
  const winRate     = settled.length > 0 ? (won.length / settled.length * 100) : 0;

  let html = `
    <div class="section-header">
      <div class="section-title">Mis apuestas</div>
    </div>
    <div class="stats-summary">
      <div class="sum-card">
        <div class="sum-val" style="color:var(--green)">${won.length}</div>
        <div class="sum-label">Ganadas</div>
      </div>
      <div class="sum-card">
        <div class="sum-val" style="color:var(--red)">${lost.length}</div>
        <div class="sum-label">Perdidas</div>
      </div>
      <div class="sum-card">
        <div class="sum-val" style="color:${roi >= 0 ? 'var(--green)' : 'var(--red)'}">${roi.toFixed(1)}%</div>
        <div class="sum-label">ROI</div>
      </div>
      <div class="sum-card">
        <div class="sum-val">${winRate.toFixed(0)}%</div>
        <div class="sum-label">Acierto</div>
      </div>
    </div>`;

  if (!bets.length) {
    html += '<div class="empty">Aún no hay apuestas registradas.<br>Analiza un partido y guarda tu primera apuesta.</div>';
    mc.innerHTML = html;
    return;
  }

  html += `
    <div class="detail">
      <div style="display:grid;grid-template-columns:1fr 1fr 80px 80px auto;gap:8px;
        font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;
        padding-bottom:8px;border-bottom:1px solid var(--border)">
        <span>Partido</span><span>Mercado</span><span>Cuota</span><span>P&L</span><span>Resultado</span>
      </div>`;

  bets.forEach(b => {
    const pl    = b.result === 'W' ? `+$${(b.stake * (b.odd - 1)).toFixed(2)}`
                : b.result === 'L' ? `-$${b.stake.toFixed(2)}`
                : `$${b.stake.toFixed(2)}`;
    const plColor = b.result === 'W' ? 'var(--green)' : b.result === 'L' ? 'var(--red)' : 'var(--text3)';

    html += `
      <div class="tracker-row">
        <span style="font-size:12px;color:var(--text2)">${b.home} vs ${b.away}</span>
        <span style="font-size:12px;color:var(--text3)">${b.market}</span>
        <span style="font-family:var(--font-mono)">${b.odd}</span>
        <span style="font-family:var(--font-mono);color:${plColor}">${pl}</span>
        <div>
          ${b.result === 'P' ? `
            <select onchange="updateBetResult(${b.id}, this.value)"
              style="padding:3px 6px;font-size:11px;width:auto">
              <option value="P" selected>⏳ Pendiente</option>
              <option value="W">✓ Ganada</option>
              <option value="L">✗ Perdida</option>
            </select>` : `
            <span class="bet-badge bet-${b.result}">
              ${b.result === 'W' ? '✓ Ganada' : '✗ Perdida'}
            </span>`}
        </div>
      </div>`;
  });

  html += '</div>';
  mc.innerHTML = html;
}

// ─── INICIO ───────────────────────────────────────────────────────────────────
checkStatus();
loadFixtures();
