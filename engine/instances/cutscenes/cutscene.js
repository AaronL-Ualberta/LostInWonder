class Cutscene extends EngineInstance {
	onEngineCreate() {
		// These should be set in onCutsceneCreate()!! ------------
		this.dialogue_lines = [];
		this.audioSound = null;
		this.title_sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture(background)));
		this.nextRoom = "???";
		// --------------------------------------------------------

		this.title_sprite.width = $engine.getCamera().getWidth();
		this.title_sprite.height = $engine.getCamera().getHeight();

		this.camera = $engine.getCamera();
		this.adjustFilter = new PIXI.filters.AdjustmentFilter();
		this.adjustFilter.brightness = 0;
		this.camera.addFilter(this.adjustFilter);
		this.timer = 0;
		this.timer2 = 0;

		this.startedTalking = false;
		this.visibleFrame = 0;

		this.onCutsceneCreate();
	}

	onCreate(x, y) {
		this.onEngineCreate();
		this.x = 0;
		this.y = 0;
		// do stuff
	}

	onCutsceneCreate() {
		// CUTSCENES SHOULD HAVE THIS STUFF:
		// this.dialogue_lines = [];
		// this.audioSound = null;
		// this.title_sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture(background)));
		// this.nextRoom = "???";
	}

	step() {
		this.timer++;

		// Long fade in
		const fadelength = 160;
		if (this.timer < fadelength) {
			this.adjustFilter.brightness = this.timer / fadelength;
			if (this.timer === fadelength) {
				// this.camera.removeFilter(this.adjustFilter);
				this.adjustFilter.enabled = false;
			}
			return;
		}

		// Dialogue. Detect for completion
		if (this.timer === fadelength + 80) {
			this.startedTalking = true;
			this.dialogue_instance = new Dialogue(0, 0, this.dialogue_lines);
			return;
		}

		// Fade out into level
		if (!IM.exists(this.dialogue_instance) && this.startedTalking === true) {
			this.timer2++;
			this.adjustFilter.enabled = true;

			const delay = 100;
			if (this.timer2 > delay) {
				if (this.timer2 - delay < fadelength) {
					this.adjustFilter.brightness = 1 - (this.timer2 - delay) / fadelength;
					return;
				}
			}

			if (this.timer2 > delay + fadelength) {
				$engine.setRoom(this.nextRoom);
			}
		}
	}

	nextImage() {
		this.visibleFrame += 1;
	}

	onDestroy() {
		$engine.audioStopSound(this.audioSound);
	}

	draw(gui, camera) {
		//$engine.requestRenderOnCamera()
	}
}
