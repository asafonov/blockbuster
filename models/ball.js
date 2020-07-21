class Ball {

  constructor() {
    this.position = new Point(0, 0);
    this.direction = Math.random() > 0.5 ? Ball.DIRECTION_UPRIGHT : Ball.DIRECTION_UPLEFT;
    this.angle = Math.random() > 0.5 ? 1 : 1/2;
    this.speed = asafonov.settings.ballSpeed;
    this.resume();
  }

  resume() {
    this.interval = setInterval(this.move.bind(this), 50);
  }

  pause() {
    clearInterval(this.interval);
  }

  moveByDelta (delta) {
    this.moveTo(this.position.x + delta.x, this.position.y + delta.y);
  }

  move() {
    var x = this.direction == Ball.DIRECTION_UPRIGHT || this.direction == Ball.DIRECTION_DOWNRIGHT ? 1 : -1;
    var y = this.direction == Ball.DIRECTION_UPRIGHT || this.direction == Ball.DIRECTION_UPLEFT ? -1 : 1;
    this.moveByDelta(new Point(x * this.angle * this.speed, y * this.speed));
  }

  moveTo (x, y) {
    var position = new Point(this.position.x, this.position.y);
    this.position.x = x;
    this.position.y = y;
    asafonov.messageBus.send(asafonov.events.BALL_MOVED, {obj: this, fromPosition: position});
  }

  changeDirection (wallType) {
    if (wallType == Ball.CORNER_WALL) {
      if (this.direction == Ball.DIRECTION_UPRIGHT) {
        this.direction = Ball.DIRECTION_DOWNLEFT;
      } else if (this.direction == Ball.DIRECTION_UPLEFT) {
        this.direction = Ball.DIRECTION_DOWNRIGHT;
      } else if (this.direction == Ball.DIRECTION_DOWNRIGHT) {
        this.direction = Ball.DIRECTION_UPLEFT;
      } else {
        this.direction = Ball.DIRECTION_UPRIGHT;
      }
    } else if (wallType == Ball.VERTICAL_WALL) {
      this.direction += this.direction % 2 == 1 ? 1 : -1;
    } else if (wallType == Ball.HORIZONTAL_WALL) {
      this.direction += this.direction < 3 ? 2 : -2;
    }

    asafonov.messageBus.send(asafonov.events.BALL_CHANGED_DIRECTION, {});
  }

  destroy() {
    this.pause();
    console.log("Ball destroy");
  }
}

Ball.DIRECTION_UPRIGHT = 1;
Ball.DIRECTION_UPLEFT = 2;
Ball.DIRECTION_DOWNRIGHT = 3;
Ball.DIRECTION_DOWNLEFT = 4;
Ball.HORIZONTAL_WALL = 1;
Ball.VERTICAL_WALL = 2;
Ball.CORNER_WALL = 3;
