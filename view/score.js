class ScoreView {

  constructor() {
    this.element = document.querySelector('div.scores span');
    this.highscoreElement = document.querySelector('div.high span');
    asafonov.messageBus.subscribe(asafonov.events.SCORES_UPDATED, this, 'onScoresUpdated');
    asafonov.messageBus.subscribe(asafonov.events.NEW_HIGHSCORE, this, 'onNewHighscore');
    this.displayHighscore();
  }

  onScoresUpdated (eventData) {
    this.displayScore(eventData.scores);
  }

  onNewHighscore (eventData) {
    this.element.parentNode.classList.add('new_high');
  }

  displayScore (score) {
    this.element.innerHTML = score;
  }

  displayHighscore() {
    this.highscoreElement.innerHTML = asafonov.score.getHighScore() || "0";
  }

  destroy() {
    this.element = null;
    this.highscoreElement = null;
    asafonov.messageBus.unsubscribe(asafonov.events.SCORES_UPDATED, this, 'onScoresUpdated');
    asafonov.messageBus.unsubscribe(asafonov.events.NEW_HIGHSCORE, this, 'onNewHighscore');
  }

}
