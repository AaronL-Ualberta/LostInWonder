class Proceed extends EngineInstance {
	onEngineCreate() {
		this.endGame = false
		this.dialogue = $engine.createManagedRenderable(this, new PIXI.Container());
		this.dialogue_sprite = $engine.createManagedRenderable(this, new PIXI.Sprite($engine.getTexture("msgbox")));
		this.dialogue_text = $engine.createManagedRenderable(
			this,
			new PIXI.Text("Are you sure you want to proceed? Press 'z' to go ahead. Remember you can't go back!", {
				fontFamily: "Arial",
				fontSize: 16,
				fill: 0xffffff,
				align: "left",
				wordWrap: true,
				wordWrapWidth: 300,
			})
		);
		this.dialogue.addChild(this.dialogue_sprite);
		this.dialogue.addChild(this.dialogue_text);
		this.setHitbox(new Hitbox(this, new RectangleHitbox(-30, -30, 30, 30)));
	}

	step() {
		if (this.endGame) {
			if (IN.keyCheckPressed("KeyZ")) {
					this.destroy();
					$engine.setRoom(RoomManager.currentRoom().name);
				}
		}
	}

	checkComplete(x = false) {
		
	}

	draw(gui, camera) {
		if (this.endGame) {
			$engine.requestRenderOnGUI(this.dialogue);
		}
	} 
}