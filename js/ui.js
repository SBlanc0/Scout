const UI = {
  mc() {
    return document.getElementById('mc');
  },

  setContent(html) {
    this.mc().innerHTML = html;
  },

  loader(message = 'Cargando...') {
    this.setContent(`<div class="loader"><div class="spinner"></div><span>${message}</span></div>`);
  },

  error(message) {
    this.setContent(`
      <div class="error-box">
        ${message}<br>
        <small>Revisa la ruta o intenta volver al dashboard.</small>
      </div>
    `);
  },

  formatMatchDate(date) {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  pct(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  renderDashboard() {
    const topMatches = WorldCupData.matches.slice(0, 4);
    const rankings = this.getPowerRanking();
    const featured = topMatches.map(match => PredictionCard.render(match, { compact: true })).join('');

    this.setContent(`
      <section class="hero-panel">
        <div>
          <div class="eyebrow">Scout Predictor World Cup 2026</div>
          <h1>Predicciones, grupos y valor esperado para el Mundial.</h1>
          <p>Un MVP enfocado en responder rápido quién gana, quién clasifica y dónde puede haber valor para apostar.</p>
        </div>
        <div class="hero-stats">
          <div><strong>${WorldCupData.teams.length}</strong><span>Selecciones</span></div>
          <div><strong>${WorldCupData.matches.length}</strong><span>Partidos seed</span></div>
          <div><strong>${CONFIG.SIMULATION_ITERATIONS.toLocaleString('es-CO')}</strong><span>Simulaciones objetivo</span></div>
        </div>
      </section>

      <div class="dashboard-grid">
        <section>
          <div class="section-header">
            <div class="section-title">Próximos partidos</div>
            <a class="section-link" href="#/partidos">Ver todos</a>
          </div>
          <div class="prediction-grid">${featured}</div>
        </section>

        <aside>
          <div class="section-header">
            <div class="section-title">Favoritos Elo</div>
            <a class="section-link" href="#/ranking">Ranking</a>
          </div>
          <div class="ranking-list">
            ${rankings.slice(0, 6).map((team, index) => this.rankingRow(team, index + 1)).join('')}
          </div>
        </aside>
      </div>

      <section>
        <div class="section-header">
          <div class="section-title">Predicciones destacadas</div>
          <span class="section-sub">Poisson + forma + Elo</span>
        </div>
        <div class="insight-grid">
          ${this.renderInsights()}
        </div>
      </section>
    `);
  },

  renderInsights() {
    return WorldCupData.matches.slice(0, 3).map(match => {
      const { home, away } = WorldCupData.getMatchTeams(match);
      const prediction = Engine.predict(home, away);
      const topScore = prediction.scorelines[0];
      return `
        <div class="insight-card">
          <div class="label">${home.shortName} vs ${away.shortName}</div>
          <div class="insight-main">${prediction.best}</div>
          <div class="insight-sub">
            Marcador probable ${topScore.homeGoals}-${topScore.awayGoals} · BTTS ${this.pct(prediction.btts)} · Over 2.5 ${this.pct(prediction.over25)}
          </div>
        </div>
      `;
    }).join('');
  },

  renderMatches() {
    this.setContent(`
      <div class="section-header">
        <div>
          <div class="section-title">Partidos</div>
          <div class="section-sub">Calendario inicial de trabajo para el MVP</div>
        </div>
      </div>
      <div class="prediction-grid wide">
        ${WorldCupData.matches.map(match => PredictionCard.render(match)).join('')}
      </div>
    `);
  },

  renderMatchDetail(matchId) {
    const match = WorldCupData.matchById(matchId);
    if (!match) return this.error('No encontré ese partido.');

    const { home, away } = WorldCupData.getMatchTeams(match);
    const prediction = Engine.predict(home, away);
    const scorelines = prediction.scorelines.slice(0, 3).map(score => `
      <div class="scoreline">
        <strong>${score.homeGoals}-${score.awayGoals}</strong>
        <span>${this.pct(score.probability, 1)}</span>
      </div>
    `).join('');

    this.setContent(`
      <button class="btn btn-sm" onclick="location.hash='#/partidos'" style="margin-bottom:14px">Volver</button>

      <section class="match-detail">
        <div class="detail-header">
          <div class="label">${match.stage} · Grupo ${match.group} · ${match.venue}</div>
          <div class="detail-title">
            <span>${home.flag} ${home.name}</span>
            <span class="text-faint">vs</span>
            <span>${away.flag} ${away.name}</span>
          </div>
          <div class="section-sub">${this.formatMatchDate(match.date)}</div>
        </div>

        <div class="big-probs">
          <div class="big-prob${prediction.winner === 'home' ? ' winner' : ''}">
            <div class="big-prob-label">${home.name}</div>
            <div class="big-prob-val">${this.pct(prediction.h)}</div>
            <div class="big-prob-odd">Cuota justa ${prediction.oddH}</div>
          </div>
          <div class="big-prob${prediction.winner === 'draw' ? ' winner' : ''}">
            <div class="big-prob-label">Empate</div>
            <div class="big-prob-val">${this.pct(prediction.d)}</div>
            <div class="big-prob-odd">Cuota justa ${prediction.oddD}</div>
          </div>
          <div class="big-prob${prediction.winner === 'away' ? ' winner' : ''}">
            <div class="big-prob-label">${away.name}</div>
            <div class="big-prob-val">${this.pct(prediction.a)}</div>
            <div class="big-prob-odd">Cuota justa ${prediction.oddA}</div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <div class="section-title">Marcadores probables</div>
            <div class="scoreline-list">${scorelines}</div>
          </div>
          <div class="card">
            <div class="section-title">Mercados</div>
            <div class="market-row"><span>BTTS Sí</span><strong>${this.pct(prediction.btts)}</strong></div>
            <div class="market-row"><span>BTTS No</span><strong>${this.pct(1 - prediction.btts)}</strong></div>
            <div class="market-row"><span>Over 2.5</span><strong>${this.pct(prediction.over25)}</strong></div>
            <div class="market-row"><span>Under 2.5</span><strong>${this.pct(1 - prediction.over25)}</strong></div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Valor esperado</div>
          <div class="form-row">
            <div>
              <label class="field-label">Mercado</label>
              <select id="bm">
                <option value="HOME_WIN">${home.name}</option>
                <option value="DRAW">Empate</option>
                <option value="AWAY_WIN">${away.name}</option>
                <option value="OVER_25">Over 2.5</option>
                <option value="UNDER_25">Under 2.5</option>
                <option value="BTTS_YES">BTTS Sí</option>
                <option value="BTTS_NO">BTTS No</option>
              </select>
            </div>
            <div>
              <label class="field-label">Cuota de la casa</label>
              <input type="number" id="b-odd" placeholder="ej. 1.85" step="0.01" min="1.01" oninput="UI.updateBetEV(${this.escapeAttr(prediction)})">
            </div>
          </div>
          <div id="bet-ev-preview"></div>
        </div>
      </section>
    `);
  },

  escapeAttr(value) {
    return JSON.stringify(value).replace(/"/g, '&quot;');
  },

  updateBetEV(prediction) {
    const odd = parseFloat(document.getElementById('b-odd')?.value);
    const market = document.getElementById('bm')?.value;
    const container = document.getElementById('bet-ev-preview');
    if (!container || !odd || odd <= 1 || !market) return;

    const probability = Engine.getMarketProb(prediction, market);
    const evData = EV.calculate(probability, odd);
    container.innerHTML = `
      <div class="ev-preview ${evData.hasValue ? 'positive' : 'negative'}">
        <span>${evData.hasValue ? 'Con valor' : 'Sin valor'} · EV ${evData.evPct > 0 ? '+' : ''}${evData.evPct}%</span>
        <span>Cuota justa ${evData.fairOdd}</span>
      </div>
    `;
  },

  renderTeams() {
    this.setContent(`
      <div class="section-header">
        <div>
          <div class="section-title">Selecciones</div>
          <div class="section-sub">Páginas individuales listas para enriquecer con datos reales</div>
        </div>
      </div>
      <div class="team-grid">
        ${this.getPowerRanking().map(team => this.teamCard(team)).join('')}
      </div>
    `);
  },

  teamCard(team) {
    return `
      <article class="team-card" onclick="location.hash='#/equipo/${team.id}'">
        <div class="team-card-head">
          <span class="team-card-flag">${team.flag}</span>
          <div>
            <strong>${team.name}</strong>
            <span>Grupo ${team.group} · ${team.confederation}</span>
          </div>
        </div>
        <div class="metric-line"><span>Elo</span><strong>${team.elo}</strong></div>
        <div class="metric-line"><span>Ranking FIFA</span><strong>${team.fifaRank}</strong></div>
        <div class="form-dots">${team.form.map(result => `<span class="form-${result}">${result}</span>`).join('')}</div>
      </article>
    `;
  },

  renderTeamDetail(teamId) {
    const team = WorldCupData.teamById(teamId);
    if (!team) return this.error('No encontré esa selección.');

    const matches = WorldCupData.matches.filter(match => match.homeTeamId === teamId || match.awayTeamId === teamId);
    const groupTeams = WorldCupData.teams.filter(item => item.group === team.group).sort((a, b) => b.elo - a.elo);

    this.setContent(`
      <button class="btn btn-sm" onclick="location.hash='#/equipos'" style="margin-bottom:14px">Volver</button>

      <section class="team-profile">
        <div class="team-profile-head">
          <div class="team-profile-flag">${team.flag}</div>
          <div>
            <div class="eyebrow">Grupo ${team.group} · ${team.confederation}</div>
            <h1>${team.name}</h1>
            <div class="section-sub">Elo ${team.elo} · Ranking FIFA ${team.fifaRank}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Goles por partido</div><div class="stat-val">${team.goalsFor.toFixed(2)}</div></div>
          <div class="stat-card"><div class="stat-label">Goles recibidos</div><div class="stat-val">${team.goalsAgainst.toFixed(2)}</div></div>
          <div class="stat-card"><div class="stat-label">Forma</div><div class="form-dots">${team.form.map(result => `<span class="form-${result}">${result}</span>`).join('')}</div></div>
          <div class="stat-card"><div class="stat-label">Posición grupo por Elo</div><div class="stat-val">${groupTeams.findIndex(item => item.id === team.id) + 1}</div></div>
        </div>

        <div class="section-header">
          <div class="section-title">Próximos partidos</div>
        </div>
        <div class="prediction-grid">${matches.map(match => PredictionCard.render(match, { compact: true })).join('')}</div>
      </section>
    `);
  },

  renderGroups() {
    const groups = WorldCupData.teamsByGroup();
    this.setContent(`
      <div class="section-header">
        <div>
          <div class="section-title">Grupos</div>
          <div class="section-sub">Clasificación automática inicial por rating Elo</div>
        </div>
      </div>
      <div class="groups-grid">
        ${Object.keys(groups).sort().map(group => this.groupTable(group, groups[group])).join('')}
      </div>
    `);
  },

  groupTable(group, teams) {
    const rows = [...teams].sort((a, b) => b.elo - a.elo).map((team, index) => `
      <tr onclick="location.hash='#/equipo/${team.id}'">
        <td>${index + 1}</td>
        <td>${team.flag} ${team.name}</td>
        <td>${team.elo}</td>
        <td>${index < 2 ? 'Clasifica' : 'Riesgo'}</td>
      </tr>
    `).join('');

    return `
      <section class="group-card">
        <div class="section-title">Grupo ${group}</div>
        <table class="group-table">
          <thead><tr><th>#</th><th>Equipo</th><th>Elo</th><th>Estado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  },

  renderRanking() {
    this.setContent(`
      <div class="section-header">
        <div>
          <div class="section-title">Ranking Elo</div>
          <div class="section-sub">Base inicial para alimentar Poisson y simulador</div>
        </div>
      </div>
      <div class="ranking-list large">
        ${this.getPowerRanking().map((team, index) => this.rankingRow(team, index + 1)).join('')}
      </div>
    `);
  },

  getPowerRanking() {
    return [...WorldCupData.teams].sort((a, b) => b.elo - a.elo);
  },

  rankingRow(team, rank) {
    return `
      <div class="ranking-row" onclick="location.hash='#/equipo/${team.id}'">
        <span class="rank-number">${rank}</span>
        <span class="team-flag">${team.flag}</span>
        <strong>${team.name}</strong>
        <span>Grupo ${team.group}</span>
        <span class="text-mono">${team.elo}</span>
      </div>
    `;
  },

  renderSimulator() {
    const favorites = this.getPowerRanking().slice(0, 6);
    const total = favorites.reduce((sum, team) => sum + Math.pow(team.elo, 4), 0);

    this.setContent(`
      <div class="section-header">
        <div>
          <div class="section-title">Simulador del Mundial</div>
          <div class="section-sub">Estructura preparada para Monte Carlo de 10.000 iteraciones</div>
        </div>
      </div>
      <section class="card">
        <div class="simulator-placeholder">
          <div>
            <div class="eyebrow">Próxima fase</div>
            <h2>El motor de torneo se conectará aquí.</h2>
            <p>Esta pantalla ya reserva el espacio para probabilidades de octavos, cuartos, semifinal, final y campeón.</p>
          </div>
          <button class="btn btn-green" disabled>Simular torneo</button>
        </div>
      </section>
      <div class="section-header" style="margin-top:18px">
        <div class="section-title">Probabilidad aproximada de campeón</div>
        <span class="section-sub">Placeholder por Elo</span>
      </div>
      <div class="ranking-list large">
        ${favorites.map((team, index) => {
          const probability = Math.pow(team.elo, 4) / total;
          return `
            <div class="ranking-row">
              <span class="rank-number">${index + 1}</span>
              <span class="team-flag">${team.flag}</span>
              <strong>${team.name}</strong>
              <span>Campeón</span>
              <span class="text-mono">${this.pct(probability, 1)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `);
  },
};
