function initCircle(app, circleRadius=15, startingPositionX=50, startingPositionY=50, color=0xFFFF00, zIndex=0) {
	let circle = new PIXI.Graphics();
	circle.beginFill(color);
	circle.drawCircle(startingPositionX, startingPositionY, circleRadius);
	circle.endFill();
	circle = app.renderer.generateTexture(circle);
	circle = new PIXI.Sprite(circle);
	circle.x = startingPositionX;
	circle.y = startingPositionY;
	circle.anchor.set(0.5, 0.5);
	circle.radius = circleRadius;
	circle.zIndex = zIndex;
	return circle;
}

function initScreenDisplay(width=640, height=480) {
	if (window.innerWidth < width) {
		width = window.innerWidth;
	} else if (window.innerHeight < height) {
		height = window.innerHeight;
	}
	let screenDisplay = new PIXI.Graphics();
	screenDisplay.beginFill(0x000000);
	screenDisplay.drawRect(0,0, width, height);
	screenDisplay.endFill()
	screenDisplay.interactive = true;
	screenDisplay.buttonMode = true;
	screenDisplay.width = width;
	return screenDisplay;
}

function initApp(width=640, height=480) {
	if (window.innerWidth < width) {
		width = window.innerWidth;
	} else if (window.innerHeight < height) {
		height = window.innerHeight;
	}
	let app = new PIXI.Application({ width: width, height: height, backgroundColor: 0xFFFFFF, antialias: true });
	app.stage.interactive = true;
	document.getElementById('gameDisplay').appendChild(app.view);
	return app;
}

function findAngleRadians(initialX, initialY, finalX, finalY) {
	return Math.atan2(finalY - initialY, finalX - initialX);
}

function displayInfo(circle, app, screenDisplay) {
	document.getElementById('info').innerHTML = `window.innerWidth: ${ window.innerWidth }|player.radius: ${circle.radius}|player.x: ${Math.round(circle.x)}|player.y: ${Math.round(circle.y)}|ScreenDisplay.width:${screenDisplay.width}|ScreenDisplay.height:${screenDisplay.height}|player.rotation: ${circle.rotation}`;
}
// Given two numbers, returns  a random float rounded to two decimal places between the two 
function getRandomArbitrary(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}
// Same as above function just with integer
function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// create new instances of Enemy && Enemy.init() 
function createEnemies(length, app, screenDisplayWidth, screenDisplayHeight, radius, speed) {
	let enemies = new Array(length);
	for (var i = 0; i < length; ++i) {
		enemies[i] = new Enemy(app, screenDisplayWidth, screenDisplayHeight, radius, speed);
		enemies[i].init();
	}
	return enemies;
}
function collisionDetection(a, b) {
	// detects when two Sprites collide with each other using a rectangular hitbox
	let ab = a.getBounds();
	let bb = b.getBounds();
	return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

function displayStats(player) {
	document.getElementById('info').innerHTML = `player.mouseClickAndInsideEnemy: ${player.mouseClickAndInsideEnemy}`;
}

class Enemy {
	constructor(app, screenDisplayWidth, screenDisplayHeight, radius=20, speed=5) {
		this.radius = radius;
		this.startingPositionX;
		this.startingPositionY;
		this.speed = speed;
		this.app = app;
		this.circle = null;
		this.color = 0x031cfc;
		this.screenDisplayWidth = screenDisplayWidth;
		this.screenDisplayHeight = screenDisplayHeight;
		this.sideSpawn; // side enemy is spawned. 0 = left, 1 = top, 2 = right, 3 = bottom
		this.dead;
	}
	init() {
		this.setStartingPosition();
		this.circle = initCircle(this.app, this.radius, this.startingPositionX, this.startingPositionY, this.color);
		console.log(`Enemy: ${this.circle.zIndex}`);
		this.setDirection(this.sideSpawn);
	}
	move() {
		if (!this.outOfBounds()) {
			this.circle.x += this.speed * Math.cos(this.circle.rotation);
			this.circle.y += this.speed * Math.sin(this.circle.rotation);
		}
	}
	setDirection(caseNumber) {
		// 6.28 radians in a circle
		switch (caseNumber) {
			case 0:
				this.circle.rotation = getRandomArbitrary(0, 1.57) - 1.57;
				break;
			case 1:
				this.circle.rotation = getRandomArbitrary(1.57, 3.14) - 1.57;
				break;
			case 2:
				this.circle.rotation = getRandomArbitrary(3.14, 4.71) - 1.57;
				break;
			case 3:
				this.circle.rotation = getRandomArbitrary(4.71, 6.28) - 1.57;
				break;
		}
	}
	setStartingPosition() {
		this.sideSpawn = Math.floor(Math.random() * 4);
		switch (this.sideSpawn) {
			case 0: // Spawn from left side
				this.startingPositionX = this.radius;
				this.startingPositionY = randomIntFromInterval(0, this.screenDisplayHeight);
				break;
			case 1: // Spawn from top side
				this.startingPositionX = randomIntFromInterval(0, this.screenDisplayWidth);
				this.startingPositionY = this.radius;
				break;
			case 2: // Spawn from right side
				this.startingPositionX = this.screenDisplayWidth - this.radius;
				this.startingPositionY = randomIntFromInterval(0, this.screenDisplayHeight);	
				break;
			case 3: // Spawn from bottom side
				this.startingPositionX = randomIntFromInterval(0, this.screenDisplayWidth);
				this.startingPositionY = this.screenDisplayHeight - this.radius;
				break;
		}
	}
	outOfBounds() {
		if (this.circle.x < 0 - this.radius*2 || this.circle.x > this.screenDisplayWidth + this.radius || this.circle.y < 0 - this.radius*2 || this.circle.y > this.screenDisplayHeight + this.radius) {
			this.dead = true;
			return true;
		} else {
			return false;
		}
	}
	/*
	deleteObject() {
		delete this.color;
		delete this.screenDisplayWidth;
		delete this.screenDisplayHeight;
		delete this.sideSpawn;
		delete this.radius;
		delete this.startingPositionX;
		delete this.startingPositionY;
		delete this.circle;
	}
	*/
}
class Player {
	constructor(app, screenDisplayWidth, screenDisplayHeight, radius=15, speed=5) {
		this.radius = radius;
		this.startingPositionX;
		this.startingPositionY;
		this.speed = speed;
		this.initialSpeed = speed;
		this.app = app;
		this.circle;
		this.color = 0x031cfc;
		this.screenDisplayWidth = screenDisplayWidth;
		this.screenDisplayHeight = screenDisplayHeight;
		this.insideEnemy = false; // if Player is inside an enemy set to true
		this.mouseClickAndInsideEnemy=false; // whilst player inside enemy and mouse is clicked, set to true 
		this.mouseClickAndInsideEnemyTime;
	}
	init() {
		this.circle = initCircle(this.app, this.radius, );
		this.circle.zIndex = 2;
		console.log(this.circle.zIndex);
	}
	move(enemies) {
		// Handles movement for player || out of bounds || move towards move position
		/*
		if (this.circle.x < 0 + this.circle.radius) {
			this.circle.x = 0 + this.circle.radius;
		} else if (this.circle.x > this.screenDisplayWidth - this.circle.radius) {
			this.circle.x = this.screenDisplayWidth - this.circle.radius;
		} else if (this.circle.y < 0 + this.circle.radius) {
			this.circle.y = 0 + this.circle.radius;
		} else if (this.circle.y > this.screenDisplayHeight - this.circle.radius) {
			this.circle.y = this.screenDisplayHeight - this.circle.radius;
		}
		*/
		// Check for collision
		for (var i = 0; i < enemies.length; i++) {
			if (collisionDetection(this.circle, enemies[i].circle) && !this.insideEnemy) {
				this.insideEnemy = true;
				this.circle.x = enemies[i].circle.x;
				this.circle.y = enemies[i].circle.y;
				this.speed = enemies[i].speed;
				this.circle.rotation = enemies[i].circle.rotation;
				console.log("collision detected");
			} else if (this.mouseClickAndInsideEnemy && this.insideEnemy) {
				this.speed = this.initialSpeed;
				if (!collisionDetection(this.circle, enemies[i].circle) && performance.now() - this.mouseClickAndInsideEnemyTime > 160) {
						console.log("this.mouseClickAndInsideEnemy set to false");
						this.mouseClickAndInsideEnemy = false;
						this.insideEnemy = false;
						this.mouseClickAndInsideEnemyTime = null;
				}
			}
		}
		this.circle.x += this.speed * Math.cos(this.circle.rotation);
		this.circle.y += this.speed * Math.sin(this.circle.rotation);
	}
	// Set rotation based on the angle between circle.x, circle.y and pointer.x, pointer.y
	setDirection(pointerX, pointerY) {
		this.circle.rotation = findAngleRadians(this.circle.x, this.circle.y, pointerX, pointerY);
	}
}

function main() {
	// Declare some stuff
	let ticker = PIXI.Ticker;
	let app = initApp();
	let screenDisplay = initScreenDisplay(app.width);
	let player = new Player(app, screenDisplay.width, screenDisplay.height, 16, 6);
	player.init();
	let enemies = createEnemies(2, app, screenDisplay.width, screenDisplay.height, 20, 1);
	// Adds Sprites & Graphics to app
	app.stage.addChild(screenDisplay);
	for (var i=0; i < enemies.length; ++i) {
		app.stage.addChild(enemies[i].circle);
	}
	app.stage.addChild(player.circle);
	/* 	Get location of pointer on pointerdown
	 	event and calculates angle between player
	  	position and pointer position in radians
	*/

	screenDisplay.on('pointerdown', (event) => {
		for (var i=0; i < enemies.length; ++i) {
			if (collisionDetection(player.circle, enemies[i].circle)) {
				console.log("pointer down when inside enemy");
				player.mouseClickAndInsideEnemy = true;
				player.mouseClickAndInsideEnemyTime = performance.now();
			}
		}
		player.setDirection(event.data.global.x, event.data.global.y);
	});
	// Reload page on every resize of window
	window.addEventListener('resize', (event) => {
		screenDisplay.width = window.innerWidth;
		app.width = window.innerWidth;
		location.reload();
	}, true);

	function gameLoop() {
		// handles move function for enemies
		for (var i=0; i < enemies.length; ++i) {
			// delete enemy when out of screen
			if (enemies[i].dead == true) {
				app.stage.removeChild(enemies[i].circle);
			} else {
				enemies[i].move();
			}
		}
		// handles move func
		displayStats(player);
		player.move(enemies);
	}
	app.ticker.add(gameLoop);
}

/*
	There are three states of player

	1) Moving freely in black space

	2) Inside Enemy without mouse clicked


	3) Inside Enemy and mouse clicked
*/

main();