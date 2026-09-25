// obstacle.js
// Defines the environmental obstacles the player's vehicle must navigate.
// Demonstrates BOTH collision detection methods named in the brief:
//   - Circular distance calculations (Pothole, Wildlife)
//   - Rectangle / AABB calculations (FallenTree, ConstructionZone)
//
// Each obstacle type has its own gameplay response on collision, rather than
// a single generic "game over" reaction — matching real infrastructure
// challenges (a pothole slows you down, a fallen tree fully blocks the road).

// ---------------- Collision helper functions ----------------

// Circle vs circle: distance between centres compared to the sum of radii.
export function circlesCollide(circleA, circleB) {
    const dx = circleA.x - circleB.x
    const dy = circleA.y - circleB.y
    const distance = Math.hypot(dx, dy)
    return distance < circleA.radius + circleB.radius
}

// Circle vs rectangle (AABB): find the closest point on the rectangle to the
// circle's centre, then check if that point is within the circle's radius.
// This lets a circular vehicle collide correctly with rectangular obstacles.
export function circleRectCollide(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width))
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height))

    const dx = circle.x - closestX
    const dy = circle.y - closestY
    const distance = Math.hypot(dx, dy)

    return distance < circle.radius
}

// ---------------- Base class ----------------

class Obstacle {
    constructor(x, y, type) {
        this.x = x
        this.y = y
        this.type = type
        this.isColliding = false        // used for visual feedback
        this.flashTimer = 0             // frames remaining to show a collision flash
        this.isCurrentlyTouching = false  // tracks actual contact, separate from the flash timer
        this.continuousEffect = false     // true only for obstacles meant to re-apply every frame (e.g. ConstructionZone)
    }

    triggerCollisionFlash() {
        this.isColliding = true
        this.flashTimer = 20            // ~1/3 second at 60fps
    }

    updateFlash() {
        if (this.flashTimer > 0) {
            this.flashTimer--
        } else {
            this.isColliding = false
        }
    }
}

// ---------------- Circular obstacles ----------------

export class Pothole extends Obstacle {
    constructor(x, y) {
        super(x, y, "pothole")
        this.radius = 18
    }

    // Effect: sudden speed and battery penalty, then the vehicle carries on.
    applyEffect(vehicle) {
        vehicle.velocityX *= 0.3
        vehicle.velocityY *= 0.3
        vehicle.batteryLevel = Math.max(0, vehicle.batteryLevel - 2)
        this.triggerCollisionFlash()
    }

    update() {
        this.updateFlash()
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.isColliding ? "#ffffff" : "#4a3728"
        ctx.fill()
        ctx.strokeStyle = "#2a1c14"
        ctx.lineWidth = 2
        ctx.stroke()
    }
}

export class Wildlife extends Obstacle {
    constructor(x, y, patrolRangeX) {
        super(x, y, "wildlife")
        this.radius = 14
        this.startX = x
        this.patrolRangeX = patrolRangeX
        this.patrolSpeed = 1.2
        this.direction = 1   // 1 = moving right, -1 = moving left
    }

    // Moves back and forth across a fixed horizontal range, reversing
    // direction at each boundary of its patrol area.
    update() {
        this.x += this.patrolSpeed * this.direction
        if (this.x > this.startX + this.patrolRangeX || this.x < this.startX - this.patrolRangeX) {
            this.direction *= -1
        }
        this.updateFlash()
    }

    // Effect: the vehicle bounces backward, simulating an evasive swerve.
    applyEffect(vehicle) {
        vehicle.velocityX *= -0.8
        vehicle.velocityY *= -0.8
        this.triggerCollisionFlash()
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.isColliding ? "#ffffff" : "#c77e3a"
        ctx.fill()
        ctx.strokeStyle = "#6e441c"
        ctx.lineWidth = 2
        ctx.stroke()
    }
}

// ---------------- Rectangular (AABB) obstacles ----------------

export class FallenTree extends Obstacle {
    constructor(x, y, width, height) {
        super(x, y, "fallenTree")
        this.width = width
        this.height = height
    }

    update() {
        this.updateFlash()
    }

    // Effect: acts as a solid wall — push the vehicle back out along
    // whichever axis it penetrated the least, so it can't pass through.
    applyEffect(vehicle) {
        const overlapLeft = (vehicle.positionX + vehicle.radius) - this.x
        const overlapRight = (this.x + this.width) - (vehicle.positionX - vehicle.radius)
        const overlapTop = (vehicle.positionY + vehicle.radius) - this.y
        const overlapBottom = (this.y + this.height) - (vehicle.positionY - vehicle.radius)

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapLeft) vehicle.positionX = this.x - vehicle.radius
        else if (minOverlap === overlapRight) vehicle.positionX = this.x + this.width + vehicle.radius
        else if (minOverlap === overlapTop) vehicle.positionY = this.y - vehicle.radius
        else vehicle.positionY = this.y + this.height + vehicle.radius

        vehicle.velocityX *= -0.3
        vehicle.velocityY *= -0.3

        this.triggerCollisionFlash()
    }

    draw(ctx) {
        ctx.fillStyle = this.isColliding ? "#ffffff" : "#5a4020"
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.strokeStyle = "#2e2410"
        ctx.lineWidth = 2
        ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
}

export class ConstructionZone extends Obstacle {
    constructor(x, y, width, height) {
        super(x, y, "constructionZone")
        this.width = width
        this.height = height
        this.continuousEffect = true   // deliberately re-applies every frame while inside
    }

    update() {
        this.updateFlash()
    }

    // Effect: continuous slow-down while inside the zone, rather than a
    // one-off hit — models a construction/traffic delay.
    applyEffect(vehicle) {
        vehicle.velocityX *= 0.9
        vehicle.velocityY *= 0.9
        this.isColliding = true
        this.flashTimer = 5   // kept short since this re-triggers every frame while inside
    }

    draw(ctx) {
        ctx.fillStyle = this.isColliding ? "rgba(255,209,102,0.55)" : "rgba(255,209,102,0.25)"
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.strokeStyle = "#ffd166"
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.strokeRect(this.x, this.y, this.width, this.height)
        ctx.setLineDash([])
    }
}
