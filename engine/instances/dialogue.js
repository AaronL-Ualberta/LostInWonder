class Dialogue extends EngineInstance {
	// Swap Engine Instance with SoildObject if you want collision
	onEngineCreate(lines) {
		// Dialogue
		this.portrait_angry = $engine.getTexture("dial_laraya_angry");
		this.portrait_hurt = $engine.getTexture("dial_laraya_hurt");
		this.portrait_happy = $engine.getTexture("dial_laraya_happy");
		this.portrait_scared = $engine.getTexture("dial_laraya_scared");
		this.portrait_surprised = $engine.getTexture("dial_laraya_surprised");
		this.laraya_portraits = [];
		this.laraya_portraits[LARAYA_PORTRAITS.HAPPY] = this.portrait_happy;
		this.laraya_portraits[LARAYA_PORTRAITS.ANGRY] = this.portrait_angry;
		this.laraya_portraits[LARAYA_PORTRAITS.HURT] = this.portrait_hurt;
		this.laraya_portraits[LARAYA_PORTRAITS.SCARED] = this.portrait_hurt;
		this.laraya_portraits[LARAYA_PORTRAITS.SURPRISED] = this.portrait_surprised;

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
		this.dialogue_portrait.texture = this.lines[0].image;

		this.line_on = 0;
		this.first_frame = true;
	}

	onCreate(x, y, lines) {
		this.onEngineCreate(lines);
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
				}
				if (this.timer / this.time_per_char > this.lines[this.line_on].text.length) {
					this.timer = -1;
				}
			} else {
				this.dialogue_text.text = this.lines[this.line_on].text;
				if (IN.keyCheckPressed("KeyZ")) {
					// Change to next slide
					if (this.line_on === this.lines.length - 1) {
						this.destroy();
					} else {
						this.timer = 0;
						this.line_on++;
						this.dialogue_portrait.texture = this.laraya_portraits[this.lines[this.line_on].image];
						this.dialogue_char_name.text = this.lines[this.line_on].name;
					}
				}
			}
		}
	}

	draw(gui, camera) {
		$engine.requestRenderOnGUI(this.dialogue);
	}
}

class DialogueLine {
	constructor(text, image, name = "Laraya") {
		this.text = text;
		this.image = image;
		this.name = name;
	}
}

class LARAYA_PORTRAITS {}
LARAYA_PORTRAITS.HAPPY = 0;
LARAYA_PORTRAITS.ANGRY = 1;
LARAYA_PORTRAITS.SURPRISED = 2;
LARAYA_PORTRAITS.SCARED = 3;
LARAYA_PORTRAITS.HURT = 4;
