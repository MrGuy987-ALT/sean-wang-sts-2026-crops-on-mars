// src/main.ts - Self-contained game (no imports needed)

// ================================================
// TUNABLES - Change these!
const DAYS_PER_TICK = 4;
const TICK_INTERVAL_MS = 250;

const START_MONEY = 1200;
const START_FOOD = 0;
const START_WATER = 300;
const START_POWER_REGEN = 100;
const START_SHIELD = 60;
const START_SOIL_AVG = 20;

const PLOT_COUNT_START = 6;

const SHIELD_DRAIN_PER_DAY = 1.2;
const SHIELD_REPAIR_COST = 500;
const SHIELD_REPAIR_AMOUNT = 35;

const ROVER_SOIL_BOOST = 18;

// Crop definitions
const CROPS = {
  Radish:   { name: "Radish",   daysToGrow: 25, yield: 12, value: 60 },
  Lettuce:  { name: "Lettuce",  daysToGrow: 45, yield: 18, value: 90 },
  Potato:   { name: "Potato",   daysToGrow: 95, yield: 45, value: 140 }
};

// Game state
let state = {
  day: 1,
  money: START_MONEY,
  food: START_FOOD,
  water: START_WATER,
  powerRegen: START_POWER_REGEN,
  shield: START_SHIELD,
  soilAvg: START_SOIL_AVG,
  plots: Array(PLOT_COUNT_START).fill({ cropName: undefined, progress: 0 }),
  paused: false
};

// UI update
function updateUI() {
  document.getElementById('day').textContent = state.day;
  document.getElementById('money').textContent = state.money;
  document.getElementById('food').textContent = state.food;
  document.getElementById('water').textContent = state.water;
  document.getElementById('power').textContent = state.powerRegen;
  document.getElementById('shield').textContent = Math.floor(state.shield);
  document.getElementById('soil').textContent = Math.floor(state.soilAvg);

  const plotsEl = document.getElementById('plots');
  plotsEl.innerHTML = '';
  state.plots.forEach(plot => {
    const div = document.createElement('div');
    div.className = 'plot';
    if (plot.cropName) {
      const crop = CROPS[plot.cropName];
      const pct = Math.min(100, Math.floor((plot.progress / crop.daysToGrow) * 100));
      div.textContent = `${crop.name} (${pct}%)`;
      if (pct >= 100) div.classList.add('ready');
      else div.classList.add('growing');
    } else {
      div.textContent = 'Empty';
    }
    plotsEl.appendChild(div);
  });
}

// Actions (exported for window.game)
function plant(cropName) {
  if (!CROPS[cropName]) return;
  const empty = state.plots.find(p => !p.cropName);
  if (empty) {
    empty.cropName = cropName;
    empty.progress = 0;
    updateUI();
  }
}

function sendRover() {
  state.soilAvg = Math.min(100, state.soilAvg + ROVER_SOIL_BOOST);
  updateUI();
}

function repairShield() {
  if (state.money >= SHIELD_REPAIR_COST) {
    state.money -= SHIELD_REPAIR_COST;
    state.shield = Math.min(100, state.shield + SHIELD_REPAIR_AMOUNT);
    updateUI();
  }
}

function togglePause() {
  state.paused = !state.paused;
}

// Game tick
function tick() {
  if (state.paused) return;

  state.day += DAYS_PER_TICK;

  // Crop growth & harvest
  state.plots.forEach(p => {
    if (p.cropName) {
      p.progress += DAYS_PER_TICK;
      const crop = CROPS[p.cropName];
      if (p.progress >= crop.daysToGrow) {
        state.food += crop.yield;
        state.money += crop.value;
        p.cropName = undefined;
        p.progress = 0;
      }
    }
  });

  // Simple drains
  state.shield = Math.max(0, state.shield - SHIELD_DRAIN_PER_DAY * DAYS_PER_TICK);
  state.water -= 8 * DAYS_PER_TICK; // example

  updateUI();
}

// Start loop
setInterval(tick, TICK_INTERVAL_MS);

// Initial UI
updateUI();

// Export for index.html
export const game = {
  plant,
  sendRover,
  repairShield,
  togglePause,
  init: updateUI
};