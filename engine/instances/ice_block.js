class IceBlock extends SolidObject {
	onEngineCreate() {
		this.setHitbox(new Hitbox(this, new RectangleHitbox(0, 0, 48, 48)));
        this.sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("ice_block")), true);
		// this.x *= 48;
		// this.y *= 48;
	}

	onCreate(x, y, timer=-1) {
		this.onEngineCreate();
		this.x = x;
		this.y = y;
		this.timer = timer;
		// do stuff
	}

	step() {
		// If there is a time limit set, the ice will melt into water
		if (this.timer === 0) {
			new WaterBlock(this.x, this.y);
			this.destroy();
		} else if (this.timer !== -1) {
			this.timer--;
		}
	}

	draw(gui, camera) {
		// EngineDebugUtils.drawHitbox(camera, this);
	}
}
