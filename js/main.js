// main.js
// Entry point: sets up the canvas, wires up keyboard input, and runs the
// animation loop.

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
import { GameManager, GameState, drawStartScreen, drawPauseScreen, drawGameOverScreen } from "./game.js"


const canvas = document.querySelector("#gameCanvas")
const ctx = canvas.getContext("2d")

const BASE_WIDTH = 800
const BASE_HEIGHT = 500
canvas.width = BASE_WIDTH
canvas.height = BASE_HEIGHT

// ---------------- Responsive sizing ----------------
function resizeCanvasToFit() {
    const maxWidth = Math.min(window.innerWidth * 0.92, BASE_WIDTH)
    const scale = maxWidth / BASE_WIDTH
    canvas.style.width = `${BASE_WIDTH * scale}px`
    canvas.style.height = `${BASE_HEIGHT * scale}px`
}
window.addEventListener("resize", resizeCanvasToFit)
resizeCanvasToFit()

// playerVehicle, environment, weather are now "let" instead of "const" —
// resetGame() below needs to be able to swap in fresh instances on restart.
let playerVehicle = new Vehicle(canvas.width * 0.2, canvas.height * 0.5)
let environment = new Environment(canvas.width, canvas.height)
let weather = new Weather(canvas.width, canvas.height)

let distanceTravelled = 0
let totalEnergyConsumed = 0   // cumulative battery % drained — used for the efficiency score
let lowBatteryWarningPlayed = false

const gameManager = new GameManager()

// ---------------- Obstacle setup ----------------
const obstacles = [
    new Pothole(300, 150),
    new Pothole(550, 380),
    new Wildlife(450, 120, 80),
    new FallenTree(600, 200, 70, 25),
    new ConstructionZone(200, 300, 90, 70),
]

function resetObstacles() {
    // clears the array in place and repopulates it, so obstacles (like the
    // patrolling wildlife) go back to their original starting positions
    obstacles.length = 0
    obstacles.push(
        new Pothole(300, 150),
        new Pothole(550, 380),
        new Wildlife(450, 120, 80),
        new FallenTree(600, 200, 70, 25),
        new ConstructionZone(200, 300, 90, 70)
    )
}

// ---------------- Restart without refreshing the page ----------------
function resetGame() {
    playerVehicle = new Vehicle(canvas.width * 0.2, canvas.height * 0.5)
    environment = new Environment(canvas.width, canvas.height)
    weather = new Weather(canvas.width, canvas.height)
    resetObstacles()

    distanceTravelled = 0
    totalEnergyConsumed = 0
    lowBatteryWarningPlayed = false

    gameManager.startGame()
}

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
        case "Enter":
            if (gameManager.state === GameState.START) gameManager.startGame()
            break
        case "p":
        case "P":
            if (gameManager.state === GameState.PLAYING || gameManager.state === GameState.PAUSED) {
                gameManager.togglePause()
            }
            break
        case "r":
        case "R":
            if (gameManager.state === GameState.GAMEOVER) resetGame()
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

    if (gameManager.state === GameState.PLAYING) {
        environment.update()
        weather.update()

        const insideSolarZone = environment.isPointInsideSolarZone(
            playerVehicle.positionX,
            playerVehicle.positionY
        )

        const wasRecharging = playerVehicle.isRecharging
        const batteryBeforeUpdate = playerVehicle.batteryLevel

        weather.applyWindTo(playerVehicle)
        playerVehicle.update(canvas.width, canvas.height, insideSolarZone, environment.loadSheddingActive)

        // track cumulative energy drained (ignores gains from recharging) —
        // used for the Energy Efficiency Score
        const batteryChange = playerVehicle.batteryLevel - batteryBeforeUpdate
        if (batteryChange < 0) {
            totalEnergyConsumed += Math.abs(batteryChange)
        }

        if (playerVehicle.isRecharging && !wasRecharging) {
            soundEngine.playRecharge()
        }

        if (playerVehicle.batteryLevel < 20 && !lowBatteryWarningPlayed) {
            soundEngine.playLowBatteryWarning()
            lowBatteryWarningPlayed = true
        }
        if (playerVehicle.batteryLevel > 30) {
            lowBatteryWarningPlayed = false
        }

        distanceTravelled += playerVehicle.getSpeed()

        obstacles.forEach(obstacle => obstacle.update())
        checkObstacleCollisions()

        if (playerVehicle.isDisabled) {
            gameManager.triggerGameOver(distanceTravelled, totalEnergyConsumed)
        }
    }

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

    // ---------------- State-specific screen overlays ----------------
    if (gameManager.state === GameState.START) {
        drawStartScreen(ctx, canvas.width, canvas.height, gameManager.highScore)
    } else if (gameManager.state === GameState.PAUSED) {
        drawPauseScreen(ctx, canvas.width, canvas.height)
    } else if (gameManager.state === GameState.GAMEOVER) {
        drawGameOverScreen(ctx, canvas.width, canvas.height, gameManager)
    }
}

gameLoop()
