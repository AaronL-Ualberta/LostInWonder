class LevelHandler extends EngineInstance {
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
