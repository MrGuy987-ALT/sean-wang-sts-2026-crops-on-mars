import type { GameState, CropPlot, CropType, GrowthStage } from '../GameState'
import { CROP_DEFS, FOOD_PER_COLONIST_PER_SOL } from '../GameState'
import { addLog } from './GameLoop'

export function plantCrop(state: GameState, plotId: string, cropType: CropType): GameState {
  const plot = state.plots[plotId]
  if (!plot || plot.stage !== 'empty') return state
  const def = CROP_DEFS[cropType]
  if (def.tier > state.researchTier) return addLog(state, `${def.name} requires Research Tier 2.`, 'warning')
  return {
    ...state,
    plots: {
      ...state.plots,
      [plotId]: { ...plot, cropType, stage: 'seeded', waterLevel: 80, nutrientLevel: 80, blighted: false, solPlanted: state.sol, tendedThisSol: false },
    },
  }
}

export function tendPlot(state: GameState, plotId: string): GameState {
  const plot = state.plots[plotId]
  if (!plot || plot.stage === 'empty' || plot.stage === 'ready' || plot.tendedThisSol) return state
  return {
    ...state,
    plots: {
      ...state.plots,
      [plotId]: { ...plot, waterLevel: Math.min(100, plot.waterLevel + 30), nutrientLevel: Math.min(100, plot.nutrientLevel + 25), tendedThisSol: true },
    },
  }
}

export function harvestPlot(state: GameState, plotId: string): GameState {
  const plot = state.plots[plotId]
  if (!plot || plot.stage !== 'ready' || !plot.cropType) return state
  const def = CROP_DEFS[plot.cropType]
  const yield_ = plot.blighted ? Math.floor(def.foodYield * 0.3) : def.foodYield
  const clearedPlot: CropPlot = { ...plot, cropType: null, stage: 'empty', blighted: false, tendedThisSol: false, solPlanted: 0 }
  const msg = plot.blighted
    ? `Harvested blighted ${def.name} — only ${yield_} kg recovered.`
    : `Harvested ${def.name} — ${yield_} kg added to stockpile.`
  return addLog({
    ...state,
    plots: { ...state.plots, [plotId]: clearedPlot },
    resources: { ...state.resources, food: state.resources.food + yield_ },
  }, msg, plot.blighted ? 'warning' : 'success')
}

export function tickCrops(state: GameState): GameState {
  const updatedPlots = { ...state.plots }
  for (const plot of Object.values(updatedPlots)) {
    if (plot.stage === 'empty' || plot.stage === 'ready') continue
    const def = plot.cropType ? CROP_DEFS[plot.cropType] : null
    if (!def) continue
    const dome = state.domes.find(d => d.id === plot.domeId)
    const shielded = dome?.hasForceField && dome.forcefieldIntegrity > 0
    const waterDrain = plot.tendedThisSol ? 0 : def.waterNeed * 0.4
    const nutrientDrain = plot.tendedThisSol ? 0 : def.nutrientNeed * 0.3
    const newWater = Math.max(0, plot.waterLevel - waterDrain)
    const newNutrient = Math.max(0, plot.nutrientLevel - nutrientDrain)
    const solsGrowing = state.sol - plot.solPlanted
    const stagesPerCrop = def.growSols / 2
    const speedMult = shielded ? 1.2 : 1.0
    const adjustedSols = solsGrowing * speedMult
    let newStage: GrowthStage = plot.stage
    if (plot.stage === 'seeded' && adjustedSols >= stagesPerCrop) newStage = 'growing'
    else if (plot.stage === 'growing' && adjustedSols >= def.growSols) newStage = 'ready'
    updatedPlots[plot.id] = { ...plot, waterLevel: newWater, nutrientLevel: newNutrient, stage: newStage, tendedThisSol: false }
  }
  return { ...state, plots: updatedPlots }
}

export function solsOfFoodLeft(state: GameState): number {
  const consumption = state.colonists.count * FOOD_PER_COLONIST_PER_SOL
  if (consumption === 0) return 999
  return state.resources.food / consumption
}