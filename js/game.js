// game.js
// Game state management: start screen, pause, game-over, scoring, and
// localStorage persistence for the high score.

export const GameState = {
    START: "start",
    PLAYING: "playing",
    PAUSED: "paused",
    GAMEOVER: "gameover",
}

export class GameManager {
    constructor() {
        this.state = GameState.START
        this.highScore = this.loadHighScore()

        this.finalDistanceScore = 0
        this.finalEfficiencyScore = 0
        this.finalMissionScore = 0
        this.isNewHighScore = false
    }

    loadHighScore() {
        try {
            const stored = localStorage.getItem("ecodash_highScore")
            return stored ? Number(stored) : 0
        } catch (error) {
            // localStorage can be unavailable (private browsing, disabled
            // cookies, etc.) — fail gracefully rather than crashing the game.
            console.warn("localStorage unavailable, high score will not persist:", error)
            return 0
        }
    }

    saveHighScore(score) {
        try {
            localStorage.setItem("ecodash_highScore", String(score))
        } catch (error) {
            console.warn("localStorage unavailable, high score will not persist:", error)
        }
    }

    startGame() {
        this.state = GameState.PLAYING
    }

    togglePause() {
        if (this.state === GameState.PLAYING) this.state = GameState.PAUSED
        else if (this.state === GameState.PAUSED) this.state = GameState.PLAYING
    }

    // Called once when the vehicle's battery is depleted. Combines distance
    // travelled and energy efficiency into a single MissionScore, matching
    // the descriptive-naming example given in the assignment brief.
    triggerGameOver(distanceTravelled, totalEnergyConsumed) {
        const distanceScore = Math.round(distanceTravelled)
        // efficiency rewards covering more distance per unit of energy used —
        // +1 avoids a divide-by-zero if the vehicle never actually drained anything
        const energyEfficiencyScore = Math.round((distanceTravelled / (totalEnergyConsumed + 1)) * 100)
        const missionScore = distanceScore + energyEfficiencyScore

        this.finalDistanceScore = distanceScore
        this.finalEfficiencyScore = energyEfficiencyScore
        this.finalMissionScore = missionScore

        if (missionScore > this.highScore) {
            this.highScore = missionScore
            this.saveHighScore(missionScore)
            this.isNewHighScore = true
        } else {
            this.isNewHighScore = false
        }

        this.state = GameState.GAMEOVER
    }
}

// ---------------- Screen overlays ----------------

export function drawStartScreen(ctx, width, height, highScore) {
    ctx.fillStyle = "rgba(10, 15, 10, 0.75)"
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = "center"
    ctx.fillStyle = "#ffd166"
    ctx.font = "bold 36px Arial"
    ctx.fillText("EcoDash", width / 2, height / 2 - 60)

    ctx.fillStyle = "#f2e9dc"
    ctx.font = "16px Arial"
    ctx.fillText("African Digital Logistics & Infrastructure Simulator", width / 2, height / 2 - 30)

    ctx.font = "14px Arial"
    ctx.fillText("W/Arrow Up = thrust    A/D = turn    P = pause", width / 2, height / 2 + 10)

    ctx.fillStyle = "#9be07a"
    ctx.font = "bold 18px Arial"
    ctx.fillText("Press ENTER to start", width / 2, height / 2 + 50)

    ctx.fillStyle = "#c77e3a"
    ctx.font = "14px Arial"
    ctx.fillText(`High Score: ${highScore}`, width / 2, height / 2 + 80)
}

export function drawPauseScreen(ctx, width, height) {
    ctx.fillStyle = "rgba(10, 15, 10, 0.65)"
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = "center"
    ctx.fillStyle = "#f2e9dc"
    ctx.font = "bold 28px Arial"
    ctx.fillText("Paused", width / 2, height / 2 - 10)

    ctx.font = "14px Arial"
    ctx.fillText("Press P to resume", width / 2, height / 2 + 20)
}

export function drawGameOverScreen(ctx, width, height, gameManager) {
    ctx.fillStyle = "rgba(10, 15, 10, 0.8)"
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = "center"
    ctx.fillStyle = "#e0577a"
    ctx.font = "bold 28px Arial"
    ctx.fillText("Battery Depleted — Mission Ended", width / 2, height / 2 - 70)

    ctx.fillStyle = "#f2e9dc"
    ctx.font = "16px Arial"
    ctx.fillText(`Distance Score: ${gameManager.finalDistanceScore}`, width / 2, height / 2 - 30)
    ctx.fillText(`Energy Efficiency Score: ${gameManager.finalEfficiencyScore}`, width / 2, height / 2 - 5)

    ctx.font = "bold 18px Arial"
    ctx.fillText(`Mission Score: ${gameManager.finalMissionScore}`, width / 2, height / 2 + 25)

    ctx.fillStyle = "#ffd166"
    ctx.font = "14px Arial"
    ctx.fillText(
        gameManager.isNewHighScore ? "New High Score!" : `High Score: ${gameManager.highScore}`,
        width / 2,
        height / 2 + 55
    )

    ctx.fillStyle = "#9be07a"
    ctx.font = "bold 16px Arial"
    ctx.fillText("Press R to restart", width / 2, height / 2 + 90)
}
