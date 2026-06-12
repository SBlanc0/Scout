const State = {
  fixtures: WorldCupData.matches,
};

const App = {
  init() {
    this.checkStatus();
    Router.start();
  },

  checkStatus() {
    const dot = document.getElementById('sdot');
    const text = document.getElementById('stxt');
    dot.className = 'dot live';
    text.textContent = 'Datos locales';
  },

  renderEV() {
    document.getElementById('mc').innerHTML = EV.renderCalculator();
    EV.update();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
