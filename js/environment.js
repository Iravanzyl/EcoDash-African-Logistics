// environment.js
// Handles the Solar Microgrid Zone (a rechargeable area) and the load-shedding
// schedule that periodically disables it — modelling the real-world South
// African load-shedding challenge described in the African Context Report.
//
// NOTE: the day/night cycle that visually reflects this schedule is intended
// to be built independently (Task 2.3 "AI-blind" original feature) — this
// class only tracks the underlying on/off state, not the visuals.

export class Environment {
    constructor(canvasWidth, canvasHeight) {
        // Solar Microgrid Zone — a circular area where the vehicle can recharge
        this.solarZone = {
            x: canvasWidth * 0.5,
            y: canvasHeight * 0.5,
            radius: 70
        }

        // Load-shedding schedule: alternates between "power available" and
        // "load-shedding active" on a timer, in frames (roughly 60 frames = 1 second)
        this.loadSheddingActive = false
        this.cycleTimer = 0
        this.powerAvailableDuration = 60 * 20   // 20 seconds of available power
        this.loadSheddingDuration = 60 * 8      // 8 seconds of load-shedding
    }

    update() {
        this.cycleTimer++

        const currentDuration = this.loadSheddingActive
            ? this.loadSheddingDuration
            : this.powerAvailableDuration

        if (this.cycleTimer >= currentDuration) {
            this.loadSheddingActive = !this.loadSheddingActive
            this.cycleTimer = 0
        }
    }

    // returns true if the given point (the vehicle's position) is inside the solar zone
    isPointInsideSolarZone(pointX, pointY) {
        const distance = Math.hypot(pointX - this.solarZone.x, pointY - this.solarZone.y)
        return distance < this.solarZone.radius
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.solarZone.x, this.solarZone.y, this.solarZone.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.loadSheddingActive
            ? "rgba(150,150,150,0.15)"   // dimmed when load-shedding disables it
            : "rgba(255,209,102,0.20)"   // warm glow when active/available
        ctx.fill()
        ctx.strokeStyle = this.loadSheddingActive ? "#888888" : "#ffd166"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.font = "12px Arial"
        ctx.fillStyle = this.loadSheddingActive ? "#aaaaaa" : "#ffd166"
        ctx.textAlign = "center"
        ctx.fillText(
            this.loadSheddingActive ? "Load-shedding active" : "Solar Microgrid Zone",
            this.solarZone.x,
            this.solarZone.y - this.solarZone.radius - 10
        )
    }
}
