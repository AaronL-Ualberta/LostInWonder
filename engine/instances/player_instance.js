class PlayerInstance extends EngineInstance {
	onEngineCreate() {
		// Gameplay vars
		this.ground_accel = 0.5;
		this.jump_height = 13;
		this.gravity = 0.8;
		this.max_run_speed = 5;
		this.decel_coeff = 0.8;
		this.decel_const = 0.1;

		this.snap_distance = 8;
		this.snap_move_factor = 0.5;
		this.allowSnapDown = false;
		this.allowSnapLeft = false;
		this.allowSnapRight = false;
		this.allowSnapUp = false;
		this.snap_enabled = false;

		// Player vars
		this.spr_width = 50;
		this.spr_height = 80;
		this.state_timer = 0;
		this.state = PLAYERSTATES.GROUNDED;
		this.state_funcs = {
			[PLAYERSTATES.GROUNDED]: {
				enter: this.enterGrounded.bind(this),
				step: this.stepGrounded.bind(this),
				exit: this.exitGrounded.bind(this),
			},
			[PLAYERSTATES.AIRBORNE]: {
				enter: this.enterAirborne.bind(this),
				step: this.stepAirborne.bind(this),
				exit: this.exitAirborne.bind(this),
			},
			[PLAYERSTATES.INACTIVE]: {
				enter: this.enterInactive.bind(this),
				step: this.stepInactive.bind(this),
				exit: this.exitInactive.bind(this),
			},
			[PLAYERSTATES.WALLCLING]: {
				enter: this.enterWallCling.bind(this),
				step: this.stepWallCling.bind(this),
				exit: this.exitWallCling.bind(this),
			},
		};
		this.vsp = 0;
		this.hsp = 0;
		this.facing = 1;
		this.has_doubleJump = true;
		this.current_spell = SPELLNAMES.FIRE;

		this.levelHandler = TechDemoHandler.first;

		this.animation_running = $engine.getAnimation("playerrunanimation");
		this.animation_standing = [$engine.getTexture("baby2")];

		// this.setSprite(new PIXI.Sprite($engine.getTexture("default")));
		this.setHitbox(new Hitbox(this, new RectangleHitbox(-20, 34 * -2, 20, 0)));
		this.animation = $engine.createRenderable(this, new PIXI.extras.AnimatedSprite(this.animation_standing), false);
		// this.spr_scale = 1.2;
		this.spr_scale = 2;
		this.animation.scale.set(this.spr_scale, this.spr_scale);
		// this.getSprite().anchor.y = 1;
		this.animation.anchor.y = 1;
		this.animation.animationSpeed = 0.1;

		// Marcus cool code!!!!!!!!!!!!!!!!!!!!!!!!!
		// this.filter = new PIXI.filters.BlurFilter();
		// this.spr.filters = [this.filter];
	}

	onCreate(x, y) {
		this.onEngineCreate();
		this.x = x;
		this.y = y;
		// do stuff
	}

	step() {
		//this.getSprite().skew.x = this.hsp / 15;
		this.animation.update(1);
		this.state_timer++;
		this.getStateGroup().step();

		// You can always switch between spells (for now)
		const spell_inp = IN.keyCheckPressed("KeyE") - IN.keyCheckPressed("KeyQ");
		if (spell_inp != 0) {
			this.current_spell += spell_inp;
			// if (this.current_spell < 0) {
			// 	this.current_spell = 4 + this.current_spell;
			// }
			this.current_spell &= 3;
			this.levelHandler.spellWheelRotate(this.current_spell);
		}

		//  this.filter.blur = this.x / 120;
		if (Math.abs(this.hsp) > 0.1) {
			EngineUtils.setAnimation(this.animation, this.animation_running);
			this.animation.animationSpeed = Math.abs(this.hsp) / 30;
		} else {
			EngineUtils.setAnimation(this.animation, this.animation_standing);
		}
	}

	draw(gui, camera) {
		// EngineDebugUtils.drawHitbox(camera, this);
		this.animation.scale.x = this.spr_scale - Math.abs(this.vsp) / 50;
		this.animation.scale.y = this.spr_scale + Math.abs(this.vsp) / 50;
		if (Math.abs(this.hsp) > 0.1) {
			this.animation.scale.x = Math.abs(this.animation.scale.x) * Math.sign(this.hsp);
		}
		this.animation.x = this.x;
		this.animation.y = this.y;
	}

	// My Functions -------------------------------------------------------

	getStateGroup() {
		return this.state_funcs[this.state];
	}

	switchState(_state) {
		this.getStateGroup().exit(this.state);
		this.state = _state;
		this.state_timer = 0;
		this.getStateGroup().enter(this.state);
	}

	// Step functions
	stepGrounded() {
		// Become airborne if no ground under you
		if (!this.collisionCheck(this.x, this.y + 1)) {
			this.switchState(PLAYERSTATES.AIRBORNE);
			this.moveCollide();
			return;
		}

		const inp = IN.keyCheck("ArrowRight") - IN.keyCheck("ArrowLeft");

		const part_from_center = 18;
		const part_from_ground = 5;
		if (inp !== 0) {
			this.hsp = EngineUtils.clamp(this.hsp + inp * this.ground_accel, -this.max_run_speed, this.max_run_speed);
			// Running clouds
			if (Math.abs(this.hsp) > this.max_run_speed / 5 && this.state_timer % 15 === 0) {
				new DustParticle(this.x - part_from_center * Math.sign(this.hsp), this.y - part_from_ground, 0.8);
			}
		} else {
			// Decel
			this.hsp *= this.decel_coeff;
			this.hsp -= Math.sign(this.hsp) * this.decel_const;
		}
		if (IN.keyCheckPressed("ArrowUp")) {
			// Jump
			this.vsp -= this.jump_height;
			new DustParticle(this.x - part_from_center, this.y - part_from_ground);
			new DustParticle(this.x + part_from_center, this.y - part_from_ground);
		}
		this.moveCollide();
	}
	stepAirborne() {
		// Become grounded if there is ground under you
		if (this.collisionCheck(this.x, this.y + 1)) {
			this.switchState(PLAYERSTATES.GROUNDED);
			this.moveCollide();
			return;
		}

		this.vsp += this.gravity;
		if (Math.abs(this.vsp) < 1) this.vsp -= this.gravity / 1.5;

		// INP
		const inp = IN.keyCheck("ArrowRight") - IN.keyCheck("ArrowLeft");
		if (inp !== 0) {
			this.hsp = EngineUtils.clamp(this.hsp + inp * this.ground_accel, -this.max_run_speed, this.max_run_speed);

			// Check wall cling
			if (this.vsp > 0 && this.collisionCheck(this.x + inp, this.y)) {
				this.switchState(PLAYERSTATES.WALLCLING);
				this.facing = inp;
				return;
			}
		}
		this.moveCollide();

		// Check Double Jump
		if (IN.keyCheckPressed("ArrowUp") && this.has_doubleJump) {
			this.vsp = -this.jump_height;
			const part_from_center = 18;
			const part_from_ground = 5;
			new DustParticle(this.x - part_from_center, this.y - part_from_ground);
			new DustParticle(this.x + part_from_center, this.y - part_from_ground);
			this.has_doubleJump = false;
		}
	}
	stepInactive() {}
	stepWallCling() {
		if (IN.keyCheckPressed("ArrowUp")) {
			this.vsp = -this.jump_height / 1.1;
			this.hsp = 6 * -this.facing;
			this.switchState(PLAYERSTATES.AIRBORNE);
			return;
		}
		var inp = 0;
		if (IN.keyCheck("ArrowRight")) {
			inp = 1;
		}
		if (IN.keyCheck("ArrowLeft")) {
			inp = -1;
		}
		if (this.facing === -inp) {
			this.switchState(PLAYERSTATES.AIRBORNE);
			return;
		}

		if ($engine.getGameTimer() % 7 === 0) {
			new DustParticle(this.x + this.facing * 10, this.y - 50);
		}

		if (this.collisionCheck(this.x, this.y + 1)) {
			this.switchState(PLAYERSTATES.GROUNDED);
			return;
		}

		if (!this.collisionCheck(this.x + this.facing, this.y)) {
			this.switchState(PLAYERSTATES.AIRBORNE);
			return;
		}

		this.vsp = Math.min(this.vsp + 0.1, 3);
		this.moveCollide();
	}

	// Transition functions
	enterGrounded() {
		this.has_doubleJump = true;
	}
	enterAirborne() {}
	enterInactive() {}
	enterWallCling() {
		this.hsp = 0;
		this.vsp = 0;
		this.has_doubleJump = true;
		// console.log("helo");
	}

	exitGrounded() {}
	exitAirborne() {
		this.vsp = 0;
	}
	exitInactive() {}
	exitWallCling() {}

	moveCollide() {
		// Move X
		// Move Y
		//this.__collision();
		this.collision();
	}

	// SNAPPING (commented for now) ----------------------------------------------------------------------
	// __collision() {
	// 	if (Math.abs(this.hsp) > Math.abs(this.vsp)) {
	// 		while (this.__collisionCheckX());
	// 		this.x += this.hsp;

	// 		while (this.__collisionCheckY());
	// 		this.y += this.vsp;
	// 	} else {
	// 		while (this.__collisionCheckY());
	// 		this.y += this.vsp;

	// 		while (this.__collisionCheckX());
	// 		this.x += this.hsp;
	// 	}
	// }

	// __snapX() {
	// 	if (this.snap_enabled) {
	// 		var vel2 = V2D.calcMag(this.hsp, this.vsp);
	// 		var fac = this.snap_move_factor;
	// 		var dist = this.snap_distance;
	// 		var lowerBound = Math.min(-dist + vel2 * fac * Math.sign(this.hsp), 0);
	// 		var upperBound = Math.max(dist + vel2 * fac * Math.sign(this.hsp), 0);
	// 		if (this.hsp > 0 || !this.allowSnapLeft)
	// 			// cannot snap in a direction you are not moving...
	// 			lowerBound = 0;
	// 		if (this.hsp < 0 || !this.allowSnapRight) upperBound = 0;
	// 		for (var i = 0; i < upperBound; i++) {
	// 			if (!this.collisionCheck(this.x + i, this.y + this.vsp)) {
	// 				this.x += i;
	// 				return true;
	// 			}
	// 		}
	// 		for (var i = 0; i > lowerBound; i--) {
	// 			if (!this.collisionCheck(this.x + i, this.y + this.vsp)) {
	// 				this.x += i;
	// 				return true;
	// 			}
	// 		}
	// 	}
	// 	return false;
	// }

	// __collisionCheckX() {
	// 	var hit = false;
	// 	var t = 0;
	// 	if (this.hsp != 0 && this.collisionCheck(this.x + this.hsp, this.y) && !this.__snapY()) {
	// 		while (!this.collisionCheck(this.x + Math.sign(this.hsp), this.y) && t < Math.abs(this.hsp)) {
	// 			this.x += Math.sign(this.hsp);
	// 			t++;
	// 		}
	// 		this.hsp = 0;
	// 		hit = true;
	// 	}
	// 	return hit;
	// }

	// __snapY() {
	// 	if (this.snap_enabled) {
	// 		var vel2 = V2D.calcMag(this.hsp, this.vsp);
	// 		var fac = this.snap_move_factor;
	// 		var dist = this.snap_distance;
	// 		var lowerBound = Math.min(-dist + vel2 * fac * Math.sign(this.vsp), 0);
	// 		var upperBound = Math.max(dist + vel2 * fac * Math.sign(this.vsp), 0);
	// 		if (this.vsp > 0 || !this.allowSnapUp)
	// 			// cannot snap in a direction you are not moving...
	// 			lowerBound = 0;
	// 		if (this.vsp < 0 || !this.allowSnapDown) upperBound = 0;
	// 		for (var i = 0; i < upperBound; i++) {
	// 			if (!this.collisionCheck(this.x + this.hsp, this.y + i)) {
	// 				this.y += i;
	// 				return true;
	// 			}
	// 		}
	// 		for (var i = 0; i > lowerBound; i--) {
	// 			if (!this.collisionCheck(this.x + this.hsp, this.y + i)) {
	// 				this.y += i;
	// 				return true;
	// 			}
	// 		}
	// 	}
	// 	return false;
	// }

	// __collisionCheckY() {
	// 	var hit = false;
	// 	var t = 0;
	// 	if (this.vsp != 0 && this.collisionCheck(this.x, this.y + this.vsp) && !this.__snapX()) {
	// 		while (!this.collisionCheck(this.x, this.y + Math.sign(this.vsp)) && t < Math.abs(this.vsp)) {
	// 			this.y += Math.sign(this.vsp);
	// 			t++;
	// 		}
	// 		this.vsp = 0;
	// 		hit = true;
	// 	}
	// 	return hit;
	// }

	collisionCheck(x, y) {
		var collided = IM.instanceCollision(this, x, y, SolidObject);
		if (collided) return true;

		// Dont collide with platforms if you are holding down
		if (!IN.keyCheck("ArrowDown")) {
			if (this.vsp >= 0) {
				// Only collide if the semisolid is below you
				var collided_list = IM.instanceCollisionList(this, x, y, SemiSolid);
				for (const obj of collided_list) {
					if (obj.getHitbox().getBoundingBoxTop() > this.getHitbox().getBoundingBoxBottom()) {
						return true;
					}
				}
			}
		}
		return false;
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
}

class PLAYERSTATES {}
PLAYERSTATES.GROUNDED = 0;
PLAYERSTATES.AIRBORNE = 1;
PLAYERSTATES.INACTIVE = 2;
PLAYERSTATES.WALLCLING = 3;

class SPELLNAMES {}
SPELLNAMES.FIRE = 0;
SPELLNAMES.EARTH = 0;
SPELLNAMES.AIR = 0;
SPELLNAMES.WATER = 0;
