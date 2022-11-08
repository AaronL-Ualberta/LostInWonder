class Level3IntroCutscene extends Cutscene {
	onCutsceneCreate() {
		// ----------   SWAMP/LEVEL 3 DIALOGUE LINES   ----------

		this.dialogue_lines = [
			new DialogueLine("This place doesn't look very friendly…", LARAYA_PORTRAITS.HAPPY), //happens in swamp shot 1
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to swamp shot 2
			new DialogueLine("Ah! What was that! Who goes there! Show yourself!", LARAYA_PORTRAITS.SCARED), //need audio to occur just before this in swamp shot 2
			new DialogueLine("Well, just please don't eat my hand!", LARAYA_PORTRAITS.SCARED),
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to swamp shot 3
			new DialogueLine(
				"Oh! An axodile! Out of the water? And injured? What happened to you?",
				LARAYA_PORTRAITS.SURPRISED
			), //cutscene ends
			new DialogueLine(
				"I've read about your kind, buddy, and I think I know how to help! You can regenerate naturally, but you need to be in water for that.",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine(
				"So all I have to do is get you into that pool over there, and you'll be right as rain… theoretically.",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine(
				"The books I've read say it's just a myth, but I hope for your sake it's not.",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine("Raaaar!", AXODILE_PORTRAITS.HAPPY, "Axodile"),
			new DialogueLine(
				"What's all this? Scale fragments… Drag marks… Cleanly cut rope bindings… And an Asu tool someone left behind!",
				LARAYA_PORTRAITS.SURPRISED
			),
			new DialogueLine(
				"Argh! Someone did this on purpose, and tried to make it look like an accident if anyone came by! But who… Ximara!",
				LARAYA_PORTRAITS.ANGRY
			),
			new DialogueLine("Grrrr… I saw these scales in her despicable workshop.", LARAYA_PORTRAITS.ANGRY),
		];

		this.audioSound = "BackgroundMusic_CutScene";
		this.cutsceneFrames = ["level3cutsceneframe1", "level3cutsceneframe2", "level3cutsceneframe3"];
		this.nextRoom = "Level3";
	}

	dialogueEnd() {}

	step() {
		super.step();
	}

	draw() {
		super.draw();
	}
}
