function main() {
	let ticker = PIXI.Ticker;
	let app = initApp();
	let circle = initCircle(app, 25);
	let screenDisplay = initScreenDisplay();

	app.stage.addChild(screenDisplay)
	app.stage.addChild(circle);

	screenDisplay.on('pointerdown', (event) => {
		circle.rotation = findAngleRadians(circle.x, circle.y, event.data.global.x, event.data.global.y);
	});

	function move() {
		if (circle.x < 0 + circle.radius) {
			circle.x = 0 + circle.radius;
		} else if (circle.x > screenDisplay.width - circle.radius) {
			circle.x = screenDisplay.width - circle.radius;
		} else if (circle.y < 0 + circle.radius) {
			circle.y = 0 + circle.radius;
		} else if (circle.y > screenDisplay.height - circle.radius) {
			circle.y = screenDisplay.height - circle.radius;
		} else {
			circle.x += 8 * Math.cos(circle.rotation);
			circle.y += 8 * Math.sin(circle.rotation);
		}
		displayInfo(circle);
	}
	window.addEventListener('resize', (event) => {
		screenDisplay.width = window.innerWidth;
		app.width = window.innerWidth;
	}, true);
	app.ticker.add(move);
}

function initCircle(app, circleRadius=15) {
	let circle = new PIXI.Graphics();
	circle.beginFill(0xFFFF00);
	circle.drawCircle(200, 200, circleRadius);
	circle.endFill();
	circle = app.renderer.generateTexture(circle);
	circle = new PIXI.Sprite(circle);
	circle.x = 200;
	circle.y = 200;
	circle.anchor.set(0.5, 0.5);
	circle.radius = circleRadius;
	return circle;
}

function initScreenDisplay(width=640, height=480) {
	let screenDisplay = new PIXI.Graphics();
	screenDisplay.beginFill(0x000000);
	screenDisplay.drawRect(0,0, width, height);
	screenDisplay.endFill()
	screenDisplay.interactive = true;
	screenDisplay.buttonMode = true;
	screenDisplay.width = width;
	return screenDisplay;
}

function initApp() {
	let app = new PIXI.Application({ width: 640, height: 480, backgroundColor: 0xFFFFFF, antialias: true });
	app.stage.interactive = true;
	document.getElementById('gameDisplay').appendChild(app.view);
	return app;
}

function findAngleRadians(initialX, initialY, finalX, finalY) {
	return Math.atan2(finalY - initialY, finalX - initialX);
}

function displayInfo(circle) {
	document.getElementById('info').innerHTML = `window.innerWidth: ${ window.innerWidth }|Circle.radius: ${circle.radius}|Circle.x: ${Math.round(circle.x)}|Circle.y: ${Math.round(circle.y)}`;
}

main();