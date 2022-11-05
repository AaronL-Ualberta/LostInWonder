class Level1IntroCutscene extends Cutscene {
	onCutsceneCreate() {
		// ----------   INTRO CUTSCENE DIALOGUE LINES   ----------
		this.dialogue_lines = [
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //should be intro shot 1 here
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to intro shot 2
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to intro shot 3
			new DialogueLine("And what have we here? Guards!", XIMARA_PORTRAITS.NEUTRAL, "Ximara"), //happens in intro shot 3
			new DialogueLine(
				"This sorceress has been experimenting on rare species! Look at all of this! Scales and feathers and fur!",
				XIMARA_PORTRAITS.NEUTRAL,
				"Ximara"
			),
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to next shot (intro shot 4) here
			new DialogueLine(
				"Laraya, Asu sorceress of Calchara, for crimes against this Tribunal you are hereby banished from the city of Ishana.",
				MARALAN_PORTRAITS.NEUTRAL,
				"Maralan"
			),
			new DialogueLine(
				"From now until evermore, you shall be unwelcome in Ishana and all its surrounding lands.",
				MARALAN_PORTRAITS.NEUTRAL,
				"Maralan"
			),
			new DialogueLine("But I didn't even do anything wr-", LARAYA_PORTRAITS.SCARED),
			new DialogueLine("Silence. Maralan, remember the rest.", XIMARA_PORTRAITS.NEUTRAL, "Ximara"),
			new DialogueLine(
				"Of course. Furthermore, in accordance with our most sacred laws, your wand must be snapped.",
				MARALAN_PORTRAITS.NEUTRAL,
				"Maralan"
			),
			new DialogueLine("Your banishment begins today. Give me your wand.", MARALAN_PORTRAITS.NEUTRAL, "Maralan"),
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to next shot (intro shot 5) here
			new DialogueLine("But I need my stuff! Everything I own is here!", LARAYA_PORTRAITS.SURPRISED),
			new DialogueLine("Your wand, Laraya.", MARALAN_PORTRAITS.NEUTRAL, "Maralan"),
			new DialogueLine("You're making a mistake. I didn't - oof!", LARAYA_PORTRAITS.SURPRISED),
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to next shot (intro shot 6) here
		];

		this.audioSound = "JungleAmbience";
		this.cutsceneFrames = [
			"gameintrocutsceneframe1",
			"gameintrocutsceneframe2",
			"gameintrocutsceneframe3",
			"gameintrocutsceneframe4",
			"gameintrocutsceneframe5",
			"gameintrocutsceneframe6",
		];
		this.nextRoom = "Level1";
	}

	dialogueEnd() {}

	step() {
		super.step();
	}

	draw() {
		super.draw();
	}
}
