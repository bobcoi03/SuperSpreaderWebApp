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

function displayStats(player, ) {
	document.getElementById('info').innerHTML = `player.mouseClickAndInsideEnemy: ${player.mouseClickAndInsideEnemy}|player.score: ${player.score}`;
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
		this.id = '_' + Math.random().toString(36).substr(2, 9);
		this.changedColor = false;
	}
	init() {
		this.setStartingPosition();
		this.circle = initCircle(this.app, this.radius, this.startingPositionX, this.startingPositionY, this.color);
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
	changeColor(color) {
		if (!this.changedColor) {
			this.color = color;
			console.log(this.color);
			this.circle = initCircle(this.app, this.radius, this.startingPositionX, this.startingPositionY, this.color, 2);
			this.changedColor = true;
			console.log("enemy.changedColor() is ran");
		}
	}
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
		this.mouseClickAndInsideEnemy=false; // whilst player inside enemy and mouse is clicked, set to true when outside of enemy, set to false
		this.mouseClickAndInsideEnemyTime; // When mouse is clicked and when player is inside enemy start a timer with performance.now()
		this.score = 0;
		this.allowFirstClick=true; // first click can happen anytime
		this.infectedEnemies = []; // array contains id of enemies that have been infected
	}
	init() {
		this.circle = initCircle(this.app, this.radius);
	}
	// list of enemy objects to detect collision
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

				// Add enemy to infectedEnemies list by using ID
				if (!this.infectedEnemies.includes(enemies[i].id)) {
					this.infectedEnemies.push(enemies[i].id);
				}
			} else if (this.mouseClickAndInsideEnemy && this.insideEnemy) {
				this.speed = this.initialSpeed;
				if (!collisionDetection(this.circle, enemies[i].circle) && performance.now() - this.mouseClickAndInsideEnemyTime > 180) {
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
	setScore() {
		if (this.infectedEnemies.length != undefined) {
			this.score = this.infectedEnemies.length;
		}
	}
}
class ManageEnemies {
	constructor(spawnAmountEachTime, app, screenDisplayWidth, screenDisplayHeight, radius, speed) {
		this.spawnAmountEachTime = spawnAmountEachTime;
		this.app = app;
		this.screenDisplayWidth = screenDisplayWidth;
		this.screenDisplayHeight = screenDisplayHeight;
		this.radius = radius;
		this.speed = speed;
		// set first wave of Enemy spawn // Array of Enemies objects. // Also list of all on screen enemies	
		this._enemies = createEnemies(this.spawnAmountEachTime, this.app, this.screenDisplayWidth, this.screenDisplayHeight, this.radius, this.speed);
		this.spawnTimer = performance.now(); // When createEnemies() is ran create a spawnTimer
		this.spawnInterval = randomIntFromInterval(500, 2000); // spawn interval between 2000 milliseconds & 5000 milliseconds
	}
	addEnemies() {
		// This should be put in the gameloop funct
		// When now() - spawnTimer > 2 to 5 seconds, add enemies to list of _enemies
		// Reset spawnInterval & spawnTimer
		if (performance.now() - this.spawnTimer > this.spawnInterval) {
			this._newEnemies = createEnemies(this.spawnAmountEachTime, this.app, this.screenDisplayWidth, this.screenDisplayHeight, this.radius, this.speed);
			for (var i = 0; i < this._newEnemies.length; ++i) {
				this._enemies.push(this._newEnemies[i]);
			}
			console.log(this.spawnInterval);
			this.spawnInterval = randomIntFromInterval(500, 2000); // reset spawn interval timer
			this.spawnTimer = performance.now();
			return this._newEnemies; // return a list of enemy objects to add to app.stage
		}
	}
	removeEnemies(index) {
		this._enemies.splice(index, 1);
	}
	get enemies() {
		return this._enemies;
	}
	get newEnemies() {
		return this._newEnemies;
	}
	recordInfected(infectedEnemies) {
		// If collided with enemy and enemy.changedColor = false -> change color of enemy
		for (var i = 0; i < this._enemies.length; ++i) {
			if (infectedEnemies.includes(this._enemies[i].id)) {
				this._enemies[i].changeColor(0x00FF00);
			}
		}

	}
	// Create and return a list of enemy objects
}

function main() {
	// Declare some stuff
	let ticker = PIXI.Ticker;
	
	let app = initApp();

	let screenDisplay = initScreenDisplay(app.width);

	let player = new Player(app, screenDisplay.width, screenDisplay.height, 16, 6);
	player.init();

	manageEnemies = new ManageEnemies(4, app, screenDisplay.width, screenDisplay.height, 20, 4);
	enemiesList = manageEnemies.enemies;
	
	// Adds Sprites & Graphics to app stage
	app.stage.addChild(screenDisplay);
	// Add initial enemy list to app stage
	for (var i=0; i < enemiesList.length; ++i) {
		app.stage.addChild(enemiesList[i].circle);
	}

	let covidSprite = PIXI.Sprite.from('../images/covid-sprite.png');
	covidSprite.x = player.circle.x;
	covidSprite.y = player.circle.y;
	covidSprite.anchor.set(0.5, 0.5);
	// covidSprite is 225x225 pixel image
	covidSprite.scale.x = 0.25;
	covidSprite.scale.y = 0.25;
	app.stage.addChild(covidSprite);
	app.stage.setChildIndex(covidSprite, 5);

	// Add player sprite
	app.stage.addChild(player.circle);
	app.stage.setChildIndex(player.circle, 2);
	/* 	Get location of pointer on pointerdown
	 	event and calculates angle between player
	  	position and pointer position in radians
	*/

	screenDisplay.on('pointerdown', (event) => {
		for (var i=0; i < enemiesList.length; ++i) {
			if (collisionDetection(player.circle, enemiesList[i].circle)) {
				player.mouseClickAndInsideEnemy = true;
				player.mouseClickAndInsideEnemyTime = performance.now();
			}
		}
		// Run setDirection if it's first click
		if (player.allowFirstClick) {
			player.setDirection(event.data.global.x, event.data.global.y);
			player.allowFirstClick = false;
		}
		// Only allow setDirection() when inside enemy
		if (player.insideEnemy) {
			player.setDirection(event.data.global.x, event.data.global.y);
		}
	});
	// Reload page on every resize of window
	window.addEventListener('resize', (event) => {
		screenDisplay.width = window.innerWidth;
		app.width = window.innerWidth;
		location.reload();
	}, true);

	function gameLoop() {
		// handles move function for enemies
		for (var i=0; i < enemiesList.length; ++i) {
			// delete enemy when out of screen
			// remove from enemiesList
			if (enemiesList[i].dead == true) {
				app.stage.removeChild(enemiesList[i].circle);
				enemiesList.splice(i, 1);
			} else {
			// change x, y coordinates based on direction
				enemiesList[i].move();
			}
		}
		// handles move func
		displayStats(player);

		// Add new enemies to stage & enemiesList
		if (manageEnemies.addEnemies() != undefined) {
			console.log("Spawn function is called");
			manageEnemies.addEnemies();
			for (var i = 0; i < manageEnemies.newEnemies.length; ++i) {
				app.stage.addChild(manageEnemies.newEnemies[i].circle);
				app.stage.setChildIndex(manageEnemies.newEnemies[i].circle, 1);
			}
		}
		// move function for player pass enemiesList to detect collision
		player.move(enemiesList);
		player.setScore();

		//rotate covid sprite
		covidSprite.x = player.circle.x;
		covidSprite.y = player.circle.y;
		covidSprite.rotation += 0.05;

		// change color of infected enemies given array of infected enemies id.
	//	manageEnemies.recordInfected(player.infectedEnemies);
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