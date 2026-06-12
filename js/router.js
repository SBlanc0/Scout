const Router = {
  parse() {
    const hash = window.location.hash || '#/dashboard';
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    return {
      route: parts[0] || 'dashboard',
      id: parts[1] || null,
    };
  },

  start() {
    window.addEventListener('hashchange', () => this.render());
    if (!window.location.hash) window.location.hash = '#/dashboard';
    this.render();
  },

  render() {
    const { route, id } = this.parse();
    this.setActive(route);

    switch (route) {
      case 'dashboard':
        UI.renderDashboard();
        break;
      case 'partidos':
        UI.renderMatches();
        break;
      case 'partido':
        UI.renderMatchDetail(id);
        break;
      case 'equipos':
        UI.renderTeams();
        break;
      case 'equipo':
        UI.renderTeamDetail(id);
        break;
      case 'grupos':
        UI.renderGroups();
        break;
      case 'ranking':
        UI.renderRanking();
        break;
      case 'simulador':
        UI.renderSimulator();
        break;
      case 'ev':
        App.renderEV();
        break;
      case 'tracker':
        Tracker.render();
        break;
      default:
        window.location.hash = '#/dashboard';
    }
  },

  setActive(route) {
    document.querySelectorAll('[data-route]').forEach(link => {
      link.classList.toggle('active', link.dataset.route === route);
    });
  },
};
