class Enemy extends EngineInstance {
	onEngineCreate() {
		this.speed = 3;
		this.damage = 100;
		this.no_damage_period = 0;
		this.damage_done = false;
		this.direction = -1;
		this.sprite = $engine.createRenderable(this, new PIXI.Sprite($engine.getTexture("evil_laraya")), true);
		this.yScale = 2;
		this.setHitbox(new Hitbox(this, new RectangleHitbox(-15, -36, 15, 0)));
	}

	step() {
		if (this.damage_done && this.no_damage_period > 0) {
			this.no_damage_period -= 1;
			if (!this.no_damage_period) {
				this.damage_done = false;
			}
		}
		this.x += this.speed * this.direction;
		this.xScale = this.direction * 2;

		if (IM.instanceCollision(this, this.x, this.y, SolidObject)) {
			this.direction *= -1;
		}
		if (!IM.instanceCollision(this, this.x + 20 * this.direction, this.y + 5, SolidObject)) {
			this.direction *= -1;
		}

		if (IM.instanceCollision(this, this.x, this.y, Fireball)) {
			IM.instancePlace(this, this.x, this.y, Fireball).destroy();
			this.destroy();
		}

		if (IM.instanceCollision(this, this.x, this.y, PlayerInstance) && !this.damage_done) {
			var player = IM.instancePlace(this, this.x, this.y, PlayerInstance);
			player.player_health -= this.damage;
			if (player.player_health === 0) {
				$engine.setRoom(RoomManager.currentRoom().name);
			}
			this.damage_done = true;
			this.no_damage_period = 90;
		}
	}
}
