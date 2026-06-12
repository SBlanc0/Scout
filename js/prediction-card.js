const PredictionCard = {
  pct(value) {
    return `${(value * 100).toFixed(0)}%`;
  },

  render(match, options = {}) {
    const { home, away } = WorldCupData.getMatchTeams(match);
    const prediction = Engine.predict(home, away, { neutralVenue: true });
    const href = `#/partido/${match.id}`;
    const compact = options.compact ? ' compact' : '';

    return `
      <article class="prediction-card${compact}" onclick="location.hash='${href}'">
        <div class="match-meta">
          <span>${match.stage} · Grupo ${match.group}</span>
          <span class="text-mono">${UI.formatMatchDate(match.date)}</span>
        </div>

        <div class="match-teams">
          <div class="team">
            <span class="team-flag">${home.flag}</span>
            <span class="team-name">${home.name}</span>
          </div>
          <div class="vs-badge">VS</div>
          <div class="team away">
            <span class="team-flag">${away.flag}</span>
            <span class="team-name">${away.name}</span>
          </div>
        </div>

        <div class="prob-labels">
          <span>${home.shortName}</span>
          <span>Empate</span>
          <span>${away.shortName}</span>
        </div>
        <div class="prob-bar">
          <div class="pb-h" style="flex:${Math.max(1, prediction.h * 100)}"></div>
          <div class="pb-d" style="flex:${Math.max(1, prediction.d * 100)}"></div>
          <div class="pb-a" style="flex:${Math.max(1, prediction.a * 100)}"></div>
        </div>
        <div class="prob-vals">
          <span class="pv-h">${this.pct(prediction.h)}</span>
          <span class="pv-d">${this.pct(prediction.d)}</span>
          <span class="pv-a">${this.pct(prediction.a)}</span>
        </div>

        <div class="pick-row">
          <span>Pick</span>
          <strong>${prediction.best}</strong>
        </div>
      </article>
    `;
  },
};
