// weather.js
// Randomized environmental conditions using JavaScript's Math functions.
// Rain: reduces visibility (a semi-transparent overlay) and renders falling
// particle effects. Wind: applies a continuous directional force to the
// vehicle, independent of player input.

export class Weather {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight

        this.isRaining = false
        this.rainDrops = []
        this.rainCheckTimer = 0

        this.windX = 0
        this.windY = 0
        this.windChangeTimer = 0
    }

    update() {
        this.updateRain()
        this.updateWind()
    }

    updateRain() {
        this.rainCheckTimer++
        // roughly every 6 seconds, randomly decide whether it starts/stops raining
        if (this.rainCheckTimer > 360) {
            this.isRaining = Math.random() < 0.4   // 40% chance of rain each check
            this.rainCheckTimer = 0
        }

        if (this.isRaining) {
            // spawn a few new raindrops each frame at random x positions
            for (let i = 0; i < 3; i++) {
                this.rainDrops.push({
                    x: Math.random() * this.canvasWidth,
                    y: 0,
                    speed: 6 + Math.random() * 4,
                    length: 8 + Math.random() * 6
                })
            }
        }

        // move existing raindrops down, remove ones that fell off screen
        this.rainDrops.forEach(drop => { drop.y += drop.speed })
        this.rainDrops = this.rainDrops.filter(drop => drop.y < this.canvasHeight)
    }

    updateWind() {
        this.windChangeTimer++
        // roughly every 4 seconds, pick a new random wind direction/strength
        if (this.windChangeTimer > 240) {
            const windAngle = Math.random() * Math.PI * 2
            const windStrength = Math.random() * 0.04   // kept small — a nudge, not a shove
            this.windX = Math.cos(windAngle) * windStrength
            this.windY = Math.sin(windAngle) * windStrength
            this.windChangeTimer = 0
        }
    }

    // called from the vehicle update step — adds wind directly to velocity
    applyWindTo(vehicle) {
        vehicle.velocityX += this.windX
        vehicle.velocityY += this.windY
    }

    draw(ctx) {
        if (!this.isRaining) return

        ctx.strokeStyle = "rgba(180,200,255,0.5)"
        ctx.lineWidth = 1
        this.rainDrops.forEach(drop => {
            ctx.beginPath()
            ctx.moveTo(drop.x, drop.y)
            ctx.lineTo(drop.x, drop.y + drop.length)
            ctx.stroke()
        })

        // reduced visibility overlay — a translucent grey wash over the whole canvas
        ctx.fillStyle = "rgba(150,160,170,0.12)"
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    }
}
