// hud.js
// Draws the heads-up display: battery meter, speed, distance, and status
// messages. Pulled out into its own module (rather than left inline in
// main.js) so the HUD's visual style can be iterated on independently of
// the game logic.

// African-inspired accent palette: warm sunset orange, earth brown, savanna
// green — echoed from the vehicle/obstacle colours already in use, rather
// than introducing a clashing new set.
const HUD_COLORS = {
    text: "#f2e9dc",
    panelBg: "rgba(20, 25, 15, 0.55)",
    panelBorder: "#c77e3a",
    batteryGood: "#9be07a",
    batteryLow: "#e0577a",
    accent: "#ffd166",
}

export function drawHUD(ctx, canvasWidth, vehicle, weather, distanceTravelled) {
    // panel background for readability against busy scenes
    ctx.fillStyle = HUD_COLORS.panelBg
    ctx.fillRect(8, 8, 220, weather.isRaining ? 96 : 78)
    ctx.strokeStyle = HUD_COLORS.panelBorder
    ctx.lineWidth = 1.5
    ctx.strokeRect(8, 8, 220, weather.isRaining ? 96 : 78)

    ctx.font = "13px Arial"
    ctx.textAlign = "left"

    ctx.fillStyle = HUD_COLORS.text
    ctx.fillText(`Battery: ${Math.round(vehicle.batteryLevel)}%`, 18, 28)

    const barWidth = 130
    const barHeight = 9
    ctx.strokeStyle = HUD_COLORS.text
    ctx.strokeRect(18, 34, barWidth, barHeight)
    const fillWidth = (vehicle.batteryLevel / 100) * barWidth
    ctx.fillStyle = vehicle.batteryLevel > 25 ? HUD_COLORS.batteryGood : HUD_COLORS.batteryLow
    ctx.fillRect(18, 34, fillWidth, barHeight)

    ctx.fillStyle = HUD_COLORS.text
    ctx.fillText(`Speed: ${vehicle.getSpeed().toFixed(1)}`, 18, 62)
    ctx.fillText(`Distance: ${Math.round(distanceTravelled)}m`, 18, 78)

    if (weather.isRaining) {
        ctx.fillStyle = "#b4c8ff"
        ctx.fillText("Rain — visibility reduced", 18, 96)
    }

    if (vehicle.isDisabled) {
        ctx.fillStyle = HUD_COLORS.batteryLow
        ctx.font = "bold 20px Arial"
        ctx.textAlign = "center"
        ctx.fillText("BATTERY DEPLETED — find a Solar Microgrid Zone", canvasWidth / 2, 30)
    }
}
