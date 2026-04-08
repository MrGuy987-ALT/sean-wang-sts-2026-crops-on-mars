import type { GameState, ColonistInfo } from '../GameState'
import { FOOD_PER_COLONIST_PER_SOL } from '../GameState'
import { addLog } from './GameLoop'

export function tickColonists(state: GameState): GameState {
  const consumed = state.colonists.count * FOOD_PER_COLONIST_PER_SOL
  const newFood = Math.max(0, state.resources.food - consumed)
  const solsLeft = newFood / (state.colonists.count * FOOD_PER_COLONIST_PER_SOL || 1)

  let foodDeficitTier: 0 | 1 | 2 | 3 = 0
  let productivity = 1.0
  if (solsLeft <= 0)      { foodDeficitTier = 3; productivity = 0.3 }
  else if (solsLeft < 3)  { foodDeficitTier = 2; productivity = 0.6 }
  else if (solsLeft < 7)  { foodDeficitTier = 1; productivity = 0.85 }

  const colonists: ColonistInfo = { ...state.colonists, productivity, foodDeficitTier }
  let s: GameState = { ...state, resources: { ...state.resources, food: newFood }, colonists }

  if (foodDeficitTier === 2 && state.colonists.foodDeficitTier < 2)
    s = addLog(s, 'Food critically low! Colonists are hungry. Productivity at 60%.', 'danger')
  else if (foodDeficitTier === 1 && state.colonists.foodDeficitTier === 0)
    s = addLog(s, 'Food reserves running low. Under 7 sols remaining.', 'warning')
  else if (foodDeficitTier === 3 && state.colonists.foodDeficitTier < 3)
    s = addLog(s, 'STARVATION WARNING: Colonists considering evacuation!', 'danger')

  if (foodDeficitTier === 3 && s.colonists.count > 1 && s.sol % 3 === 0) {
    s = addLog({
      ...s,
      colonists: { ...s.colonists, count: s.colonists.count - 1 },
    }, `1 colonist boarded the next rocket home. Population: ${s.colonists.count - 1}.`, 'danger')
  }
  return s
}