# Mars Final Earth Simulator

A browser-based vertical colony builder game inspired by **The Final Earth 2** (Poki.com).

Build upward on a Martian surface, manage resources (wood, stone, food), keep your little citizens happy, and grow your population — all in pure HTML5 Canvas + JavaScript.

![Game screenshot - vertical colony with buildings and citizens](https://via.placeholder.com/800x600/1b263b/ffffff?text=Mars+Final+Earth+Simulator+Screenshot)  
*(Replace this placeholder with an actual screenshot later!)*

## Features

- Vertical scrolling world — build higher and higher
- Simple citizen AI (they walk to assigned buildings/jobs)
- Resource production loop: Woodcutters → Wood, Mines → Stone, Farms → Food
- Housing & population growth
- Happiness system (affects birth rate and risk of citizens leaving)
- Basic building menu with costs
- Real-time simulation (ticks every ~800ms)

## Play Online

Soon™ — will be hosted on GitHub Pages / Netlify  
(Currently: double-click `mars-sim.html` or open in browser)

## How to Run Locally (No Installation Needed)

1. Download or clone this repository
2. Open **`mars-sim.html`** in any modern browser (Chrome, Firefox, Edge, Safari)
3. Click the build buttons and watch your colony grow!

No Node.js, no npm, no server required — it's 100% client-side.

## Controls

- Click **House**, **Woodcutter**, **Mine**, or **Farm** buttons to build
- Resources auto-produce over time
- Citizens automatically move toward their assigned building
- Camera slowly scrolls up as you build higher

## Tech Stack

- HTML5 Canvas (for rendering)
- Vanilla JavaScript (no frameworks)
- Pure CSS for UI overlays

Future plans (maybe):
- Pixel-art sprites instead of colored rectangles
- More building types (Pub, School, Lab, Elevator/Teleporter)
- Research / tech tree
- Save/load with localStorage
- Day/night cycle
- Sound effects / music

## Contributing

Pull requests welcome!  
Ideas / issues particularly appreciated for:

- Better pathfinding for citizens
- Balancing numbers (production rates, costs, happiness formula)
- Adding more building types from The Final Earth 2
- Mobile touch support
- Visual polish (gradients, shadows, animations)

## License

MIT License — feel free to use, modify, and share.

Made with ❤️ in Melbourne, Australia  
Inspired by The Final Earth 2 by Bart Bonte / Poki

Happy building on Mars! 🚀
