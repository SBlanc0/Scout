const API = {
  _cacheGet(key) {
    try {
      const data = JSON.parse(sessionStorage.getItem(`scout_${key}`));
      if (data && Date.now() - data.ts < CONFIG.CACHE_TTL) return data.val;
    } catch (error) {}
    return null;
  },

  _cacheSet(key, value) {
    try {
      sessionStorage.setItem(`scout_${key}`, JSON.stringify({ ts: Date.now(), val: value }));
    } catch (error) {}
  },

  async fetch(endpoint) {
    const cached = this._cacheGet(endpoint);
    if (cached) return cached;

    const response = await window.fetch(`${CONFIG.API_BASE}${endpoint}`, {
      headers: { 'X-Auth-Token': CONFIG.API_KEY },
    });

    if (response.status === 429) throw new Error('Límite de llamadas alcanzado. Intenta de nuevo en un minuto.');
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

    const data = await response.json();
    this._cacheSet(endpoint, data);
    return data;
  },

  async getMatches(competitionCode, dateFrom, dateTo) {
    return this.fetch(`/competitions/${competitionCode}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED,TIMED,IN_PLAY,PAUSED,FINISHED`);
  },

  async getMatchesByDate(codes, dateFrom, dateTo) {
    const results = await Promise.all(
      codes.map(code => this.getMatches(code, dateFrom, dateTo).catch(() => ({ matches: [] })))
    );
    return results.flatMap(result => result.matches || []);
  },

  async getH2H(matchId) {
    return this.fetch(`/matches/${matchId}/head2head?limit=5`);
  },

  async getStandings(competitionCode) {
    return this.fetch(`/competitions/${competitionCode}/standings`);
  },

  async checkStatus() {
    const response = await window.fetch(`${CONFIG.API_BASE}/competitions`, {
      headers: { 'X-Auth-Token': CONFIG.API_KEY },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return {
      remaining: response.headers.get('X-Requests-Available-Minute'),
      reset: response.headers.get('X-RequestCounter-Reset'),
    };
  },
};

function dateStr(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

function formatDateHeader(value) {
  const date = new Date(`${value}T12:00:00`);
  const dayEn = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthEn = date.toLocaleDateString('en-US', { month: 'long' });
  const isToday = value === window.dateStr(0);
  const isTomorrow = value === window.dateStr(1);
  const prefix = isToday ? 'Hoy · ' : isTomorrow ? 'Mañana · ' : '';
  return `${prefix}${DAYS_ES[dayEn] || dayEn} ${date.getDate()} de ${MONTHS_ES[monthEn] || monthEn}`;
}

window.dateStr = dateStr;
window.formatDateHeader = formatDateHeader;
