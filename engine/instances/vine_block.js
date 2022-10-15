class VineBlock extends SolidObject {
	onEngineCreate() {
		this.setHitbox(new Hitbox(this, new RectangleHitbox(0, 0, 48, 48)));
		this.sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("vine_block")), true);
	}

	onCreate(x, y) {
		this.onEngineCreate();
		this.x = x;
		this.y = y;
		this.isBurning = false;
		this.burnTimer = -1;
	}

	step() {
		if (this.isBurning) {
			if (this.burnTimer > 0) {
				this.burnTimer--;
			} else {
				// Before destroying self, set adjacent vines on fire
				var vineBlock = IM.instancePlace(this, this.x, this.y - 1, VineBlock);
				if (vineBlock !== undefined) {
					vineBlock.startBurning();
				}
				vineBlock = IM.instancePlace(this, this.x, this.y + 1, VineBlock);
				if (vineBlock !== undefined) {
					vineBlock.startBurning();
				}



				this.destroy();
			}
		}
	}

	startBurning() {
		if (!this.isBurning) {
			this.isBurning = true;
			this.sprite.texture = $engine.getTexture("burning_vine_block");
			this.burnTimer = 60;
		}
	}

	draw(gui, camera) {
		// EngineDebugUtils.drawHitbox(camera, this);
	}
}
