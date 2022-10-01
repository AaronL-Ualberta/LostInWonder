class Fireball extends EngineInstance {
    oncreate(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.velocity = 10;

        this.animation = $engine.getAnimation("fireball")
        this.setHitbox(new Hitbox(this, new RectagleHitbox(-160, -160, 160, 160)))
    }

    step() {
        this.x += Math.cos(this.angle) * this.velocity
        this.y += Math.sin(this.angle) * this.velocity

    }
}