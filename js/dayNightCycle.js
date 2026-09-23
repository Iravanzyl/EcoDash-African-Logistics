// dayNightCycle.js
// Draws the background according to the load-shedding state.

export function drawDayNightBackground(
    ctx,
    width,
    height,
    loadSheddingActive
) {
    if (loadSheddingActive) {
        // Dark/night background during load shedding
        ctx.fillStyle = "#101522"
    } else {
        // Light/day background when there is no load shedding
        ctx.fillStyle = "#87CEEB"
    }

    ctx.fillRect(0, 0, width, height)
}