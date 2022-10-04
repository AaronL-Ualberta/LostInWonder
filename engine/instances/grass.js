class GrassCreate extends EngineInstance {
    onEngineCreate() {
        this.setHitbox(new Hitbox(this, new RectangleHitbox(0, 12, 48, 48)))
        const left = this.getHitbox().getBoundingBoxLeft()
        const right = this.getHitbox().getBoundingBoxRight()

        var start_x = left
        while (start_x<=right) {
            for (let i=0; i<10;i++) {
                new Grass(start_x, this.y+48)
                start_x += EngineUtils.irandomRange(5, 8)
            }
        }
    }
}

class Grass extends EngineInstance {
    onCreate(x, y) {
        this.x = x
        this.y = y
        this.yScale = EngineUtils.randomRange(0.45, 0.75)
        this.off = EngineUtils.irandom(10000)
        this.timer = 0;
        this.setSprite(new PIXI.Sprite($engine.getTexture("GrassBlade")), true)
        this.depth = 1
    }
    step() {
        this.timer++
        this.angle = Math.sin(this.timer / 50 + this.off) / 5
    }
}