class Level2IntroCutscene extends Cutscene {
	onCutsceneCreate() {
		// ----------   CAVE/LEVEL 2 DIALOGUE LINES   ----------

		this.dialogue_lines = [
			new DialogueLine(
				"Where am I? Woah! The ground is really, really far away! That's probably not good!",
				LARAYA_PORTRAITS.SURPRISED
			), //happens in trees shot 1
			new DialogueLine(DIALOGUE_COMMANDS.NEXT_CUTSCENE_IMAGE), //cut to trees shot 2
			new DialogueLine(
				"Wow! A flickow! It's gorgeous! I've read that they like collecting things, maybe it's picked up a part of my wand?",
				LARAYA_PORTRAITS.HAPPY
			), //happens in trees shot 2, then cutscene ends
			new DialogueLine(
				"I can't believe I'm seeing a flickow for real! What do you say, buddy, can I have it?",
				LARAYA_PORTRAITS.HAPPY
			), //triggers when player is close to nest/flickow sprite?
			new DialogueLine(
				"I promise not to touch anything else, I know how defensive you can get about your nest!",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine("Chirp!", FLICKOW_PORTRAITS.NEUTRAL, "Flickow"),
			new DialogueLine(
				"How about I give you this stick instead? It's a lot better, wouldn't you say?",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine("Chirp! Chirp!", FLICKOW_PORTRAITS.NEUTRAL, "Flickow"),
			new DialogueLine(
				"You've got yourself a deal, little guy! I get my wand piece, and you get these two sticks!",
				LARAYA_PORTRAITS.HAPPY
			),
			new DialogueLine("Chirp! Chirp! Tweet!", FLICKOW_PORTRAITS.NEUTRAL, "Flickow"), //interact with water wand piece, lore (from LORE section) appears on screen
		];

		this.audioSound = "JungleAmbience";
		this.cutsceneFrames = ["level2cutsceneframe1", "level2cutsceneframe2"];
		this.nextRoom = "Level2";
	}

	dialogueEnd() {}

	step() {
		super.step();
	}

	draw() {
		super.draw();
	}
}
