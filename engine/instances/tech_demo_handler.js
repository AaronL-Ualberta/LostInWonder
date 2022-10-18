class TechDemoHandler extends EngineInstance {
	onEngineCreate() {
		this.audioSound = $engine.audioPlaySound("Level1Background", 0.5, true);

		this.room_width = RoomManager.currentRoom().getRPGRoomWidth() / 48;
		this.room_height = RoomManager.currentRoom().getRPGRoomHeight() / 48;
		this.camera_dimensions = [1008, 816];

		this.camera = $engine.getCamera();
		// this.camera.setScaleX(0.5);
		// this.camera.setScaleY(0.5);
		this.camera.setDimensions(this.camera_dimensions[0], this.camera_dimensions[1]);
		//this.camera.setY(2 * 48);
		$engine.setBackground(new PIXI.extras.TilingSprite($engine.getTexture("bgfar")));
		this.background = $engine.getBackground();
		this.background.tileScale.set(2, 2);
		this.background.width = this.camera_dimensions[0];
		this.background.height = this.camera_dimensions[1];

		this.foreground = new EmptyInstance();
		this.foreground.setSprite(new PIXI.extras.TilingSprite($engine.getTexture("bgleaves")));
		this.foreground.depth = -1000;
		this.fgSprite = this.foreground.getSprite();
		this.fgSprite.tileScale.set(2, 2);
		this.fgSprite.width = this.room_width * 48;
		this.fgSprite.height = 360;

		this.rayFilter = new PIXI.filters.GodrayFilter();
		this.rayFilter.gain = 0.4;
		this.rayFilter.lucanarity = 2;
		this.rayFilter.alpha = 0.5;
		this.rayFilter_offset = EngineUtils.random(1000);
		this.camera.addFilter(this.rayFilter);

		const leafFilter = new PIXI.filters.AdvancedBloomFilter();
		leafFilter.bloomScale = 1.5;
		this.fgSprite.filters = [leafFilter];

		this.spellWheel = $engine.createManagedRenderable(this, new PIXI.Container());
		this.spellWheel_sprite = $engine.createManagedRenderable(this, new PIXI.Sprite($engine.getTexture("spellwheel")));
		this.spellWheel_sprite.scale.set(2, 2);
		this.spellWheel_sprite.x = this.camera_dimensions[0] - this.spellWheel_sprite.width / 2 - 5;
		this.spellWheel_sprite.y = this.camera_dimensions[1] - this.spellWheel_sprite.height / 2 - 5;
		this.spellWheel.addChild(this.spellWheel_sprite);
		this.spellWheel_rotating = false;
		this.spellWheel_origAngle = 0;
		this.spellWheel_targetAngle = 0;
		this.spellWheel_timer = 0;

		this.timer = 0;
		this.adjustFilter = new PIXI.filters.AdjustmentFilter();
		this.adjustFilter.brightness = 0;
		this.camera.addFilter(this.adjustFilter);
	}

	onCreate() {
		this.onEngineCreate();

		// do stuff
	}

	onRoomStart() {
		this.player = PlayerInstance.first;
	}

	step() {
		var camX = this.camera.getX();
		var camY = this.camera.getY();
		var divVal = 5;
		this.camera.setX(
			EngineUtils.clamp(
				camX - (camX - (this.player.x - this.camera_dimensions[0] / 2)) / divVal,
				0,
				this.room_width * 48 - this.camera_dimensions[0]
			)
		);
		this.camera.setY(
			EngineUtils.clamp(
				camY - (camY - (this.player.y - this.camera_dimensions[1] / 2)) / divVal,
				0,
				this.room_height * 48 - this.camera_dimensions[1]
			)
		);
		this.background.tilePosition.x = -this.camera.getX() / 5;
		this.background.tilePosition.y = -this.camera.getY() / 5;

		this.fgSprite.skew.x = Math.sin($engine.getGameTimer() / 60) / 20;
		this.fgSprite.tilePosition.x = -this.camera.getX() / 1.75;
		this.fgSprite.tilePosition.y = -this.camera.getY() / 1.75;

		this.rayFilter.time = this.camera.getX() / 300 + $engine.getGameTimer() / 200 + this.rayFilter_offset;
		// this.rayFilter.time = $engine.getGameTimer() / 200;

		// Spell wheel rotation
		if (this.spellWheel_rotating) {
			const rot_time_total = 20;
			this.spellWheel_sprite.rotation = EngineUtils.interpolate(
				this.spellWheel_timer / rot_time_total,
				this.spellWheel_origAngle,
				this.spellWheel_targetAngle,
				EngineUtils.INTERPOLATE_OUT
			);
			this.spellWheel_timer++;
			if (this.spellWheel_timer >= rot_time_total) {
				this.spellWheel_rotating = false;
			}
		}

		// Fade in
		if (this.timer < 60) {
			this.adjustFilter.brightness = this.timer / 60;
			this.timer++;
			if (this.timer === 60) {
				this.camera.removeFilter(this.adjustFilter);
			}
		}

		// Check for falling out of the map
		if (this.player.y >= this.room_height * 48) {
			$engine.setRoom(RoomManager.currentRoom().name);
		}
	}

	onDestroy() {
		$engine.audioStopSound(this.audioSound);
	}

	draw(gui, camera) {
		// EngineDebugUtils.drawHitbox(camera, this);
		$engine.requestRenderOnGUI(this.spellWheel);
	}

	spellWheelRotate(toSpellID) {
		// console.log("HLO");
		// this.spellWheel_sprite.rotation = toSpellID * (Math.PI / 2);
		this.spellWheel_rotating = true;
		this.spellWheel_origAngle = this.spellWheel_sprite.rotation;
		//this.spellWheel_targetAngle = -toSpellID * (Math.PI / 2);
		this.spellWheel_targetAngle =
			this.spellWheel_origAngle + V2D.angleDiff(this.spellWheel_origAngle, -toSpellID * (Math.PI / 2));
		this.spellWheel_timer = 0;
	}
}
