// vehicle.js
// Represents the player-controlled solar-powered delivery drone.
// Uses vector/trigonometric motion: thrust is applied in the direction the
// vehicle is facing (angle), producing acceleration, which changes velocity,
// which changes position. A drag coefficient gradually slows the vehicle
// each frame, simulating air/terrain resistance.

export class Vehicle {
    constructor(startX, startY) {
        this.positionX = startX
        this.positionY = startY

        this.velocityX = 0
        this.velocityY = 0

        this.facingAngle = 0          // radians — direction the vehicle is pointing
        this.turnSpeed = 0.06         // radians per frame while turning
        this.thrustPower = 0.18       // acceleration applied per frame while thrusting
        this.dragCoefficient = 0.985  // multiplier applied to velocity each frame (< 1 = slows down)
        this.maxSpeed = 5.5

        this.radius = 16              // used for collision detection (circle-based)

        // --- Solar Reserve / Battery system ---
        this.batteryLevel = 100                // percentage, 0–100
        this.batteryDrainPerFrameThrusting = 0.02
        this.batteryDrainPerFrameIdle = 0.004   // small passive drain even while idle
        this.batteryRechargePerFrame = 0.35     // recharge rate while inside a Solar Microgrid Zone
        this.isRecharging = false
        this.isDisabled = false                 // true when battery hits 0 — vehicle can't move

        // input state, updated by main.js keyboard listeners
        this.input = {
            thrusting: false,
            turningLeft: false,
            turningRight: false
        }
    }

    // Called once per frame from the main game loop.
    // loadSheddingActive: boolean flag from environment.js — disables recharging
    // even inside a Solar Microgrid Zone when true, reflecting a real power outage.
    update(canvasWidth, canvasHeight, insideSolarZone, loadSheddingActive) {
        this.handleBattery(insideSolarZone, loadSheddingActive)

        if (this.isDisabled) {
            // no thrust or turning possible with a dead battery — vehicle just drifts to a stop
            this.velocityX *= this.dragCoefficient
            this.velocityY *= this.dragCoefficient
        } else {
            this.handleTurning()
            this.handleThrust()
        }

        this.applyDragAndMove(canvasWidth, canvasHeight)
    }

    handleTurning() {
        if (this.input.turningLeft) this.facingAngle -= this.turnSpeed
        if (this.input.turningRight) this.facingAngle += this.turnSpeed
    }

    handleThrust() {
        if (this.input.thrusting) {
            // Core trig formula: convert an angle into x/y acceleration components.
            const accelerationX = Math.cos(this.facingAngle) * this.thrustPower
            const accelerationY = Math.sin(this.facingAngle) * this.thrustPower

            this.velocityX += accelerationX
            this.velocityY += accelerationY

            // clamp to a maximum speed so thrust doesn't accelerate forever
            const currentSpeed = Math.hypot(this.velocityX, this.velocityY)
            if (currentSpeed > this.maxSpeed) {
                const scale = this.maxSpeed / currentSpeed
                this.velocityX *= scale
                this.velocityY *= scale
            }
        }
    }

    applyDragAndMove(canvasWidth, canvasHeight) {
        // drag: velocity is multiplied by a value just under 1 every frame
        this.velocityX *= this.dragCoefficient
        this.velocityY *= this.dragCoefficient

        this.positionX += this.velocityX
        this.positionY += this.velocityY

        // boundaries: keep the vehicle inside the canvas, bounce gently off edges
        if (this.positionX - this.radius < 0) {
            this.positionX = this.radius
            this.velocityX *= -0.4
        }
        if (this.positionX + this.radius > canvasWidth) {
            this.positionX = canvasWidth - this.radius
            this.velocityX *= -0.4
        }
        if (this.positionY - this.radius < 0) {
            this.positionY = this.radius
            this.velocityY *= -0.4
        }
        if (this.positionY + this.radius > canvasHeight) {
            this.positionY = canvasHeight - this.radius
            this.velocityY *= -0.4
        }
    }

    handleBattery(insideSolarZone, loadSheddingActive) {
        const canRecharge = insideSolarZone && !loadSheddingActive

        if (canRecharge) {
            this.isRecharging = true
            this.batteryLevel += this.batteryRechargePerFrame
        } else {
            this.isRecharging = false
            const drain = this.input.thrusting
                ? this.batteryDrainPerFrameThrusting
                : this.batteryDrainPerFrameIdle
            this.batteryLevel -= drain
        }

        this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel))
        this.isDisabled = this.batteryLevel <= 0
    }

    // distance travelled this frame — useful for the score/distance system in Task 2.4
    getSpeed() {
        return Math.hypot(this.velocityX, this.velocityY)
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.positionX, this.positionY)
        ctx.rotate(this.facingAngle)

        // simple triangular drone/vehicle shape pointing in facingAngle direction
        ctx.beginPath()
        ctx.moveTo(this.radius, 0)
        ctx.lineTo(-this.radius, -this.radius * 0.7)
        ctx.lineTo(-this.radius * 0.5, 0)
        ctx.lineTo(-this.radius, this.radius * 0.7)
        ctx.closePath()

        ctx.fillStyle = this.isDisabled ? "#666666" : (this.isRecharging ? "#ffd166" : "#7ab8e0")
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.restore()
    }
}
