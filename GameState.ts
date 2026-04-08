// GameState.ts

// Type Definitions
interface Crop {
  type: string;
  growthStage: number;
}

interface Player {
  name: string;
  money: number;
  inventory: Crop[];
}

interface GameState {
  player: Player;
  day: number;
  weather: string;
}

// Initial State
const initialState: GameState = {
  player: {
    name: "Default Player",
    money: 100,
    inventory: []
  },
  day: 1,
  weather: "sunny"
};

// Save/Load Functionality
const saveGame = (state: GameState): void => {
  localStorage.setItem('gameState', JSON.stringify(state));
};

const loadGame = (): GameState | null => {
  const savedState = localStorage.getItem('gameState');
  return savedState ? JSON.parse(savedState) : null;
}

export { initialState, saveGame, loadGame };