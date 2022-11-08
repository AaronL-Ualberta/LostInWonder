class Level2IntroCutscene extends Cutscene {
	// Swap Engine Instance with SoildObject if you want collision
	onEngineCreate() {
		this.audioSound = $engine.audioPlaySound("JungleAmbience", 0.07, true);

		this.title_sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("level_4_intro_cutscene")));
		this.title_sprite.width = $engine.getCamera().getWidth();
		this.title_sprite.height = $engine.getCamera().getHeight();

		this.camera = $engine.getCamera();
		this.adjustFilter = new PIXI.filters.AdjustmentFilter();
		this.adjustFilter.brightness = 0;
		this.camera.addFilter(this.adjustFilter);
		this.timer = 0;
		this.timer2 = 0;

		this.lines = [
			new DialogueLine("This place doesn’t look very safe…", LARAYA_PORTRAITS.SURPRISED),
			new DialogueLine("Ah! What was that! Who goes there! Show yourself!", LARAYA_PORTRAITS.SCARED),
			new DialogueLine("Well you don’t sound very scary, so please don’t eat my hand!", LARAYA_PORTRAITS.SCARED),
			new DialogueLine(
				"Oh! An axodile! Out of the water? And injured? What happened to you?",
				LARAYA_PORTRAITS.SURPRISED
			),
			new DialogueLine(
				"I read about your kind, buddy, and I think I know how to help! You can regenerate naturally, but you need to be in water for that.",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine(
				"So all I have to do is clean this up and get you into that pool over there, and you’ll be right as rain!",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine(
				"Someone did this on purpose, and tried to make it look like an accident if anyone came by! But who… Ximara.",
				LARAYA_PORTRAITS.ANGRY
			),
			new DialogueLine("I saw these scales in her despicable workshop.", LARAYA_PORTRAITS.ANGRY),
		];

		this.startedTalking = false;
	}

	onCreate(x, y) {
		this.onEngineCreate();
		this.x = 0;
		this.y = 0;
		// do stuff
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
			this.dialogue_instance = new Dialogue(0, 0, this.lines);
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
				$engine.setRoom("Level4");
			}
		}
	}

	onDestroy() {
		$engine.audioStopSound(this.audioSound);
	}
}
