// main.js
// Entry point: sets up the canvas, wires up keyboard input, and runs the
// animation loop. Task 2.2 (obstacles/collision) and Task 2.4 (scoring/
// localStorage/screens) will be added to this file in later commits.

import { Vehicle } from "./vehicle.js"
import { Environment } from "./environment.js"

const canvas = document.querySelector("#gameCanvas")
const ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 500

const playerVehicle = new Vehicle(canvas.width * 0.2, canvas.height * 0.5)
const environment = new Environment(canvas.width, canvas.height)

// ---------------- Keyboard input ----------------
// Arrow keys / WASD control turning and thrust.
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
        case "w":
            playerVehicle.input.thrusting = true
            break
        case "ArrowLeft":
        case "a":
            playerVehicle.input.turningLeft = true
            break
        case "ArrowRight":
        case "d":
            playerVehicle.input.turningRight = true
            break
    }
})

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":
        case "w":
            playerVehicle.input.thrusting = false
            break
        case "ArrowLeft":
        case "a":
            playerVehicle.input.turningLeft = false
            break
        case "ArrowRight":
        case "d":
            playerVehicle.input.turningRight = false
            break
    }
})

// ---------------- HUD ----------------
function drawHUD() {
    ctx.font = "14px Arial"
    ctx.textAlign = "left"

    ctx.fillStyle = "#ffffff"
    ctx.fillText(`Battery: ${Math.round(playerVehicle.batteryLevel)}%`, 12, 24)

    // battery bar
    const barWidth = 120
    const barHeight = 10
    ctx.strokeStyle = "#ffffff"
    ctx.strokeRect(12, 32, barWidth, barHeight)
    const fillWidth = (playerVehicle.batteryLevel / 100) * barWidth
    ctx.fillStyle = playerVehicle.batteryLevel > 25 ? "#9be07a" : "#e0577a"
    ctx.fillRect(12, 32, fillWidth, barHeight)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(`Speed: ${playerVehicle.getSpeed().toFixed(1)}`, 12, 62)

    if (playerVehicle.isDisabled) {
        ctx.fillStyle = "#e0577a"
        ctx.font = "bold 20px Arial"
        ctx.textAlign = "center"
        ctx.fillText("BATTERY DEPLETED — find a Solar Microgrid Zone", canvas.width / 2, 30)
    }
}

// ---------------- Main loop ----------------
function gameLoop() {
    requestAnimationFrame(gameLoop)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    environment.update()

    const insideSolarZone = environment.isPointInsideSolarZone(
        playerVehicle.positionX,
        playerVehicle.positionY
    )
    playerVehicle.update(canvas.width, canvas.height, insideSolarZone, environment.loadSheddingActive)

    environment.draw(ctx)
    playerVehicle.draw(ctx)
    drawHUD()
}

gameLoop()
