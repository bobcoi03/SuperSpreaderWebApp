PIXI.utils.sayHello();

function main() {
	let app = new PIXI.Application({width: 640, height: 480, backgroundColor: 0x3440eb });
	let ticker = PIXI.Ticker
	document.body.appendChild(app.view);

	let graphics = new PIXI.Graphics();
	graphics.beginFill(0xffffff);
	graphics.drawCircle(30, 30, 20);
	graphics.endFill(); 

	app.stage.addChild(graphics);
}

main();