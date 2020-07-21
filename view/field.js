class FieldView {

  constructor() {
    this.width;
    this.height;
    this.itemWidth;
    this.itemHeight;
    this.field;
    this.element;
    this.alertElement;
    this.heroMoveInterval;
    this.onKeyDownProxy = this.onKeyDown.bind(this);
    this.onTouchProxy = this.onTouch.bind(this);
    this.hideAlertProxy = this.hideAlert.bind(this);
    this.objectCollisionSound = new Audio('sound/explosion.mp3');
    this.bonusSound = new Audio('sound/bonus.mp3');
  }

  init() {
    this.addEventListeners();
    this.initView();
    this.initAlerts();
  }

  addEventListeners() {
    asafonov.messageBus.subscribe(asafonov.events.FIELD_HERO_ADDED, this, 'onHeroAdded');
    asafonov.messageBus.subscribe(asafonov.events.FIELD_HERO_ADDED, this, 'onBallAdded');
    asafonov.messageBus.subscribe(asafonov.events.OBJECT_ADDED, this, 'onObjectAdded');
    asafonov.messageBus.subscribe(asafonov.events.OBJECT_COLLISION, this, 'onObjectCollision');
    asafonov.messageBus.subscribe(asafonov.events.GAME_LOST, this, 'onGameLost');
    asafonov.messageBus.subscribe(asafonov.events.GAME_WON, this, 'onGameWon');
    asafonov.messageBus.subscribe(asafonov.events.BONUS_APPLIED, this, 'onBonusApplied');
    asafonov.messageBus.subscribe(asafonov.events.NEW_HIGHSCORE, this, 'onNewHighscore');
    window.addEventListener('keydown', this.onKeyDownProxy);
    window.addEventListener('touchstart', this.onTouchProxy);
  }

  initView() {
    this.element = document.getElementById('field');
    this.heroView = new HeroView();
    this.initSize();
  }

  initSize() {
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.itemWidth = this.width / this.field.width;
    this.itemHeight = this.height / this.field.height;
    this.heroView.setSize(this.itemWidth, this.itemHeight);
  }

  onGameLost() {
    this.gameOver("You Lost :(");
  }

  onGameWon() {
    asafonov.score.processGameWon();
    this.gameOver("You Won!");
  }

  gameOver (msg) {
    asafonov.score.updateGameStats();
    document.querySelector('#gameover').style.display = 'block';
    document.querySelector('#gameover .status').innerHTML = msg || 'Game Over';
    document.querySelector('#gameover button').focus();
    const isNewHighScore = asafonov.score.isNewHighScore();
    document.querySelector('#gameover #highscore').style.display = isNewHighScore ? 'block' : 'none';
    document.querySelector('#gameover #stats').innerHTML = 'Games won: ' + asafonov.score.wonGames + '/' + asafonov.score.totalGames;
    isNewHighScore && asafonov.score.updateHighScore() && (document.querySelector('#highscore span').innerHTML = asafonov.score.scores);
    this.destroy();
  }

  onNewHighscore() {
    this.alert("New HighScore!");
    asafonov.settings.sfx && this.bonusSound.play();
  }

  alert (msg) {
    this.alertElement.innerHTML = msg;
    this.alertElement.style.display = 'block';
    setTimeout(this.hideAlertProxy, 3000);
  }

  hideAlert() {
    this.alertElement.style.display = 'none';
  }

  initAlerts() {
    this.alertElement = document.createElement('div');
    this.alertElement.className = 'alert';
    document.body.appendChild(this.alertElement);
    this.hideAlert();
  }

  onObjectAdded (eventData) {
    if (eventData.type === null || eventData.type === undefined || eventData.type == 0) {
      return;
    }

    var element = document.createElement('div');
    element.style.marginTop = this.itemHeight * eventData.position.y + 'px';
    element.style.marginLeft = this.itemWidth * eventData.position.x + 'px';
    element.style.width = (this.itemWidth - 2) + 'px';
    element.style.height = (this.itemHeight - 2) + 'px';
    element.style.backgroundSize = this.itemWidth + 'px ' + this.itemHeight + 'px';
    element.className = 'object object_' + eventData.type;
    element.id = 'object_' + eventData.index;
    this.element.appendChild(element);
  }

  onObjectCollision (eventData) {
    var element = document.getElementById('object_' + eventData.index);
    element.className = 'object object_' + eventData.type;

    if (! (eventData.type > 0)) {
      asafonov.settings.sfx && this.objectCollisionSound.play();
      this.element.removeChild(element);
    }
  }

  onHeroAdded (eventData) {
    this.element.appendChild(this.heroView.element);
  }

  onBallAdded (eventData) {
    this.ballView = new BallView();
    this.ballView.setSize(this.itemWidth, this.itemHeight);
    this.element.appendChild(this.ballView.element);
  }

  onBonusApplied (eventData) {
    this.alert(eventData.message);
    asafonov.settings.sfx && this.bonusSound.play();
  }

  onKeyDown (e) {
    if (e.keyCode == 37) {
      this.startHeroMoving('moveLeft');
    } else if (e.keyCode == 39) {
      this.startHeroMoving('moveRight');
    }
  }

  onTouch (e) {
    e.preventDefault();
    var x = e.touches[e.touches.length - 1].clientX;

    if (x < this.element.offsetWidth / 2) {
      this.startHeroMoving('moveLeft');
    } else {
      this.startHeroMoving('moveRight');
    }
  }

  startHeroMoving (direction) {
    if (this.heroMoveInterval) {
      clearInterval(this.heroMoveInterval);
    }

    var hero = this.field.getHero();
    this.heroMoveInterval = setInterval(function() {hero[direction]();}, 60);
  }

  destroy() {
    if (this.heroMoveInterval) {
      clearInterval(this.heroMoveInterval);
    }

    this.heroView.destroy();
    this.ballView.destroy();
    this.field.destroy();
    this.heroView = null;
    this.ballView = null;
    this.field = null;
    asafonov.messageBus.unsubscribe(asafonov.events.FIELD_HERO_ADDED, this, 'onHeroAdded');
    asafonov.messageBus.unsubscribe(asafonov.events.FIELD_HERO_ADDED, this, 'onBallAdded');
    asafonov.messageBus.unsubscribe(asafonov.events.OBJECT_ADDED, this, 'onObjectAdded');
    asafonov.messageBus.unsubscribe(asafonov.events.OBJECT_COLLISION, this, 'onObjectCollision');
    asafonov.messageBus.unsubscribe(asafonov.events.GAME_LOST, this, 'onGameLost');
    asafonov.messageBus.unsubscribe(asafonov.events.GAME_WON, this, 'onGameWon');
    asafonov.messageBus.unsubscribe(asafonov.events.BONUS_APPLIED, this, 'onBonusApplied');
    asafonov.messageBus.unsubscribe(asafonov.events.NEW_HIGHSCORE, this, 'onNewHighscore');
    window.removeEventListener('keydown', this.onKeyDownProxy);
    window.removeEventListener('touchstart', this.onTouchProxy);
    console.log("FieldView destroy");
  }
}
