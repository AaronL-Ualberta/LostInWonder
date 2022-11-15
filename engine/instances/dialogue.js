class Dialogue extends EngineInstance {
	// Swap Engine Instance with SoildObject if you want collision
	onEngineCreate(lines, pause_level = false) {
		// Dialogue
		this.portrait_angry = $engine.getTexture("dial_laraya_angry");
		this.portrait_hurt = $engine.getTexture("dial_laraya_hurt");
		this.portrait_happy = $engine.getTexture("dial_laraya_happy");
		this.portrait_scared = $engine.getTexture("dial_laraya_scared");
		this.portrait_surprised = $engine.getTexture("dial_laraya_surprised");
		this.portrait_textures = [];
		this.portrait_textures[LARAYA_PORTRAITS.HAPPY] = this.portrait_happy;
		this.portrait_textures[LARAYA_PORTRAITS.ANGRY] = this.portrait_angry;
		this.portrait_textures[LARAYA_PORTRAITS.HURT] = this.portrait_hurt;
		this.portrait_textures[LARAYA_PORTRAITS.SCARED] = this.portrait_scared;
		this.portrait_textures[LARAYA_PORTRAITS.SURPRISED] = this.portrait_surprised;

		// Non-laraya's
		this.portrait_textures[XIMARA_PORTRAITS.NEUTRAL] = $engine.getTexture("dial_ximara");
		this.portrait_textures[MARALAN_PORTRAITS.NEUTRAL] = $engine.getTexture("dial_maralan");
		this.portrait_textures[FLICKOW_PORTRAITS.NEUTRAL] = $engine.getTexture("dial_flickow");
		this.portrait_textures[AXODILE_PORTRAITS.HAPPY] = $engine.getTexture("dial_axodile_happy");
		this.portrait_textures[AXODILE_PORTRAITS.HURT] = $engine.getTexture("dial_axodile_hurt");
		this.portrait_textures[ELDER_PORTRAITS.NEUTRAL] = $engine.getTexture("dial_elder");

		this.dialogue = $engine.createManagedRenderable(this, new PIXI.Container());
		this.dialogue_sprite = $engine.createManagedRenderable(this, new PIXI.Sprite($engine.getTexture("dial_box")));
		this.dialogue_portrait = $engine.createManagedRenderable(this, new PIXI.Sprite(this.portrait_angry));
		this.dialogue_char_name = $engine.createManagedRenderable(
			this,
			new PIXI.Text("Laraya", { ...$engine.getDefaultTextStyle() })
		);
		// {
		// 	fontFamily : 'Arial',
		// 	fontSize: 40,
		// 	fill : 0x000000,
		// 	align : 'center',
		// }));
		this.dialogue_text = $engine.createManagedRenderable(
			this,
			new PIXI.Text("Laraya", {
				fontFamily: "Arial",
				fontSize: 24,
				fill: 0x000000,
				align: "left",
				wordWrap: true,
				wordWrapWidth: 500,
			})
		);
		this.dialogue.addChild(this.dialogue_sprite);
		this.dialogue.addChild(this.dialogue_portrait);
		this.dialogue.addChild(this.dialogue_char_name);
		this.dialogue.addChild(this.dialogue_text);

		// The BOX
		const w = 18;
		this.dialogue_sprite.scale.set(w, 5);
		this.dialogue_sprite.x = (1008 - w * 48) / 2;
		this.dialogue_sprite.y = 48 * 11;

		// The FACE
		const scale = 0.22;
		this.dialogue_portrait.scale.set(scale, scale);
		this.dialogue_portrait.x = this.dialogue_sprite.x - 100;
		this.dialogue_portrait.y = this.dialogue_sprite.y - 160;

		// Char Name
		this.dialogue_char_name.x = this.dialogue_sprite.x + 300;
		this.dialogue_char_name.y = this.dialogue_sprite.y + 15;

		// Dialogue text
		this.dialogue_text.x = this.dialogue_sprite.x + 330;
		this.dialogue_text.y = this.dialogue_sprite.y + 65;

		// Params
		this.time_per_char = 2;
		this.timer = 0;

		// Conversation
		this.lines = lines;
		// [
		// 	new DialogueLine("Hey! Why are you me!? You look too evil, though.", this.portrait_angry),
		// 	new DialogueLine("Press W to jump, and press Q and E to swap between spells:", this.portrait_surprised),
		// 	new DialogueLine("Click on the screen while using FIRE to shoot a fireball,", this.portrait_scared),
		// 	new DialogueLine("Walk on water by freezing it while using WATER,", this.portrait_angry),
		// 	new DialogueLine("Hold toward a wall while using EARTH to slide down and jump off of it,", this.portrait_happy),
		// 	new DialogueLine("And finally, jump while airborne using AIR to double jump!", this.portrait_surprised),
		// 	new DialogueLine("Ack... too many instructions!", this.portrait_hurt),
		// ];
		// this.dialogue_text = this.lines[0].text;
		this.dialogue_portrait.texture = this.portrait_textures[this.lines[0].image];

		this.line_on = 0;
		this.first_frame = true;

		if (pause_level) {
			this.pause_level = true;
			$engine.pauseGameSpecial(this);
		}
	}

	onCreate(x, y, lines, pause_level = false, func = null) {
		this.onEngineCreate(lines, pause_level);
		this.callback = func;
		this.x = x;
		this.y = y;
		// do stuff
	}

	step() {
		if (this.first_frame) {
			this.first_frame = false;
		} else {
			if (this.timer !== -1) {
				this.timer++;
				this.dialogue_text.text = this.lines[this.line_on].text.substr(0, this.timer / this.time_per_char);
				if (IN.keyCheckPressed("KeyZ")) {
					this.timer = -1;
					$engine.audioStopSound("DialogueSoundEffect");
				}
				if (this.timer / this.time_per_char > this.lines[this.line_on].text.length) {
					this.timer = -1;
					$engine.audioStopSound("DialogueSoundEffect");
				}
			} else {
				this.dialogue_text.text = this.lines[this.line_on].text;
				if (IN.keyCheckPressed("KeyZ")) {
					// Change to next slide
					if (this.line_on === this.lines.length - 1) {
						// Dialogue ends
						this.dialogueEnd();
					} else {
						this.timer = 0;
						this.line_on++;
						if (this.lines[this.line_on].text === DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE) {
							// Switch to the next image in the cutscene
							var cutscene = Cutscene.first;
							cutscene.nextImage();

							this.dialogue.visible = false;
							// this.line_on++;
						} else {
							this.dialogue.visible = true;
							$engine.audioPlaySound("DialogueSoundEffect", 0.07, true);
						}
						this.dialogue_portrait.texture = this.portrait_textures[this.lines[this.line_on].image];
						this.dialogue_char_name.text = this.lines[this.line_on].name;
						this.dialogue_text.text = "";
					}
				}
			}
		}
	}

	draw(gui, camera) {
		$engine.requestRenderOnGUI(this.dialogue);
	}

	dialogueEnd() {
		if (this.pause_level) {
			$engine.unpauseGameSpecial();
		}
		if (this.callback) {
			this.callback();
		}
		this.destroy();
	}
}

class DialogueLine {
	constructor(text, image, name = "Laraya") {
		this.text = text;
		this.image = image; //Integer, e.g. LARAYA_PORTRAITS.HAPPY
		this.name = name;
	}
}

class LARAYA_PORTRAITS {}
LARAYA_PORTRAITS.HAPPY = "laraya_happy";
LARAYA_PORTRAITS.ANGRY = "laraya_angry";
LARAYA_PORTRAITS.SURPRISED = "laraya_surprised";
LARAYA_PORTRAITS.SCARED = "laraya_scared";
LARAYA_PORTRAITS.HURT = "laraya_hurt";

class XIMARA_PORTRAITS {}
XIMARA_PORTRAITS.NEUTRAL = "ximara";

class MARALAN_PORTRAITS {}
MARALAN_PORTRAITS.NEUTRAL = "maralan";

class FLICKOW_PORTRAITS {}
FLICKOW_PORTRAITS.NEUTRAL = "flickow";

class AXODILE_PORTRAITS {}
AXODILE_PORTRAITS.HAPPY = "axodile_happy";
AXODILE_PORTRAITS.HURT = "axodile_hurt";

class ELDER_PORTRAITS {}
ELDER_PORTRAITS.NEUTRAL = "elder";

class DIALOGUE_COMMANDS {}
DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE = "COMMAND_NEXT_CUTSCENE_IMAGE";
