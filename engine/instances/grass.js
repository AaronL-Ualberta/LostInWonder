class GrassCreate extends EngineInstance {
	onEngineCreate() {
		this.setHitbox(new Hitbox(this, new RectangleHitbox(-24, 0, 24, 0)));
		const left = this.getHitbox().getBoundingBoxLeft();
		const right = this.getHitbox().getBoundingBoxRight();
		this.container = $engine.createRenderable(
			this,
			new PIXI.particles.ParticleContainer(1500, { rotation: true }),
			false
		);
		var start_x = left;
		this.grass_array = [];
		while (start_x <= right) {
			if (start_x <= right) {
				var temp = new Grass(start_x, this.y + 24);
				var grass_type = $engine.getTexturesFromSpritesheet(
					"GrassBlade",
					0,
					$engine.getSpritesheetLength("GrassBlade")
				);
				var sprite = $engine.createManagedRenderable(this, new PIXI.Sprite(grass_type[EngineUtils.irandomRange(0, 2)]));
				sprite.x = temp.x;
				sprite.y = temp.y;
				sprite.scale.y = temp.yScale;
				sprite.tint = temp.tint;
				temp.sprite = sprite;
				this.grass_array.push(temp);
				this.container.addChild(sprite);

				start_x += EngineUtils.irandomRange(3, 6);
			}
		}
	}

	step() {
		var hb = this.getHitbox().getBoundingBox();
		hb.x1 -= 32;
		hb.x2 += 32;
		if (!EngineUtils.boxesIntersect($engine.getCamera().getBoundingBox(), hb)) {
			this.container.visible = false;
		} else {
			this.container.visible = true;
			var wind = this.global.wind_direction;
			for (const x of this.grass_array) {
				x.step(wind);
			}
		}
	}

	onRoomStart() {
		this.global = Global.first;
	}
}

class Grass {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.yScale = EngineUtils.randomRange(0.35, 0.75);
		this.off = EngineUtils.irandom(10000);
		this.angle = 0;
		this.timer = 0;
		this.sprite = null;

		const red = Math.round(EngineUtils.irandomRange(20, 40));
		const green = Math.round(255 * EngineUtils.randomRange(0.3, 0.8));
		const blue = Math.round(EngineUtils.irandomRange(20, 40));

		this.tint = (red << 16) | (green << 8) | blue;

		this.player = IM.findExact(PlayerInstance);
		this.grass_direction = 0;
	}
	step(wind) {
		if (this.grass_direction !== wind) {
			if (this.grass_direction < wind) {
				this.grass_direction += 0.05;
			}
			if (this.grass_direction > wind) {
				this.grass_direction -= 0.05;
			}
		}

		if (!wind) {
			var grass_frequency = 15;
		} else {
			var grass_frequency = 7;
		}

		if (!wind) {
			var grass_movement_span = 10;
		} else {
			var grass_movement_span = 3;
		}

		this.timer++;
		this.angle = 0.5 * this.grass_direction + Math.sin(this.timer / grass_frequency + this.off) / grass_movement_span;

		const bend_distance = 40;
		const distance_player_grass = V2D.distanceSq(this.x, this.y, this.player.x, this.player.y);
		if (distance_player_grass < bend_distance ** 2) {
			const interpolation = EngineUtils.interpolate(
				Math.sqrt(distance_player_grass) / bend_distance,
				1,
				0,
				EngineUtils.INTERPOLATE_LINEAR
			);
			this.angle += interpolation ** 1.5 * Math.sign(this.x - this.player.x);
		}
		if (this.sprite !== null) {
			this.sprite.rotation = this.angle;
		}
	}
}
