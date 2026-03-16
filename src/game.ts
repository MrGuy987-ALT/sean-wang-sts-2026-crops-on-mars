// src/game.ts - core logic

import { GameState, Plot } from './types';
import { DAYS_PER_TICK, START_MONEY, START_FOOD, START_WATER, START_POWER_REGEN, START_SHIELD, START_SOIL_AVG, PLOT_COUNT_START, SHIELD_DRAIN_PER_DAY, SHIELD_REPAIR_COST, SHIELD_REPAIR_AMOUNT, ROVER_SOIL_BOOST, CROPS, TICK_INTERVAL_MS } from './constants';

let state: GameState = {
  day: 1,
  money: START_MONEY,
  food: START_FOOD,
  water: START_WATER,
  powerRegen: START_POWER_REGEN,
  shield: START_SHIELD,
  soilAvg: START_SOIL_AVG,
  plots: Array(PLOT_COUNT_START).fill({ progress: 0 }),
  paused: false
};

function updateUI() {
  (document.getElementById('day') as HTMLElement).textContent = state.day.toString();
  (document.getElementById('money') as HTMLElement).textContent = state.money.toString();
  (document.getElementById('food') as HTMLElement).textContent = state.food.toString();
  (document.getElementById('water') as HTMLElement).textContent = state.water.toString();
  (document.getElementById('power') as HTMLElement).textContent = state.powerRegen.toString();
  (document.getElementById('shield') as HTMLElement).textContent = Math.floor(state.shield).toString();
  (document.getElementById('soil') as HTMLElement).textContent = Math.floor(state.soilAvg).toString();

  const plotsEl = document.getElementById('plots') as HTMLElement;
  plotsEl.innerHTML = '';
  state.plots.forEach((plot: Plot, index: number) => {
    const div = document.createElement('div');
    div.className = 'plot';
    if (plot.cropName) {
      const crop = CROPS[plot.cropName];
      const pct = Math.min(100, Math.floor((plot.progress / crop.daysToGrow) * 100));
      div.textContent = `${crop.name}\n${pct}%`;
      if (pct >= 100) div.classList.add('ready');
      else div.classList.add('growing');
    } else {
      div.textContent = 'Empty';
    }
    plotsEl.appendChild(div);
  });
}

export function plant(cropName: string) {
  if (!CROPS[cropName]) return;
  const emptyPlot = state.plots.find(p => !p.cropName);
  if (emptyPlot) {
    emptyPlot.cropName = cropName;
    emptyPlot.progress = 0;
    updateUI();
  }
}

export function sendRover() {
  // Simple instant for now - later add delay
  state.soilAvg = Math.min(100, state.soilAvg + ROVER_SOIL_BOOST);
  updateUI();
}

export function repairShield() {
  if (state.money >= SHIELD_REPAIR_COST) {
    state.money -= SHIELD_REPAIR_COST;
    state.shield = Math.min(100, state.shield + SHIELD_REPAIR_AMOUNT);
    updateUI();
  }
}

export function togglePause() {
  state.paused = !state.paused;
}

function tick() {
  if (state.paused) return;

  state.day += DAYS_PER_TICK;

  // Crop growth
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

  // Simple drains / regens
  state.shield = Math.max(0, state.shield - SHIELD_DRAIN_PER_DAY * DAYS_PER_TICK);
  state.water -= 8 * DAYS_PER_TICK;  // example consumption

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
  init: updateUI  // called after load
};