// src/constants.ts - All tunable numbers in one file

export const DAYS_PER_TICK = 4;          // in-game days advanced per real tick
export const TICK_INTERVAL_MS = 250;     // real ms between ticks

export const START_MONEY = 1200;
export const START_FOOD = 0;
export const START_WATER = 300;
export const START_POWER_REGEN = 100;
export const START_SHIELD = 60;
export const START_SOIL_AVG = 20;

export const PLOT_COUNT_START = 6;

export const SHIELD_DRAIN_PER_DAY = 1.2;
export const SHIELD_REPAIR_COST = 500;
export const SHIELD_REPAIR_AMOUNT = 35;

export const ROVER_SOIL_BOOST = 18;
export const ROVER_JOB_DAYS = 40;  // simulated delay in days

// Crop definitions
export interface Crop {
  name: string;
  daysToGrow: number;
  yield: number;
  value: number;      // money on harvest
}

export const CROPS: Record<string, Crop> = {
  Radish:   { name: "Radish",   daysToGrow: 25, yield: 12, value: 60 },
  Lettuce:  { name: "Lettuce",  daysToGrow: 45, yield: 18, value: 90 },
  Potato:   { name: "Potato",   daysToGrow: 95, yield: 45, value: 140 }
};