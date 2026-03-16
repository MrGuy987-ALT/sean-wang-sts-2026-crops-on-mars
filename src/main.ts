// src/main.ts - entry point for transpilation

import { game } from './game';

// Re-export so index.html can use window.game
export default game;