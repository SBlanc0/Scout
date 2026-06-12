const Tracker = {
  STORAGE_KEY: 'scout_bets_v2',

  load() {
    try {
      const bets = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      return Array.isArray(bets) ? bets : [];
    } catch (error) {
      return [];
    }
  },

  save(bets) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bets));
    } catch (error) {}
  },

  calcStats(bets) {
    const won = bets.filter(bet => bet.result === 'W');
    const lost = bets.filter(bet => bet.result === 'L');
    const pending = bets.filter(bet => bet.result === 'P');
    const settled = bets.filter(bet => bet.result !== 'P');
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalReturn = won.reduce((sum, bet) => sum + bet.stake * bet.odd, 0);
    const profit = totalReturn - totalStake;
    const roi = totalStake > 0 ? profit / totalStake * 100 : 0;
    const winRate = settled.length ? won.length / settled.length * 100 : 0;

    return {
      won: won.length,
      lost: lost.length,
      pending: pending.length,
      totalStake,
      profit,
      roi,
      winRate,
    };
  },

  updateResult(betId, result) {
    const bets = this.load();
    const bet = bets.find(item => item.id === betId);
    if (!bet) return;
    bet.result = result;
    this.save(bets);
    this.render();
  },

  delete(betId) {
    if (!confirm('¿Eliminar esta apuesta?')) return;
    this.save(this.load().filter(bet => bet.id !== betId));
    this.render();
  },

  render() {
    const bets = this.load();
    const stats = this.calcStats(bets);

    let html = `
      <div class="section-header">
        <div>
          <div class="section-title">Mis apuestas</div>
          <div class="section-sub">Tracker local para ROI y P&L</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card"><div class="summary-val text-green">${stats.won}</div><div class="summary-label">Ganadas</div></div>
        <div class="summary-card"><div class="summary-val text-red">${stats.lost}</div><div class="summary-label">Perdidas</div></div>
        <div class="summary-card"><div class="summary-val" style="color:${stats.roi >= 0 ? 'var(--green)' : 'var(--red)'}">${stats.roi.toFixed(1)}%</div><div class="summary-label">ROI</div></div>
        <div class="summary-card"><div class="summary-val" style="color:${stats.profit >= 0 ? 'var(--green)' : 'var(--red)'}">${stats.profit >= 0 ? '+' : ''}$${stats.profit.toFixed(2)}</div><div class="summary-label">P&L</div></div>
      </div>
    `;

    if (!bets.length) {
      html += '<div class="empty">Aún no hay apuestas registradas.</div>';
      document.getElementById('mc').innerHTML = html;
      return;
    }

    html += `
      <div class="tracker-table">
        <div class="tracker-header">
          <span>Partido</span>
          <span>Mercado</span>
          <span>Cuota</span>
          <span>P&L</span>
          <span>Resultado</span>
        </div>
        ${bets.map(bet => this.renderRow(bet)).join('')}
      </div>
    `;

    document.getElementById('mc').innerHTML = html;
  },

  renderRow(bet) {
    const pl = bet.result === 'W'
      ? `+$${(bet.stake * (bet.odd - 1)).toFixed(2)}`
      : bet.result === 'L'
        ? `-$${bet.stake.toFixed(2)}`
        : `$${bet.stake.toFixed(2)}`;
    const color = bet.result === 'W' ? 'var(--green)' : bet.result === 'L' ? 'var(--red)' : 'var(--text3)';

    return `
      <div class="tracker-row">
        <div>
          <div style="font-size:12px;color:var(--text)">${bet.home} vs ${bet.away}</div>
          <div style="font-size:10px;color:var(--text3)">${bet.competition || 'Mundial 2026'} · ${bet.date}</div>
        </div>
        <span style="color:var(--text2);font-size:12px">${bet.market}</span>
        <span class="text-mono">${bet.odd}</span>
        <span class="text-mono" style="color:${color}">${pl}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <select onchange="Tracker.updateResult(${bet.id}, this.value)" style="padding:3px 6px;font-size:11px;width:auto">
            <option value="P" ${bet.result === 'P' ? 'selected' : ''}>Pendiente</option>
            <option value="W" ${bet.result === 'W' ? 'selected' : ''}>Ganada</option>
            <option value="L" ${bet.result === 'L' ? 'selected' : ''}>Perdida</option>
          </select>
          <button onclick="Tracker.delete(${bet.id})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:14px;padding:2px">×</button>
        </div>
      </div>
    `;
  },
};
