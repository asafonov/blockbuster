class Field {

  constructor (width, height) {
    this.width = width || 40;
    this.height = height || 30;
    this.objects = [];
    this.objectsCount = 0;
    this.hero = null;
    this.ball = null;
    this.heroMoveInterval;
    this.isPaused = false;
    this.directions = ['moveLeft', 'moveRight']
    this.currentDirection = -1
    asafonov.messageBus.subscribe(asafonov.events.FIELD_HERO_MOVED, this, 'onHeroMoved');
    asafonov.messageBus.subscribe(asafonov.events.BALL_MOVED, this, 'onBallMoved');
  }

  setHero (hero) {
    this.hero = hero;
    this.hero.moveTo(this.width / 2 - (this.hero.width + 1) / 2, this.height - 1);
    asafonov.messageBus.send(asafonov.events.FIELD_HERO_ADDED, {field: this});
  }

  setBall (ball) {
    this.ball = ball;
    this.ball.moveTo(this.width / 2 - 1, this.height - 2);
    asafonov.messageBus.send(asafonov.BALL_ADDED, {field: this, ball: ball});
  }

  getHero() {
    return this.hero;
  }

  getHeroPosition() {
    return this.hero.position;
  }

  onHeroMoved (eventData) {
    this.correctPosition(eventData.obj);
  }

  onBallMoved (eventData) {
    this.correctBallPosition(eventData.obj, eventData.fromPosition);
  }

  positionToIndex (position) {
    return parseInt(position.y, 10) * this.width + parseInt(position.x, 10);
  }

  indexToPosition (index) {
    return new Point(index % this.width, parseInt(index / this.width, 10));
  }

  setObjectMap (objects) {
    for (var i = 0; i < objects.length; ++i) {
      if (objects[i] !== null && objects[i] !== undefined) {
        this.addObject(objects[i], this.indexToPosition(i));
      }
    }
  }

  addObject (type, position) {
    var index = this.positionToIndex(position);
    this.objects[index] = type;
    asafonov.messageBus.send(asafonov.events.OBJECT_ADDED, {type: type, position: position, index: index});

    if (type !== null && type !== undefined && type > 0) {
      ++this.objectsCount;
    }
  }

  correctPosition (obj) {
    if (obj.position.x < 0 || obj.position.x + obj.width > this.width) {
      obj.moveTo(obj.position.x < 0 ? 0 : this.width - obj.width, obj.position.y);
    }
  }

  checkCollision (obj) {
    var affectedPositions = [
      this.positionToIndex(obj.position),
      this.positionToIndex({x: obj.position.x - 1, y: obj.position.y}),
      this.positionToIndex({x: obj.position.x + 1, y: obj.position.y}),
      this.positionToIndex({x: obj.position.x - 1, y: obj.position.y + 1}),
      this.positionToIndex({x: obj.position.x, y: obj.position.y + 1}),
      this.positionToIndex({x: obj.position.x + 1, y: obj.position.y + 1}),
      this.positionToIndex({x: obj.position.x - 1, y: obj.position.y - 1}),
      this.positionToIndex({x: obj.position.x, y: obj.position.y - 1}),
      this.positionToIndex({x: obj.position.x + 1, y: obj.position.y - 1})
    ];
    var collision = false;
    var isVerticalWall = (this.objects[affectedPositions[1]] > 0 && (obj.direction == Ball.DIRECTION_UPLEFT || obj.direction == Ball.DIRECTION_DOWNLEFT))
      || (this.objects[affectedPositions[2]] > 0 && (obj.direction == Ball.DIRECTION_UPRIGHT || obj.direction == Ball.DIRECTION_DOWNRIGHT));

    for (var i = 0; i < affectedPositions.length; ++i) {
      if (this.objects[affectedPositions[i]] !== null && this.objects[affectedPositions[i]] !== undefined && this.objects[affectedPositions[i]] > 0) {
        this.processObjectCollision(affectedPositions[i]);
        collision = true;
      }
    }

    if (collision) {
      var downPositionIndex = this.positionToIndex({x: obj.position.x, y: obj.position.y + 1});
      obj.changeDirection(Ball[isVerticalWall ? 'VERTICAL_WALL' : 'HORIZONTAL_WALL']);
      this.applyBonuses(obj);

      if (this.objectsCount <= 0) {
        asafonov.messageBus.send(asafonov.events.GAME_WON, {});
      }
    }

    return collision;
  }

  applyBonuses (obj) {
    if (Math.random() < 0.1) {
      var index = parseInt(asafonov.bonuses.length * Math.random(), 10);
      var bonus = new asafonov.bonuses[index](this.hero, obj);
      bonus.apply();
    }
  }

  processObjectCollision (i) {
    if (this.objects[i] !== null && this.objects[i] !== undefined && this.objects[i] > 0) {
      --this.objects[i];
      asafonov.messageBus.send(asafonov.events.OBJECT_COLLISION, {index: i, type: this.objects[i]});

      if (this.objects[i] == 0) {
        --this.objectsCount;
      }
    }
  }

  correctBallPosition (obj, fromPosition) {
    if (this.checkCollision(obj)) {
      return;
    }

    if (obj.position.y >= this.height - 1 && obj.position.x >= this.hero.position.x && obj.position.x <= this.hero.position.x + this.hero.width - 1) {
      var wallType = Ball.HORIZONTAL_WALL;

      if ((this.hero.position.x == obj.position.x && obj.direction == Ball.DIRECTION_DOWNRIGHT)
      || (obj.position.x - this.hero.position.x == this.hero.width - 1 && obj.direction == Ball.DIRECTION_DOWNLEFT)) {
        obj.angle = 2;
        wallType = Ball.CORNER_WALL;
      } else if (obj.angle == 2) {
        obj.angle = Math.random() < 0.2 ? 1 : 2;
      } else if (obj.angle < 2) {
        obj.angle = Math.random() < 1.2 - obj.angle ? 1/2 : 1;
      } else {
        obj.angle = 1;
      }

      if ((obj.position.x - this.hero.position.x <= this.hero.width / 2- 1 / 2 && obj.direction == Ball.DIRECTION_DOWNRIGHT)
      || (obj.position.x - this.hero.position.x >= this.hero.width / 2 - 1 / 2 && obj.direction == Ball.DIRECTION_DOWNLEFT)) {
        wallType = Math.random() < 0.5 ? Ball.CORNER_WALL : wallType;
      }

      obj.changeDirection(wallType);
      obj.position = fromPosition;
      obj.move();
    } else if (obj.position.x < 0 || obj.position.x > this.width - 1) {
      obj.position = fromPosition;
      obj.changeDirection(Ball.VERTICAL_WALL);
      obj.move();
    } else if (obj.position.y < 0) {
      obj.position = fromPosition;
      obj.changeDirection(Ball.HORIZONTAL_WALL);
      obj.move();
    } else if (obj.position.y > this.height - 1) {
      asafonov.messageBus.send(asafonov.events.GAME_LOST, {});
    }
  }

  playPause() {
    this[this.isPaused ? 'resume' : 'pause']();
    this.isPaused = ! this.isPaused;
  }

  startHeroMoving (direction) {
    if (this.currentDirection === -1) {
      this.currentDirection = this.directions.indexOf(direction)
    } else {
      this.currentDirection = 1 - this.currentDirection
      direction = this.directions[this.currentDirection]
    }

    if (this.heroMoveInterval) {
      clearInterval(this.heroMoveInterval);
    }

    const hero = this.hero;
    this.heroMoveInterval = setInterval(function() {hero[direction]();}, 60);
  }

  resume() {
    this.ball.resume();
  }

  pause() {
    if (this.heroMoveInterval) {
      clearInterval(this.heroMoveInterval);
    }
    this.ball.pause();
  }

  destroy() {
    this.pause();
    this.hero.destroy();
    this.hero  = null;
    this.ball.destroy();
    this.ball = null;
    asafonov.messageBus.unsubscribe(asafonov.events.FIELD_HERO_MOVED, this, 'onHeroMoved');
    asafonov.messageBus.unsubscribe(asafonov.events.BALL_MOVED, this, 'onBallMoved');

    for (var i = 0; i < this.objects.length; ++i) {
      this.objects[i] = null;
    }

    this.objects.length = 0;
    this.directions = null
    this.currentDirection = null
    console.log("Field destroy");
  }
}
