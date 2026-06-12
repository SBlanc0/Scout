const Engine = {
  factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  },

  poisson(lambda, k) {
    const l = Math.max(lambda, 0.01);
    return (Math.pow(l, k) * Math.exp(-l)) / this.factorial(k);
  },

  formMultiplier(form) {
    const points = { W: 3, D: 1, L: 0 };
    if (!form || !form.length) return 1;
    const weighted = form.reduce((acc, result, index) => acc + (points[result] ?? 1) * (index + 1), 0);
    const max = form.reduce((acc, _result, index) => acc + 3 * (index + 1), 0);
    return 0.78 + 0.44 * (weighted / max);
  },

  eloMultiplier(team, opponent) {
    if (!team?.elo || !opponent?.elo) return 1;
    const diff = Math.max(-350, Math.min(350, team.elo - opponent.elo));
    return 1 + diff / 1600;
  },

  expectedGoals(home, away, options = {}) {
    const neutralVenue = options.neutralVenue ?? true;
    const homeAdvantage = neutralVenue ? 1 : 1.12;
    const hForm = this.formMultiplier(home.form);
    const aForm = this.formMultiplier(away.form);
    const hElo = this.eloMultiplier(home, away);
    const aElo = this.eloMultiplier(away, home);

    const lambdaH = Math.max(0.25, (home.goalsFor || 1.35) * hForm * hElo * (1 / (away.goalsAgainst || 1.15)) * homeAdvantage);
    const lambdaA = Math.max(0.25, (away.goalsFor || 1.2) * aForm * aElo * (1 / (home.goalsAgainst || 1.1)));

    return { lambdaH, lambdaA };
  },

  scoreMatrix(lambdaH, lambdaA, maxGoals = 7) {
    const scores = [];
    let totalProbability = 0;

    for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals++) {
        const probability = this.poisson(lambdaH, homeGoals) * this.poisson(lambdaA, awayGoals);
        totalProbability += probability;
        scores.push({ homeGoals, awayGoals, probability });
      }
    }

    return scores.map(score => ({
      ...score,
      probability: score.probability / totalProbability,
    }));
  },

  predict(home, away, options = {}) {
    const { lambdaH, lambdaA } = this.expectedGoals(home, away, options);
    const scores = this.scoreMatrix(lambdaH, lambdaA);

    let h = 0;
    let d = 0;
    let a = 0;
    let btts = 0;
    let over25 = 0;

    scores.forEach(score => {
      if (score.homeGoals > score.awayGoals) h += score.probability;
      else if (score.homeGoals === score.awayGoals) d += score.probability;
      else a += score.probability;

      if (score.homeGoals > 0 && score.awayGoals > 0) btts += score.probability;
      if (score.homeGoals + score.awayGoals > 2.5) over25 += score.probability;
    });

    const conf = Math.max(h, d, a);
    const confLabel = conf > 0.55 ? 'Alta' : conf > 0.42 ? 'Media' : 'Baja';
    const confClass = conf > 0.55 ? 'h' : conf > 0.42 ? 'm' : 'l';
    const winner = h > a && h > d ? 'home' : a > h && a > d ? 'away' : 'draw';
    const winnerName = winner === 'home' ? home.name : winner === 'away' ? away.name : 'Empate';
    const topScores = [...scores].sort((x, y) => y.probability - x.probability).slice(0, 5);

    let best;
    if (conf > 0.52 && winner !== 'draw') best = `Victoria ${winnerName}`;
    else if (over25 > 0.56) best = 'Over 2.5 goles';
    else if (btts > 0.56) best = 'BTTS: ambos marcan';
    else best = h > a ? 'Doble oportunidad 1X' : 'Doble oportunidad X2';

    return {
      h,
      d,
      a,
      lambdaH,
      lambdaA,
      expGoals: lambdaH + lambdaA,
      btts,
      over25,
      conf,
      confLabel,
      confClass,
      winner,
      winnerName,
      best,
      scorelines: topScores,
      oddH: (1 / h).toFixed(2),
      oddD: (1 / d).toFixed(2),
      oddA: (1 / a).toFixed(2),
    };
  },

  predictMatch(match) {
    const { home, away } = WorldCupData.getMatchTeams(match);
    return this.predict(home, away, { neutralVenue: true });
  },

  parseStandings(standingsData, teamId) {
    try {
      for (const standing of standingsData.standings || []) {
        for (const entry of standing.table || []) {
          if (entry.team.id === teamId) {
            const played = entry.playedGames || 1;
            return {
              goalsFor: entry.goalsFor / played,
              goalsAgainst: entry.goalsAgainst / played,
              form: (entry.form || '').split(',').slice(-5).map(result => result.trim()),
              position: entry.position,
              points: entry.points,
            };
          }
        }
      }
    } catch (error) {}
    return { goalsFor: 1.3, goalsAgainst: 1.2, form: [], position: null, points: null };
  },

  getMarketProb(prediction, market) {
    switch (market) {
      case 'HOME_WIN': return prediction.h;
      case 'DRAW': return prediction.d;
      case 'AWAY_WIN': return prediction.a;
      case 'OVER_25': return prediction.over25;
      case 'UNDER_25': return 1 - prediction.over25;
      case 'BTTS_YES': return prediction.btts;
      case 'BTTS_NO': return 1 - prediction.btts;
      case 'DC_1X': return prediction.h + prediction.d;
      case 'DC_X2': return prediction.d + prediction.a;
      case 'DC_12': return prediction.h + prediction.a;
      default: return null;
    }
  },
};
