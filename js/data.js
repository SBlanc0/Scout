const WC_TEAMS = [
  { id: 'argentina', name: 'Argentina', shortName: 'ARG', flag: '🇦🇷', group: 'A', confederation: 'CONMEBOL', fifaRank: 1, elo: 2120, goalsFor: 2.05, goalsAgainst: 0.82, form: ['W', 'W', 'D', 'W', 'W'] },
  { id: 'netherlands', name: 'Países Bajos', shortName: 'NED', flag: '🇳🇱', group: 'A', confederation: 'UEFA', fifaRank: 7, elo: 1992, goalsFor: 1.86, goalsAgainst: 1.02, form: ['W', 'D', 'W', 'L', 'W'] },
  { id: 'japan', name: 'Japón', shortName: 'JPN', flag: '🇯🇵', group: 'A', confederation: 'AFC', fifaRank: 18, elo: 1868, goalsFor: 1.72, goalsAgainst: 1.08, form: ['W', 'W', 'W', 'D', 'L'] },
  { id: 'ghana', name: 'Ghana', shortName: 'GHA', flag: '🇬🇭', group: 'A', confederation: 'CAF', fifaRank: 61, elo: 1686, goalsFor: 1.18, goalsAgainst: 1.35, form: ['L', 'W', 'D', 'L', 'W'] },

  { id: 'brazil', name: 'Brasil', shortName: 'BRA', flag: '🇧🇷', group: 'B', confederation: 'CONMEBOL', fifaRank: 5, elo: 2108, goalsFor: 2.02, goalsAgainst: 0.96, form: ['W', 'D', 'W', 'W', 'L'] },
  { id: 'germany', name: 'Alemania', shortName: 'GER', flag: '🇩🇪', group: 'B', confederation: 'UEFA', fifaRank: 10, elo: 1988, goalsFor: 1.94, goalsAgainst: 1.12, form: ['D', 'W', 'W', 'L', 'W'] },
  { id: 'usa', name: 'Estados Unidos', shortName: 'USA', flag: '🇺🇸', group: 'B', confederation: 'CONCACAF', fifaRank: 13, elo: 1815, goalsFor: 1.55, goalsAgainst: 1.16, form: ['W', 'L', 'W', 'D', 'W'] },
  { id: 'morocco', name: 'Marruecos', shortName: 'MAR', flag: '🇲🇦', group: 'B', confederation: 'CAF', fifaRank: 12, elo: 1844, goalsFor: 1.48, goalsAgainst: 0.92, form: ['W', 'W', 'D', 'W', 'L'] },

  { id: 'france', name: 'Francia', shortName: 'FRA', flag: '🇫🇷', group: 'C', confederation: 'UEFA', fifaRank: 2, elo: 2110, goalsFor: 2.08, goalsAgainst: 0.88, form: ['W', 'W', 'W', 'D', 'L'] },
  { id: 'mexico', name: 'México', shortName: 'MEX', flag: '🇲🇽', group: 'C', confederation: 'CONCACAF', fifaRank: 15, elo: 1832, goalsFor: 1.44, goalsAgainst: 1.22, form: ['D', 'W', 'L', 'W', 'D'] },
  { id: 'croatia', name: 'Croacia', shortName: 'CRO', flag: '🇭🇷', group: 'C', confederation: 'UEFA', fifaRank: 9, elo: 1938, goalsFor: 1.58, goalsAgainst: 1.03, form: ['W', 'D', 'W', 'L', 'D'] },
  { id: 'south-korea', name: 'Corea del Sur', shortName: 'KOR', flag: '🇰🇷', group: 'C', confederation: 'AFC', fifaRank: 22, elo: 1780, goalsFor: 1.38, goalsAgainst: 1.18, form: ['W', 'L', 'D', 'W', 'W'] },

  { id: 'spain', name: 'España', shortName: 'ESP', flag: '🇪🇸', group: 'D', confederation: 'UEFA', fifaRank: 3, elo: 2056, goalsFor: 1.98, goalsAgainst: 0.86, form: ['W', 'W', 'W', 'W', 'D'] },
  { id: 'england', name: 'Inglaterra', shortName: 'ENG', flag: '🇬🇧', group: 'D', confederation: 'UEFA', fifaRank: 4, elo: 2030, goalsFor: 1.88, goalsAgainst: 0.91, form: ['W', 'D', 'W', 'W', 'L'] },
  { id: 'portugal', name: 'Portugal', shortName: 'POR', flag: '🇵🇹', group: 'D', confederation: 'UEFA', fifaRank: 6, elo: 1998, goalsFor: 2.0, goalsAgainst: 1.01, form: ['W', 'W', 'L', 'W', 'W'] },
  { id: 'senegal', name: 'Senegal', shortName: 'SEN', flag: '🇸🇳', group: 'D', confederation: 'CAF', fifaRank: 19, elo: 1794, goalsFor: 1.32, goalsAgainst: 1.02, form: ['D', 'W', 'W', 'L', 'W'] },
];

const WC_MATCHES = [
  { id: 'argentina-vs-france', stage: 'Fase de grupos', group: 'A', date: '2026-06-12T20:00:00Z', venue: 'Ciudad de México', homeTeamId: 'argentina', awayTeamId: 'netherlands', status: 'SCHEDULED' },
  { id: 'japan-vs-ghana', stage: 'Fase de grupos', group: 'A', date: '2026-06-13T17:00:00Z', venue: 'Guadalajara', homeTeamId: 'japan', awayTeamId: 'ghana', status: 'SCHEDULED' },
  { id: 'brazil-vs-germany', stage: 'Fase de grupos', group: 'B', date: '2026-06-14T22:00:00Z', venue: 'Los Angeles', homeTeamId: 'brazil', awayTeamId: 'germany', status: 'SCHEDULED' },
  { id: 'usa-vs-morocco', stage: 'Fase de grupos', group: 'B', date: '2026-06-15T01:00:00Z', venue: 'New York/New Jersey', homeTeamId: 'usa', awayTeamId: 'morocco', status: 'SCHEDULED' },
  { id: 'france-vs-mexico', stage: 'Fase de grupos', group: 'C', date: '2026-06-15T19:00:00Z', venue: 'Dallas', homeTeamId: 'france', awayTeamId: 'mexico', status: 'SCHEDULED' },
  { id: 'croatia-vs-south-korea', stage: 'Fase de grupos', group: 'C', date: '2026-06-16T18:00:00Z', venue: 'Toronto', homeTeamId: 'croatia', awayTeamId: 'south-korea', status: 'SCHEDULED' },
  { id: 'spain-vs-england', stage: 'Fase de grupos', group: 'D', date: '2026-06-17T21:00:00Z', venue: 'Miami', homeTeamId: 'spain', awayTeamId: 'england', status: 'SCHEDULED' },
  { id: 'portugal-vs-senegal', stage: 'Fase de grupos', group: 'D', date: '2026-06-18T20:00:00Z', venue: 'Atlanta', homeTeamId: 'portugal', awayTeamId: 'senegal', status: 'SCHEDULED' },
  { id: 'argentina-vs-japan', stage: 'Fase de grupos', group: 'A', date: '2026-06-19T20:00:00Z', venue: 'Monterrey', homeTeamId: 'argentina', awayTeamId: 'japan', status: 'SCHEDULED' },
  { id: 'france-vs-croatia', stage: 'Fase de grupos', group: 'C', date: '2026-06-20T22:00:00Z', venue: 'Houston', homeTeamId: 'france', awayTeamId: 'croatia', status: 'SCHEDULED' },
];

const WorldCupData = {
  teams: WC_TEAMS,
  matches: WC_MATCHES,

  teamById(id) {
    return this.teams.find(team => team.id === id);
  },

  matchById(id) {
    return this.matches.find(match => match.id === id);
  },

  teamsByGroup() {
    return this.teams.reduce((groups, team) => {
      groups[team.group] = groups[team.group] || [];
      groups[team.group].push(team);
      return groups;
    }, {});
  },

  getMatchTeams(match) {
    return {
      home: this.teamById(match.homeTeamId),
      away: this.teamById(match.awayTeamId),
    };
  },
};
