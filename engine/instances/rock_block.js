class RockBlock extends SemiSolid {
	onCreate(x, y, angle) {
		// $engine.audioPlaySound("FireBallSoundEffect", 0.8, false, 0.5, 1.0);
		this.spd = 10;
		this.x = x;
		this.y = y;
		this.xScale = 1;
		this.yScale = 1;
		this.grav = 0.5;

		this.hsp = Math.cos(angle) * this.spd;
		this.vsp = (Math.sin(angle) * this.spd - 5) * 1.1;

		this.animation = [$engine.getTexture("rock_block")];
		this.sprite = $engine.createRenderable(this, new PIXI.extras.AnimatedSprite(this.animation), true);
		this.setHitbox(new Hitbox(this, new RectangleHitbox(-24, -24, 24, 24)));
	}

	step() {
		this.sprite.update(1);

		this.vsp += this.grav;
		this.collision();

		if (this.collisionCheck(this.x, this.y + 1)) {
			this.hsp = 0;
		}
	}

	collisionCheckY() {
		var hit = false;
		var t = 0;
		if (this.vsp != 0 && this.collisionCheck(this.x, this.y + this.vsp)) {
			while (!this.collisionCheck(this.x, this.y + Math.sign(this.vsp)) && t < Math.abs(this.vsp)) {
				this.y += Math.sign(this.vsp);
				t++;
			}
			this.vsp = 0;
			hit = true;
		}
		return hit;
	}

	collisionCheckX() {
		var hit = false;
		var t = 0;
		if (this.hsp != 0 && this.collisionCheck(this.x + this.hsp, this.y)) {
			while (!this.collisionCheck(this.x + Math.sign(this.hsp), this.y) && t < Math.abs(this.hsp)) {
				this.x += Math.sign(this.hsp);
				t++;
			}
			this.hsp = 0;
			hit = true;
		}
		return hit;
	}

	collision() {
		if (Math.abs(this.hsp) > Math.abs(this.vsp)) {
			while (this.collisionCheckX());
			this.x += this.hsp;

			while (this.collisionCheckY());
			this.y += this.vsp;
		} else {
			while (this.collisionCheckY());
			this.y += this.vsp;

			while (this.collisionCheckX());
			this.x += this.hsp;
		}
	}

	collisionCheck(x, y) {
		var collided = IM.instanceCollision(this, x, y, SolidObject);
		if (collided) {
			return true;
		}

		if (this.vsp > 0) {
			// Only collide if the semisolid is below you
			var collided_list = IM.instanceCollisionList(this, x, y, SemiSolid);
			for (const obj of collided_list) {
				if (obj.getHitbox().getBoundingBoxTop() > this.getHitbox().getBoundingBoxBottom()) {
					return true;
				}
			}
		}
	}
}
