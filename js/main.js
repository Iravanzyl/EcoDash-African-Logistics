// main.js
// Entry point: sets up the canvas, wires up keyboard input, and runs the
// animation loop. Task 2.4 (scoring/localStorage/screens) will be added in a
// later commit.

import { Vehicle } from "./vehicle.js"
import { Environment } from "./environment.js"
import { Weather } from "./weather.js"
import {
    Pothole,
    Wildlife,
    FallenTree,
    ConstructionZone,
    circlesCollide,
    circleRectCollide
} from "./obstacle.js"

const canvas = document.querySelector("#gameCanvas")
const ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 500

const playerVehicle = new Vehicle(canvas.width * 0.2, canvas.height * 0.5)
const environment = new Environment(canvas.width, canvas.height)
const weather = new Weather(canvas.width, canvas.height)

// ---------------- Obstacle setup ----------------
// A mix of circular and rectangular obstacles, positioned around the solar
// zone (centre of the canvas) so the player has to navigate around them
// while managing battery.
const obstacles = [
    new Pothole(300, 150),
    new Pothole(550, 380),
    new Wildlife(450, 120, 80),     // patrols 80px left/right of its start point
    new FallenTree(600, 200, 70, 25),
    new ConstructionZone(200, 300, 90, 70),
]

// ---------------- Keyboard input ----------------
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

// ---------------- Collision checking ----------------
// Loops through every obstacle each frame and applies the correct collision
// test depending on whether it's circular or rectangular, then triggers
// that obstacle's own effect on the vehicle.
function checkObstacleCollisions() {
    const vehicleCircle = {
        x: playerVehicle.positionX,
        y: playerVehicle.positionY,
        radius: playerVehicle.radius
    }

    obstacles.forEach(obstacle => {
        let collided = false

        if (obstacle.type === "pothole" || obstacle.type === "wildlife") {
            collided = circlesCollide(vehicleCircle, obstacle)
        } else {
            collided = circleRectCollide(vehicleCircle, obstacle)
        }

        if (collided) {
            obstacle.applyEffect(playerVehicle)
        }
    })
}

// ---------------- HUD ----------------
function drawHUD() {
    ctx.font = "14px Arial"
    ctx.textAlign = "left"

    ctx.fillStyle = "#ffffff"
    ctx.fillText(`Battery: ${Math.round(playerVehicle.batteryLevel)}%`, 12, 24)

    const barWidth = 120
    const barHeight = 10
    ctx.strokeStyle = "#ffffff"
    ctx.strokeRect(12, 32, barWidth, barHeight)
    const fillWidth = (playerVehicle.batteryLevel / 100) * barWidth
    ctx.fillStyle = playerVehicle.batteryLevel > 25 ? "#9be07a" : "#e0577a"
    ctx.fillRect(12, 32, fillWidth, barHeight)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(`Speed: ${playerVehicle.getSpeed().toFixed(1)}`, 12, 62)

    if (weather.isRaining) {
        ctx.fillStyle = "#b4c8ff"
        ctx.fillText("Rain — visibility reduced", 12, 82)
    }

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
    weather.update()

    const insideSolarZone = environment.isPointInsideSolarZone(
        playerVehicle.positionX,
        playerVehicle.positionY
    )
    weather.applyWindTo(playerVehicle)
    playerVehicle.update(canvas.width, canvas.height, insideSolarZone, environment.loadSheddingActive)

    obstacles.forEach(obstacle => obstacle.update())
    checkObstacleCollisions()

    environment.draw(ctx)
    obstacles.forEach(obstacle => obstacle.draw(ctx))
    playerVehicle.draw(ctx)
    weather.draw(ctx)
    drawHUD()
}

gameLoop()
