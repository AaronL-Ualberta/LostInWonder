class Artifact extends EngineInstance {
	onEngineCreate() {
		this.setHitbox(new Hitbox(this, new RectangleHitbox(0, 0, 48, 48)));
		this.sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("artifact")), true);
		this.xScale = 0.2;
		this.yScale = 0.2;
	}

	onRoomStart() {
		this.global = Global.first;
	}

	step() {
		if (IM.instanceCollision(this, this.x, this.y, PlayerInstance)) {
			this.global.artifact_count += 1;
			this.destroy();
		}
	}
}
