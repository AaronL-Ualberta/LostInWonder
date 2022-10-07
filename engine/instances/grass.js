class GrassCreate extends EngineInstance {
    onEngineCreate() {
        this.setHitbox(new Hitbox(this, new RectangleHitbox(-24, 0, 24, 0)))
        const left = this.getHitbox().getBoundingBoxLeft()
        const right = this.getHitbox().getBoundingBoxRight()

        var start_x = left
        while (start_x<=right) {
            for (let i=0; i<10;i++) {
                var temp = new Grass(start_x, this.y+24)
                start_x += EngineUtils.irandomRange(2, 5)
                if (start_x > right) {
                    temp.destroy()
                }
            }
        }
    }
}

class Grass extends EngineInstance {
    onCreate(x, y) {
        this.x = x
        this.y = y
        this.yScale = EngineUtils.randomRange(0.45, 1.05)
        this.off = EngineUtils.irandom(10000)
        this.timer = 0;
        this.grass_type = $engine.getTexturesFromSpritesheet("GrassBlade",0,$engine.getSpritesheetLength("GrassBlade"))
        this.setSprite(new PIXI.Sprite(this.grass_type[EngineUtils.irandomRange(0,2)]), true)

        const red = Math.round(EngineUtils.irandomRange(20, 40))
        const green = Math.round(255 * EngineUtils.randomRange(0.3, 0.8))
        const blue = Math.round(EngineUtils.irandomRange(20, 40))

        this.getSprite().tint = (red << 16) | (green << 8) | blue
        this.depth = EngineUtils.randomRange(-10, 10)

        this.player = IM.findExact(PlayerInstance)
    }
    step() {
        const grass_direction = 0
        const grass_frequency = 40
        const grass_movement_span = 3
        this.timer++
        this.angle = grass_direction + Math.sin(this.timer / grass_frequency + this.off) / grass_movement_span

        const bend_distance = 50
        const distance_player_grass = V2D.distanceSq(this.x, this.y, this.player.x, this.player.y)
        /*if (distance_player_grass < bend_distance**2) {
            const interpolation = EngineUtils.interpolate(Math.sqrt(distance_player_grass), -this.player.x, -this.x, EngineUtils.INTERPOLATE_IN_QUAD)
            this.angle += interpolation*Math.sign(this.x-this.player.x)*0.1
        }*/
        
    }
    
}