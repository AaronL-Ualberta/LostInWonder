// WARNING: This class should always have a vine_block above it if you want it to float.
class BoulderBlock extends SolidObject {
	onEngineCreate() {
		this.setHitbox(new Hitbox(this, new RectangleHitbox(-24, -24, 24, 24)));
		this.sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("boulder_block")), true);
		this.isFalling = false;
	}

	onCreate(x, y) {
		this.onEngineCreate();
		this.x = x;
		this.y = y;
	}

	step() {
		var vineBlock = IM.instancePlace(this, this.x, this.y - 48, VineBlock);
		// Start falling
		if (vineBlock === undefined) {
			if (!this.isFalling) {
				// Boulder Drop Sound Effect
				$engine.audioPlaySound("BoulderDropSoundEffect", 0.3, false);
				this.isFalling = true;
			}
			var belowBlock = IM.instancePlace(this, this.x, this.y + 3, SolidObject);
			if (belowBlock === undefined) {
				this.y += 3;
			}
		}
	}

	draw(gui, camera) {
		// EngineDebugUtils.drawHitbox(camera, this);
	}
}
