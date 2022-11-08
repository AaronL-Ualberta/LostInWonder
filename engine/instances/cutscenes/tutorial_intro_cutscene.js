class TutorialIntroCutscene extends Cutscene {
	onCutsceneCreate() {
		// ----------   JUNGLE/TUTORIAL/LEVEL 1 DIALOGUE LINES   ----------
		this.dialogue_lines = [
			new DialogueLine("Aaaaaaaaaaaaaahhh!", LARAYA_PORTRAITS.SCARED), //happens in jungle shot 1, then cutscene ends
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE),
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE),
		];

		this.audioSound = "JungleAmbience";
		this.cutsceneFrames = ["tutorialcutsceneframe1", "tutorialcutsceneframe2", "tutorialcutsceneframe3"];
		this.nextRoom = "Tutorial";
	}

	dialogueEnd() {}

	step() {
		super.step();
	}

	draw() {
		super.draw();
	}
}
