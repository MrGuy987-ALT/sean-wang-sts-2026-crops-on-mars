// src/types.ts

export interface Plot {
  cropName?: string;
  progress: number;  // days grown so far
}

export interface GameState {
  day: number;
  money: number;
  food: number;
  water: number;
  powerRegen: number;
  shield: number;
  soilAvg: number;
  plots: Plot[];
  paused: boolean;
}