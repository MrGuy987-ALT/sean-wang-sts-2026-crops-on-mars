import type { GameState } from '../GameState'
import { CROP_DEFS } from '../GameState'
import { addLog } from './GameLoop'

export const MARKET_FOOD_PRICE_PER_KG = 2
export const COLONIST_RECRUIT_COST = 250
export const PRODUCTIVITY_INVEST_COST = 400
export const PRODUCTIVITY_STEP = 0.05
export const PRODUCTIVITY_MAX_BONUS = 0.5

export function sellPlot(state: GameState, plotId: string): GameState {
  const plot = state.plots[plotId]
  if (!plot || plot.stage !== 'ready' || !plot.cropType) return state
  const def = CROP_DEFS[plot.cropType]
  const saleValue = plot.blighted ? Math.max(1, Math.floor(def.value * 0.5)) : def.value
  const msg = plot.blighted
    ? `Sold blighted ${def.name} for ${saleValue}₹.`
    : `Sold ${def.name} for ${saleValue}₹.`
  return addLog({
    ...state,
    plots: { ...state.plots, [plotId]: { ...plot, cropType: null, stage: 'empty', blighted: false, tendedThisSol: false, solPlanted: 0 } },
    resources: { ...state.resources, credits: state.resources.credits + saleValue },
  }, msg, 'success')
}

export function sellFood(state: GameState, kilos: number): GameState {
  if (kilos <= 0 || kilos > state.resources.food) return state
  const saleValue = Math.floor(kilos * MARKET_FOOD_PRICE_PER_KG)
  return addLog({
    ...state,
    resources: { ...state.resources, food: state.resources.food - kilos, credits: state.resources.credits + saleValue },
  }, `Sold ${kilos}kg of food for ${saleValue}₹.`, 'success')
}

export function recruitColonist(state: GameState): GameState {
  if (state.resources.credits < COLONIST_RECRUIT_COST) return addLog(state, `Need ${COLONIST_RECRUIT_COST}₹ to recruit a colonist.`, 'warning')
  return addLog({
    ...state,
    colonists: { ...state.colonists, count: state.colonists.count + 1 },
    resources: { ...state.resources, credits: state.resources.credits - COLONIST_RECRUIT_COST },
  }, `Recruited 1 colonist for ${COLONIST_RECRUIT_COST}₹.`, 'success')
}

export function investProductivity(state: GameState): GameState {
  const bonus = state.colonists.productivityBonus ?? 0
  if (state.resources.credits < PRODUCTIVITY_INVEST_COST) return addLog(state, `Need ${PRODUCTIVITY_INVEST_COST}₹ to fund productivity upgrades.`, 'warning')
  if (bonus >= PRODUCTIVITY_MAX_BONUS) return addLog(state, 'Productivity has reached its current cap.', 'warning')

  const nextBonus = Math.min(PRODUCTIVITY_MAX_BONUS, bonus + PRODUCTIVITY_STEP)
  return addLog({
    ...state,
    colonists: { ...state.colonists, productivityBonus: nextBonus },
    resources: { ...state.resources, credits: state.resources.credits - PRODUCTIVITY_INVEST_COST },
  }, `Invested ${PRODUCTIVITY_INVEST_COST}₹ in productivity training.`, 'success')
}
