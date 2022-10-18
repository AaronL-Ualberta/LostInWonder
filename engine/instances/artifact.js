class Artifact extends EngineInstance {
	onEngineCreate() {
		this.setHitbox(new Hitbox(this, new RectangleHitbox(0, 0, 48, 48)));
		this.sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("artifact")), true);
		this.xScale = 0.2;
		this.yScale = 0.2;
	}
}
