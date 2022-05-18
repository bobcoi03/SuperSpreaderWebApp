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

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

class Enemy {
	constructor(app, radius=20, speed=5) {
		this.radius = radius;
		this.startingPositionX;
		this.startingPositionY;
		this.speed = speed;
		this.app = app;
		this.circle = null;
		this.color = 0x031cfc;
	}
	init() {
		this.circle = initCircle(this.app, this.radius, this.startingPositionX, this.startingPositionY, this.color);
		this.setDirection();
	}
	move() {
		this.circle.x += this.speed * Math.cos(this.circle.rotation);
		this.circle.y += this.speed * Math.sin(this.circle.rotation);
	}
	setDirection(AngleInRadians=0.9) {
		this.circle.rotation = AngleInRadians;
	}
	setStartingPosition(screenDisplayWidth, screenDisplayHeight) {
		let sideSpawn = Math.floor(Math.random() * 4);
		console.log(sideSpawn);
		switch (sideSpawn) {
			case 0: // Spawn from left side
				this.startingPositionX = this.radius;
				this.startingPositionY = randomIntFromInterval(0, screenDisplayHeight);
				break;
			case 1: // Spawn from top side
				this.startingPositionX = randomIntFromInterval(0, screenDisplayWidth);
				this.startingPositionY = this.radius;
				break;
			case 2: // Spawn from right side
				this.startingPositionX = screenDisplayWidth - this.radius;
				this.startingPositionY = randomIntFromInterval(0, screenDisplayHeight);
				break;
			case 3: // Spawn from bottom side
				this.startingPositionX = randomIntFromInterval(0, screenDisplayWidth);
				this.startingPositionY = screenDisplayHeight - this.radius;
				break;
		}
		console.log(this.startingPositionX);
		console.log(this.startingPositionY);
	}
}

function main() {
	let ticker = PIXI.Ticker;
	let app = initApp();
	let player = initCircle(app, 17);
	let screenDisplay = initScreenDisplay(app.width);
	let enemy = new Enemy(app);
	enemy.setStartingPosition(screenDisplay.width, screenDisplay.height);
	enemy.init();

	app.stage.addChild(screenDisplay)
	app.stage.addChild(player);
	app.stage.addChild(enemy.circle);

	screenDisplay.on('pointerdown', (event) => {
		player.rotation = findAngleRadians(player.x, player.y, event.data.global.x, event.data.global.y);
	});

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
	window.addEventListener('resize', (event) => {
		screenDisplay.width = window.innerWidth;
		app.width = window.innerWidth;
		location.reload();
	}, true);
	app.ticker.add(() => {
		enemy.move();
	});
	app.ticker.add(move);
}

main();