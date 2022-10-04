class Fireball extends EngineInstance {
    onCreate(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.velocity = 10;
        this.xScale = 0.1 
        this.yScale = 0.1
        this.animation = [$engine.getTexture("fireball")]
        this.sprite = $engine.createRenderable(this, new PIXI.extras.AnimatedSprite(this.animation), true)
        this.setHitbox(new Hitbox(this, new RectangleHitbox(-80, -80, 80, 80)))
    }

    step() {
        this.sprite.update(1)
        this.x += Math.cos(this.angle) * this.velocity
        this.y += Math.sin(this.angle) * this.velocity
        
        if(IM.instanceCollision(this, this.x, this.y, SolidObject)) {
            this.destroy()

            var iceBlock = IM.instancePlace(this, this.x, this.y, IceBlock);
            if (iceBlock !== undefined) {
                iceBlock.destroy();
            }
        }
    }
}