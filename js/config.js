const CONFIG = {
  API_KEY: 'cde810341c3b4d7ca3ce06601e6c5021',
  API_BASE: 'https://api.football-data.org/v4',
  CACHE_TTL: 30 * 60 * 1000,
  SIMULATION_ITERATIONS: 10000,
};

const COMPETITIONS = {
  WC: { name: 'Mundial 2026', flag: '🌎', code: 'WC' },
};

const MATCH_STATUS = {
  LIVE: ['IN_PLAY', 'PAUSED', 'HALFTIME'],
  DONE: ['FINISHED', 'AWARDED'],
  UPCOMING: ['TIMED', 'SCHEDULED'],
};

const DAYS_ES = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const MONTHS_ES = {
  January: 'enero',
  February: 'febrero',
  March: 'marzo',
  April: 'abril',
  May: 'mayo',
  June: 'junio',
  July: 'julio',
  August: 'agosto',
  September: 'septiembre',
  October: 'octubre',
  November: 'noviembre',
  December: 'diciembre',
};
