# EcoDash: African Digital Logistics & Infrastructure Simulator

## Project Title
EcoDash — An HTML5 Canvas simulation of solar-powered delivery logistics across an African context.

## Project Description
EcoDash is an interactive 2D simulation built with HTML5 Canvas, CSS3, and vanilla JavaScript (ES6+). The player
controls a solar-powered electric delivery vehicle / drone transporting essential supplies (medical, food,
educational) across a simulated African environment, while managing battery levels, navigating environmental
hazards, and responding to real-world infrastructure challenges such as load-shedding and poor road conditions.

This project was developed for the WAS262 (Web Animation Scripting) module at STADIO, School of Information
Technology.

## African Challenge Addressed
Load-shedding disrupting the cold-chain delivery of medical supplies in South Africa.

See `docs/African_Context_Report.docx` for the full context report and mathematical modelling explanation.

## Features
- Vector- and trigonometry-based vehicle movement (thrust, drag, directional velocity)
- Dynamic battery/solar-reserve system with rechargeable "Solar Microgrid Zones"
- Obstacle system with mathematical collision detection (potholes, rivers, wildlife, load-shedding zones)
- Environmental effects (rain reduces visibility, wind alters movement)
- Day/night cycle reflecting the load-shedding schedule (original feature, built without AI assistance)
- Score system with local storage for high scores
- Start / pause / game-over screens with restart-without-refresh

## Installation / Setup Instructions
1. Clone this repository:
   ```
   git clone https://github.com/Iravanzyl/EcoDash-African-Logistics
   ```
2. Open the project folder in Visual Studio Code.
3. Open `index.html` directly in a browser, or use the VS Code "Live Server" extension for auto-reload during
   development.
4. No build step or external frameworks are required — this project uses vanilla HTML5, CSS3, and JavaScript only.

## Project Folder Structure
```
EcoDash-African-Logistics/
├── index.html
├── style.css
├── js/
│   ├── main.js          # entry point, game loop
│   ├── vehicle.js        # player vehicle class (movement, physics, battery)
│   ├── obstacle.js        # obstacle classes and collision detection
│   ├── environment.js     # weather / environmental effects, load-shedding schedule
│   ├── hud.js              # HUD, score display
│   └── game.js              # game state management (start/pause/gameover)
├── assets/
│   ├── images/
│   └── sounds/
├── docs/
│   ├── African_Context_Report.docx
│   ├── AI_Reflection_Log.docx
│   └── wireframe.png
└── README.md
```

## AI Usage Disclosure Table
See `docs/AI_Reflection_Log.docx` for full prompts, AI responses, and how each response was reviewed and modified.

| Area | AI Assisted? | Notes |
|---|---|---|
| Project planning / README structure | Yes | AI-assisted, reviewed and edited |
| Vehicle physics (velocity/acceleration/trig) | Yes | AI-assisted, code understood and customised |
| Obstacle & collision system | Yes | AI-assisted, code understood and customised |
| Day/night cycle (load-shedding indicator) | **No** | Built independently, no AI assistance |

## Author
Ira van Zyl — WAS262, STADIO School of Information Technology
