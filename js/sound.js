// sound.js
// Simple sound effects generated with the Web Audio API's oscillator, rather
// than loading external audio files. This keeps the project fully
// self-contained (no missing-asset issues when submitted/marked) while still
// satisfying the "background music or sound effects" requirement.

class SoundEngine {
    constructor() {
        this.audioContext = null   // created lazily — browsers block audio
                                     // until the user interacts with the page
    }

    getContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        return this.audioContext
    }

    // plays a short tone: frequency in Hz, duration in seconds, waveform type
    playTone(frequency, duration, type = "sine", volume = 0.15) {
        const ctx = this.getContext()
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.type = type
        oscillator.frequency.value = frequency
        gainNode.gain.value = volume

        // fade out smoothly rather than cutting off abruptly (avoids a click sound)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start()
        oscillator.stop(ctx.currentTime + duration)
    }

    playCollision() {
        this.playTone(120, 0.15, "square", 0.12)
    }

    playRecharge() {
        this.playTone(660, 0.1, "sine", 0.08)
    }

    playLowBatteryWarning() {
        this.playTone(300, 0.2, "triangle", 0.1)
    }
}

export const soundEngine = new SoundEngine()
