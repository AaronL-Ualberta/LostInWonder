class Leaf extends EngineInstance {
	onCreate(x, intercept) {
		this.x = x;
		this.y = 0;
		this.speed = EngineUtils.irandomRange(2, 5);
		this.slope = EngineUtils.randomRange(-2, 2);
		while (!this.a) {
			this.a = EngineUtils.randomRange(-2, 2);
		}
		this.intercept = intercept;

		this.xOffset = EngineUtils.randomRange(0.1, 0.3);
		this.yOffset = EngineUtils.randomRange(0.2, 0.4);
		this.setSprite(new PIXI.Sprite($engine.getTexture("leaf")), true);

		const red = Math.round(EngineUtils.irandomRange(60, 100));
		const green = Math.round(255 * EngineUtils.randomRange(0.3, 0.8));
		const blue = Math.round(EngineUtils.irandomRange(60, 100));
		this.getSprite().tint = (red << 16) | (green << 8) | blue;

		this.setHitbox(new Hitbox(this, new RectangleHitbox(0, 0, 36, 36)));
		this.timer = 500;
	}

	step() {
		this.x += this.speed;
		this.y = this.slope * this.x + this.intercept;
		var scale = Math.sin(this.x / 50);
		this.xScale = this.xOffset - scale / 10;
		this.yScale = this.yOffset - scale / 10;
		this.timer--;
		if (this.timer === 0) {
			this.destroy();
		}
	}
}

class LeafCreate extends EngineInstance {
	onEngineCreate() {
		this.timer = 10;
	}

	step() {
		this.timer--;
		if (this.timer == 0) {
			var cam = $engine.getCamera().getBoundingBox();
			//var x = PlayerInstance.first.x - (cam.x1 + cam.x2) / 2 - EngineUtils.irandom(500, 1000);
			var x = PlayerInstance.first.x - (cam.x1 + cam.x2) / 2 - EngineUtils.irandom(500, 1000);
			for (let i = 0; i < 20; i++) {
				var intercept = EngineUtils.irandomRange(cam.y1, cam.y2);
				new Leaf(x, intercept);
			}
			this.timer = 100;
		}
	}
}
