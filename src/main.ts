// src/main.ts - Fully self-contained, no imports, no relative paths

// TUNABLES
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

// Crops (object instead of interface for simplicity)
const CROPS = {
  Radish:   { name: "Radish",   daysToGrow: 25, yield: 12, value: 60 },
  Lettuce:  { name: "Lettuce",  daysToGrow: 45, yield: 18, value: 90 },
  Potato:   { name: "Potato",   daysToGrow: 95, yield: 45, value: 140 }
};

// Game state
const state = {
  day: 1,
  money: START_MONEY,
  food: START_FOOD,
  water: START_WATER,
  powerRegen: START_POWER_REGEN,
  shield: START_SHIELD,
  soilAvg: START_SOIL_AVG,
  plots: Array(PLOT_COUNT_START).fill(null).map(() => ({ cropName: undefined, progress: 0 })),
  paused: false
};

// Safe UI update with null checks
function updateUI() {
  const dayEl = document.getElementById('day');
  const moneyEl = document.getElementById('money');
  const foodEl = document.getElementById('food');
  const waterEl = document.getElementById('water');
  const powerEl = document.getElementById('power');
  const shieldEl = document.getElementById('shield');
  const soilEl = document.getElementById('soil');
  const plotsEl = document.getElementById('plots');

  if (dayEl) dayEl.textContent = state.day.toString();
  if (moneyEl) moneyEl.textContent = state.money.toString();
  if (foodEl) foodEl.textContent = state.food.toString();
  if (waterEl) waterEl.textContent = state.water.toString();
  if (powerEl) powerEl.textContent = state.powerRegen.toString();
  if (shieldEl) shieldEl.textContent = Math.floor(state.shield).toString();
  if (soilEl) soilEl.textContent = Math.floor(state.soilAvg).toString();

  if (plotsEl) {
    plotsEl.innerHTML = '';
    state.plots.forEach((plot) => {
      const div = document.createElement('div');
      div.className = 'plot';
      if (plot.cropName && CROPS[plot.cropName]) {
        const crop = CROPS[plot.cropName];
        const pct = Math.min(100, Math.floor((plot.progress / crop.daysToGrow) * 100));
        div.textContent = `${crop.name} (${pct}%)`;
        if (pct >= 100) {
          div.classList.add('ready');
        } else {
          div.classList.add('growing');
        }
      } else {
        div.textContent = 'Empty';
      }
      plotsEl.appendChild(div);
    });
  }
}

// Actions
function plant(cropName) {
  if (!CROPS[cropName]) return;  // safe check
  const emptyPlot = state.plots.find(p => !p.cropName);
  if (emptyPlot) {
    emptyPlot.cropName = cropName;
    emptyPlot.progress = 0;
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

// Tick loop
function tick() {
  if (state.paused) return;

  state.day += DAYS_PER_TICK;

  // Grow crops
  state.plots.forEach(p => {
    if (p.cropName && CROPS[p.cropName]) {
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

  // Drains / regens (example)
  state.shield = Math.max(0, state.shield - SHIELD_DRAIN_PER_DAY * DAYS_PER_TICK);
  state.water -= 8 * DAYS_PER_TICK;

  updateUI();
}

// Start
setInterval(tick, TICK_INTERVAL_MS);

// Initial draw
updateUI();

// Export for window.game
export const game = {
  plant,
  sendRover,
  repairShield,
  togglePause,
  init: updateUI
};