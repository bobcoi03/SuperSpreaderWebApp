function initCircle(app, circleRadius=15, startingPositionX=50, startingPositionY=50, color=0xFFFF00) {
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
	return circle;
}

function initScreenDisplay(width=640, height=480) {
	if (window.innerWidth < 640) {
		width = window.innerWidth;
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
	if (window.innerWidth < 640) {
		width = window.innerWidth;
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

class Enemy {
	constructor(app, screenDisplayWidth, screenDisplayHeight, radius=20, speed=5,) {
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

// create new instances of Enemy && Enemy.init() 
function createEnemies(length, app, screenDisplayWidth, screenDisplayHeight) {
	let enemies = new Array(length);
	for (var i = 0; i < length; ++i) {
		enemies[i] = new Enemy(app, screenDisplayWidth, screenDisplayHeight);
		enemies[i].init();
	}
	return enemies;
}

function main() {
	let ticker = PIXI.Ticker;
	let app = initApp();
	let player = initCircle(app, 17);
	let screenDisplay = initScreenDisplay(app.width);
	let enemies = createEnemies(10, app, screenDisplay.width, screenDisplay.height);
	// Adds Sprites & Graphics to app
	app.stage.addChild(screenDisplay)
	app.stage.addChild(player);
	for (var i=0; i < enemies.length; ++i) {
		app.stage.addChild(enemies[i].circle);
	}
	/* 	Get location of pointer on pointerdown
	 	event and calculates angle between player
	  	position and pointer position in radians
	*/
	screenDisplay.on('pointerdown', (event) => {
		player.rotation = findAngleRadians(player.x, player.y, event.data.global.x, event.data.global.y);
	});
	// Handles movement for player || out of bounds || move towards move position
	function move() {
		if (player.x < 0 + player.radius) {
			player.x = 0 + player.radius;
		} else if (player.x > screenDisplay.width - player.radius) {
			player.x = screenDisplay.width - player.radius;
		} else if (player.y < 0 + player.radius) {
			player.y = 0 + player.radius;
		} else if (player.y > screenDisplay.height - player.radius) {
			player.y = screenDisplay.height - player.radius;
		} else {
			player.x += 8 * Math.cos(player.rotation);
			player.y += 8 * Math.sin(player.rotation);
		}
		displayInfo(player, app, screenDisplay);
	}
	// Reload page on every resize of window
	window.addEventListener('resize', (event) => {
		screenDisplay.width = window.innerWidth;
		app.width = window.innerWidth;
		location.reload();
	}, true);
	// player move func
	app.ticker.add(move);
	// enemy move func
	app.ticker.add(() => {
		for (var i=0; i < enemies.length; ++i) {
			enemies[i].move();
		}
	});
}

main();