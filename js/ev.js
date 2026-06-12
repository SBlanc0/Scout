const EV = {
  calculate(probability, bookmakerOdd) {
    const ev = probability * bookmakerOdd - 1;
    return {
      ev,
      evPct: (ev * 100).toFixed(1),
      hasValue: ev > 0,
      fairOdd: (1 / probability).toFixed(2),
      edge: ((bookmakerOdd - (1 / probability)) / (1 / probability) * 100).toFixed(1),
    };
  },

  kelly(probability, bookmakerOdd) {
    const b = bookmakerOdd - 1;
    const p = probability;
    const q = 1 - p;
    const full = (p * b - q) / b;
    return {
      full: Math.max(0, full),
      half: Math.max(0, full / 2),
      quarter: Math.max(0, full / 4),
      fullPct: (Math.max(0, full) * 100).toFixed(1),
      halfPct: (Math.max(0, full / 2) * 100).toFixed(1),
      quarterPct: (Math.max(0, full / 4) * 100).toFixed(1),
    };
  },

  profit(stake, bookmakerOdd) {
    return {
      gross: (stake * bookmakerOdd).toFixed(2),
      net: (stake * (bookmakerOdd - 1)).toFixed(2),
    };
  },

  renderCalculator() {
    return `
      <div class="ev-card">
        <h2 class="section-title" style="margin-bottom:4px">Calculadora de Valor Esperado</h2>
        <p style="color:var(--text2);font-size:13px;margin-bottom:20px">
          Compara la probabilidad del modelo con la cuota de la casa para detectar apuestas con valor.
        </p>

        <div class="form-row">
          <div class="form-group">
            <label class="field-label">Probabilidad del modelo (%)</label>
            <div style="display:flex;align-items:center;gap:10px">
              <input type="range" id="ev-prob-range" min="1" max="99" value="55"
                oninput="document.getElementById('ev-prob-num').value=this.value;EV.update()">
              <input type="number" id="ev-prob-num" value="55" min="1" max="99" style="width:70px"
                oninput="document.getElementById('ev-prob-range').value=this.value;EV.update()">
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">Cuota decimal</label>
            <input type="number" id="ev-odd" value="1.85" step="0.01" min="1.01" oninput="EV.update()">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="field-label">Stake ($)</label>
            <input type="number" id="ev-stake" value="10" min="0" oninput="EV.update()">
          </div>
          <div class="form-group">
            <label class="field-label">Bankroll total ($)</label>
            <input type="number" id="ev-bankroll" value="100" min="0" oninput="EV.update()">
          </div>
        </div>

        <div id="ev-result"></div>
      </div>
    `;
  },

  update() {
    const probability = parseFloat(document.getElementById('ev-prob-num')?.value) / 100;
    const odd = parseFloat(document.getElementById('ev-odd')?.value);
    const stake = parseFloat(document.getElementById('ev-stake')?.value) || 0;
    const bankroll = parseFloat(document.getElementById('ev-bankroll')?.value) || 100;
    const container = document.getElementById('ev-result');
    if (!container || isNaN(probability) || isNaN(odd) || probability <= 0 || odd <= 1) return;

    const evData = this.calculate(probability, odd);
    const kellyData = this.kelly(probability, odd);
    const profitData = this.profit(stake, odd);
    const kellyStake = (kellyData.half * bankroll).toFixed(2);

    container.innerHTML = `
      <div class="ev-result ${evData.hasValue ? 'ev-positive' : 'ev-negative'}">
        <div class="label" style="color:${evData.hasValue ? 'var(--green)' : 'var(--red)'}">
          ${evData.hasValue ? 'Valor detectado' : 'Sin valor'}
        </div>
        <div class="ev-number">${evData.evPct > 0 ? '+' : ''}${evData.evPct}%</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">Valor esperado por apuesta</div>
      </div>

      <div class="stats-grid" style="margin-top:10px">
        <div class="stat-card">
          <div class="stat-label">Cuota justa</div>
          <div class="stat-val">${evData.fairOdd}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Edge</div>
          <div class="stat-val" style="color:${evData.hasValue ? 'var(--green)' : 'var(--red)'}">
            ${evData.edge > 0 ? '+' : ''}${evData.edge}%
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Beneficio potencial</div>
          <div class="stat-val text-green">$${profitData.net}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">1/2 Kelly</div>
          <div class="stat-val">$${kellyStake}</div>
          <div class="stat-sub">${kellyData.halfPct}% del bankroll</div>
        </div>
      </div>
    `;
  },
};
