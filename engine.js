// ─── MOTOR DE PREDICCIÓN — DISTRIBUCIÓN DE POISSON ───────────────────────────
// Predice probabilidades de resultado basándose en:
//   - Promedio de goles a favor y en contra de cada equipo (de la clasificación)
//   - Forma reciente (últimos 5 partidos) como multiplicador
//   - Ventaja de jugar en casa (+15% en ataque)

function factorial(n) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonP(lambda, k) {
  const l = Math.max(lambda, 0.01);
  return (Math.pow(l, k) * Math.exp(-l)) / factorial(k);
}

// Convierte la forma (ej. ['W','D','W','L','W']) en un multiplicador 0.7–1.3
// Los partidos más recientes tienen más peso
function formMultiplier(form) {
  const pts = { W: 3, D: 1, L: 0 };
  if (!form || form.length === 0) return 1.0;
  const weighted = form.reduce((acc, r, i) => acc + pts[r] * (i + 1), 0);
  const maxWeighted = form.reduce((acc, _, i) => acc + 3 * (i + 1), 0);
  return 0.7 + 0.6 * (weighted / maxWeighted);
}

/**
 * predict(homeStats, awayStats)
 *
 * @param {string} homeName
 * @param {string} awayName
 * @param {number} homeGoalsFor     - Promedio goles a favor local por partido
 * @param {number} awayGoalsFor     - Promedio goles a favor visitante por partido
 * @param {number} homeGoalsAgainst - Promedio goles en contra local por partido
 * @param {number} awayGoalsAgainst - Promedio goles en contra visitante por partido
 * @param {string[]} homeForm       - Forma reciente local  ['W','D','W','W','L']
 * @param {string[]} awayForm       - Forma reciente visitante
 * @returns {object} Predicciones completas
 */
function predict(homeName, awayName, homeGoalsFor, awayGoalsFor, homeGoalsAgainst, awayGoalsAgainst, homeForm, awayForm) {
  const hMult = formMultiplier(homeForm);
  const aMult = formMultiplier(awayForm);

  // λ (lambda) = goles esperados por equipo
  // Local tiene ventaja de casa (+15% ataque)
  const lambdaH = Math.max(0.3, (homeGoalsFor   || 1.4) * hMult * (1 / (awayGoalsAgainst || 1.2)) * 1.15);
  const lambdaA = Math.max(0.3, (awayGoalsFor   || 1.1) * aMult * (1 / (homeGoalsAgainst || 1.1)));

  // Calcular probabilidades 1X2 sumando la distribución de Poisson
  let pH = 0, pD = 0, pA = 0;
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 7; j++) {
      const p = poissonP(lambdaH, i) * poissonP(lambdaA, j);
      if (i > j)      pH += p;
      else if (i === j) pD += p;
      else              pA += p;
    }
  }

  // Normalizar
  const tot = pH + pD + pA;
  const h = pH / tot, d = pD / tot, a = pA / tot;

  // Mercados adicionales
  let btts = 0, over25 = 0;
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 7; j++) {
      const p = poissonP(lambdaH, i) * poissonP(lambdaA, j);
      if (i > 0 && j > 0) btts   += p;
      if (i + j > 2.5)    over25 += p;
    }
  }

  const conf = Math.max(h, d, a);
  const confLabel = conf > 0.55 ? 'Alta' : conf > 0.42 ? 'Media' : 'Baja';
  const confClass = conf > 0.55 ? 'high' : conf > 0.42 ? 'med'  : 'low';

  const winner = h > a && h > d ? 'home' : a > h && a > d ? 'away' : 'draw';
  const winnerName = winner === 'home' ? homeName : winner === 'away' ? awayName : 'Empate';

  // Apuesta recomendada según las probabilidades
  let best;
  if (conf > 0.52)      best = `1X2: Victoria ${winnerName}`;
  else if (over25 > 0.55) best = 'Over 2.5 goles';
  else if (btts > 0.55)   best = 'BTTS — Ambos marcan';
  else                    best = `Doble oportunidad: ${h > a ? '1X' : 'X2'}`;

  return {
    h, d, a,
    lambdaH, lambdaA,
    expGoals: lambdaH + lambdaA,
    btts, over25,
    conf, confLabel, confClass,
    winner, winnerName, best,
    oddH: (1 / h).toFixed(2),
    oddD: (1 / d).toFixed(2),
    oddA: (1 / a).toFixed(2),
  };
}

// ─── PARSEO DE CLASIFICACIÓN ──────────────────────────────────────────────────
// Extrae goles promedio y forma de la respuesta de /standings
function getStandingStats(standData, teamId) {
  try {
    for (const lg of standData.response) {
      for (const group of lg.league.standings) {
        const team = group.find(t => t.team.id === teamId);
        if (team) {
          const played = team.all.played || 1;
          return {
            goalsFor:      team.all.goals.for    / played,
            goalsAgainst:  team.all.goals.against / played,
            form: team.form ? team.form.split('').slice(-5) : [],
          };
        }
      }
    }
  } catch (e) {}
  // Valores por defecto si no hay datos de clasificación
  return { goalsFor: 1.3, goalsAgainst: 1.2, form: [] };
}
