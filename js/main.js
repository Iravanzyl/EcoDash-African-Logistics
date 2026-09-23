// main.js
// Entry point: sets up the canvas, wires up keyboard input, and runs the
// animation loop. Task 2.4 (scoring/localStorage/screens) will be added in a
// later commit.

import { Vehicle } from "./vehicle.js"
import { Environment } from "./environment.js"
import { Weather } from "./weather.js"
import { drawHUD } from "./hud.js"
import { drawDayNightBackground } from "./dayNightCycle.js"
import { soundEngine } from "./sound.js"
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

const BASE_WIDTH = 800
const BASE_HEIGHT = 500
canvas.width = BASE_WIDTH
canvas.height = BASE_HEIGHT

// ---------------- Responsive sizing ----------------
// Scales the canvas element visually to fit smaller screens/windows while
// keeping the drawing resolution (and therefore all game-logic coordinates)
// fixed at BASE_WIDTH x BASE_HEIGHT. This avoids having to rewrite every
// obstacle's x/y position for different screen sizes.
function resizeCanvasToFit() {
    const maxWidth = Math.min(window.innerWidth * 0.92, BASE_WIDTH)
    const scale = maxWidth / BASE_WIDTH
    canvas.style.width = `${BASE_WIDTH * scale}px`
    canvas.style.height = `${BASE_HEIGHT * scale}px`
}
window.addEventListener("resize", resizeCanvasToFit)
resizeCanvasToFit()

const playerVehicle = new Vehicle(canvas.width * 0.2, canvas.height * 0.5)
const environment = new Environment(canvas.width, canvas.height)
const weather = new Weather(canvas.width, canvas.height)

let distanceTravelled = 0
let lowBatteryWarningPlayed = false

// ---------------- Obstacle setup ----------------
const obstacles = [
    new Pothole(300, 150),
    new Pothole(550, 380),
    new Wildlife(450, 120, 80),
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
            const wasAlreadyColliding = obstacle.isColliding
            obstacle.applyEffect(playerVehicle)
            // only play the sound on the FIRST frame of a collision, not
            // every frame while still overlapping — avoids a buzzing noise
            if (!wasAlreadyColliding) {
                soundEngine.playCollision()
            }
        }
    })
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

    const wasRecharging = playerVehicle.isRecharging
    weather.applyWindTo(playerVehicle)
    playerVehicle.update(canvas.width, canvas.height, insideSolarZone, environment.loadSheddingActive)

    if (playerVehicle.isRecharging && !wasRecharging) {
        soundEngine.playRecharge()
    }

    if (playerVehicle.batteryLevel < 20 && !lowBatteryWarningPlayed) {
        soundEngine.playLowBatteryWarning()
        lowBatteryWarningPlayed = true
    }
    if (playerVehicle.batteryLevel > 30) {
        lowBatteryWarningPlayed = false   // reset so the warning can fire again later
    }

    distanceTravelled += playerVehicle.getSpeed()

    obstacles.forEach(obstacle => obstacle.update())
    checkObstacleCollisions()

 
    
    // ---------------- Day/Night Cycle 2.3 ----------------
// The background becomes darker when load shedding is active.
drawDayNightBackground(
    ctx,
    canvas.width,
    canvas.height,
    environment.loadSheddingActive
)

    environment.draw(ctx)
    obstacles.forEach(obstacle => obstacle.draw(ctx))
    playerVehicle.draw(ctx)
    weather.draw(ctx)
    drawHUD(ctx, canvas.width, playerVehicle, weather, distanceTravelled)
}

gameLoop()
