'use strict';

class Vector {
	constructor(x = 0, y = 0) {
      this.x = x;
		  this.y = y;
	}

	plus(oldVector) {
    if(!(oldVector instanceof Vector)){
      throw new SyntaxError("Можно прибавлять к вектору только вектор типа Vector");
    }
    else return new Vector(this.x + oldVector.x, this.y + oldVector.y);
	}

	times(factor) {
    return new Vector(this.x * factor, this.y * factor);
	}
}

/*try {
  const start = new Vector(30, 50);
  const moveTo = new Vector(5, 10);
  const finish = start.plus(moveTo.times(2));

  console.log(`Исходное расположение: ${start.x}:${start.y}`);
  console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
}
catch (err) {
  console.log(err);
}*/


class Actor {
	constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		
		if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
        throw new Error(`TypeERROR: The constructor must have an object of type Vector.`);
		}
		this.pos = pos;
		this.size = size;
    this.speed = speed;
	}

	act() {
	 //
	}

  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
    
  get type() {
    return 'actor';
  }

	isIntersect(passedActor) {
		if (!(passedActor instanceof Actor) || !passedActor) {
        throw new Error('TypeERROR: Must have an object of type Actor.');
      } 
	 if (passedActor === this) {
        return false;
      }
      return this.right > passedActor.left && 
            this.left < passedActor.right && 
            this.top < passedActor.bottom && 
            this.bottom > passedActor.top
	}
}

/*const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);*/

class Level {
  constructor(grid = [], actors = []){
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(function (actors) {
      return actors.type === "player";
    })
    this.height = this.grid.length;
    this.width = this.grid.reduce((obj, item) => {
        if (obj > item.length) {
          return obj;
        } else {
          return item.length;
        }
      }, 0);
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished(){
    return this.status != null && this.finishDelay < 0;
  }

  actorAt(otherActor) {
    if (!(otherActor instanceof Actor)) {
      throw new SyntaxError("Передать можно только вектор.");
    }
    return this.actors.find(obj => obj.isIntersect(otherActor));
  }

  obstacleAt(position, size) {
    if (!(position instanceof Vector) || !(size instanceof Vector)) {
        throw new Error("Передать можно только вектор.");
    }

    const leftWall = Math.floor(position.x);
    const topWall = Math.floor(position.y);
    const lava = Math.ceil(position.y + size.y); 
    const rightWall = Math.ceil(position.x + size.x);
    
    if (leftWall < 0 || rightWall > this.width || topWall < 0) {
      
      return 'wall';
    }

    if (lava > this.height) {
      return 'lava';
    }

    for (let i = topWall; i < lava; i++) {
      for (let j = leftWall; j < rightWall; j++) {
        let obstacle = this.grid[i][j];
        if (obstacle) {
          return obstacle;
        }
      }
    }
  }

  removeActor(actor) {
    if (this.actors.includes(actor)) {
      this.actors.splice(this.actors.indexOf(actor), 1);
    }
  }
  
  noMoreActors(type) {
		return this.actors.findIndex(obj => obj.type === type) === -1;
	}

  playerTouched(obstacleType, actor){
    if (this.status !== null) {
      return;
    }
    
    if (obstacleType === "lava" || obstacleType === "fireball") {
        this.status = "lost";
    }

    if (obstacleType === 'coin' && actor.type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
	  return;
    }
  }
}

/*try {
  const grid = [
    [undefined, undefined],
    ['wall', 'wall']
  ];

  function MyCoin(title) {
    this.type = 'coin';
    this.title = title;
  }
  MyCoin.prototype = Object.create(Actor);
  MyCoin.constructor = MyCoin;

  const goldCoin = new MyCoin('Золото');
  const bronzeCoin = new MyCoin('Бронза');
  //player = new Actor();
  const fireball = new Actor();

  const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

  level.playerTouched('coin', goldCoin);
  level.playerTouched('coin', bronzeCoin);

  if (level.noMoreActors('coin')) {
    console.log('Все монеты собраны');
    console.log(`Статус игры: ${level.status}`);
  }

  const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
  if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
  }

  const otherActor = level.actorAt(player);
  if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
  }
}
catch (err) {
  console.log(err);
}*/

class LevelParser {
	constructor(objects) {
		this.objects = objects;
	}

	actorFromSymbol(symb) {
		if (symb && this.objects) return this.objects[symb];
	}

	obstacleFromSymbol(symb) {
		if (!symb) return undefined;
		return symbolObstacle[symb];
	}

	createGrid(plan) {
		return plan.map(function(row) {
			return [...row].map(obj => symbolObstacle[obj]);
		});
	}

	createActors(plan) {
		let thisPlan = this;
		return plan.reduce(function(prev, rowY, y) {
			[...rowY].forEach(function(rowX, x) {
				if (rowX) {
					let constructor = thisPlan.actorFromSymbol(rowX);
					if (constructor && typeof constructor === 'function') {
						let actor = new constructor(new Vector(x, y));
						if (actor instanceof Actor) {
							prev.push(actor);
						}
					}
				}
			});
			return prev;
		}, []);
	}

	parse(plan) {
		return new Level(this.createGrid(plan), this.createActors(plan));
	}
}

  const symbolObstacle = {
    'x': 'wall',
    '!': 'lava'
  };

/*const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));*/

class Fireball extends Actor {
	constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		let size = new Vector(1, 1);
		super(pos, size, speed);
		this.pos = pos;
	}

	get type() {
		return 'fireball';
	}

	getNextPosition(time = 1) {
		return this.pos.plus(this.speed.times(time));
	}

	handleObstacle() {
		this.speed = this.speed.times(-1);
	}

	act(time, level) {
		let nextPosition = this.getNextPosition(time);
		if (level.obstacleAt(nextPosition, this.size)) {
			this.handleObstacle();
		} else {
			this.pos = nextPosition;
		}
	}
}

/*const time = 5;
const speed = new Vector(1, 0);
position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);*/

class HorizontalFireball extends Fireball {
	constructor(currentPosition) {
		let speed = new Vector(2, 0);
		super(currentPosition, speed);
	}
}

class VerticalFireball extends Fireball {
	constructor(currentPosition) {
		let speed = new Vector(0, 2);
		super(currentPosition, speed);
	}
}

class FireRain extends Fireball {
	constructor(currentPosition) {
		let speed = new Vector(0, 3);
		super(currentPosition, speed);
		this.startPosition = currentPosition;
	}

	handleObstacle() {
		this.pos = this.startPosition;
	}
}

class Coin extends Actor {
	constructor(currentPosition) {
		if (!currentPosition) {
			currentPosition = new Vector(0, 0);
		}
		currentPosition = currentPosition.plus(new Vector(0.2, 0.1));
		let size = new Vector(0.6, 0.6);
		super(currentPosition, size);

		this.startPosition = currentPosition;
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * 2 * Math.PI;
	}

	get type() {
		return 'coin';
	}

	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}

	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}

	getNextPosition(time = 1) {
		this.updateSpring(time);
		return this.startPosition.plus(this.getSpringVector());
	}

	act(time = 1) {
		this.pos = this.getNextPosition(time);
	}
}

class Player extends Actor {
	constructor(currentPosition) {
		if (!currentPosition) {
			currentPosition = new Vector(0, 0);
		}
		currentPosition = currentPosition.plus(new Vector(0, -0.5));
		let size = new Vector(0.8, 1.5);
		let speed = new Vector(0, 0);
		super(currentPosition, size, speed);
	}

	get type() {
		return 'player';
	}
}