class Level1IntroCutscene extends Cutscene {
	onCutsceneCreate() {
		// ----------   CAVE/LEVEL 1 DIALOGUE LINES   ----------

		this.dialogue_lines = [
			new DialogueLine("Would you look at that! There was a point coming down here after all!", LARAYA_PORTRAITS.HAPPY),
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to cave shot 2
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to cave shot 3
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to cave shot 4
			new DialogueLine("Oh no! Maybe this cave is going to be less helpful than I thought…", LARAYA_PORTRAITS.SCARED), //happens in cave shot 5, then cutscene ends
			new DialogueLine("Well, if I leave them alone, they'll leave me alone. Right?", LARAYA_PORTRAITS.SCARED),
			new DialogueLine(
				"I think I remember now. They're lazy and don't like to move much, but they'll definitely move if something comes and disturbs them.",
				LARAYA_PORTRAITS.SCARED
			),
			new DialogueLine("Which, in this case, would be me…", LARAYA_PORTRAITS.SCARED),
		];

		this.audioSound = "Level1CutScene";
		this.cutsceneFrames = [
			"level1cutsceneframe1",
			"level1cutsceneframe2",
			"level1cutsceneframe3",
			"level1cutsceneframe4",
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
