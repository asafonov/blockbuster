class Score {

  constructor (hero, ball) {
    this.hero = hero;
    this.ball = ball;
    this.scores = 0;
    this.totalGames = window.localStorage.getItem('totalGames') || 0;
    this.wonGames = window.localStorage.getItem('wonGames') || 0;
    this.highscore = this.getHighScore();
    this.highscoreReported = false;
    asafonov.messageBus.subscribe(asafonov.events.OBJECT_COLLISION, this, 'onObjectCollision');
  }

  onObjectCollision (eventData) {
    this.scores += parseInt(Score.BASE_SCORE / (++eventData.type) * this.ball.angle * this.ball.speed * this.hero.speed * (this.hero.width < asafonov.settings.heroWidth ? 2 : 1) * (this.hero.width > asafonov.settings.heroWidth ? 1/2 : 1), 10);
    asafonov.messageBus.send(asafonov.events.SCORES_UPDATED, {scores: this.scores});
    this.highscore > 0 && this.isNewHighScore() && ! this.highscoreReported && (this.highscoreReported = true) && asafonov.messageBus.send(asafonov.events.NEW_HIGHSCORE, {highscore: this.scores});
  }

  getHighScore() {
    return window.localStorage.getItem('highscore') || 0;
  }

  updateHighScore() {
    window.localStorage.setItem('highscore', this.scores);
    return true;
  }

  processGameWon() {
    this.wonGames++;
    this.scores *= 2;
    asafonov.messageBus.send(asafonov.events.SCORES_UPDATED, {scores: this.scores});
  }

  isNewHighScore() {
    return this.scores > this.highscore;
  }

  updateGameStats() {
    this.totalGames++;
    window.localStorage.setItem('totalGames', this.totalGames);
    window.localStorage.setItem('wonGames', this.wonGames);
  }

}

Score.BASE_SCORE = 8;
