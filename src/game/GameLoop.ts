import { create } from 'zustand'
import {
  type GameState, type CropType, type UpgradeId, type LogEntry,
  type ActiveEvent, type CropPlot,
  UPGRADE_DEFS, createInitialState, saveGame, loadGame,
} from '../GameState'
import { tickCrops, plantCrop, tendPlot, harvestPlot } from './CropSystem'
import { tickColonists } from './ColonistSystem'
import { sellPlot, sellFood, recruitColonist, investProductivity } from './TradeSystem'

export function addLog(state: GameState, message: string, type: LogEntry['type'] = 'info'): GameState {
  const entry: LogEntry = { sol: state.sol, message, type, timestamp: Date.now() }
  return { ...state, eventLog: [entry, ...state.eventLog].slice(0, 120) }
}

function recalcRates(state: GameState): GameState {
  const u = state.upgrades
  const activeSolar = Math.max(0, u.solar_panel.count - u.solar_panel.broken)
  const powerGenerated = activeSolar * 10
  const activeBotsMk1 = Math.max(0, u.bot_mk1.count - u.bot_mk1.broken)
  const activeBotsMk2 = Math.max(0, u.bot_mk2.count - u.bot_mk2.broken)
  const activeRecyclers = Math.max(0, u.water_recycler.count - u.water_recycler.broken)
  const activeForcefields = state.domes.filter(d => d.hasForceField && d.forcefieldIntegrity > 0).length
  const activeResearch = Math.max(0, u.research_lab.count - u.research_lab.broken)
  const powerConsumed =
    activeBotsMk1 * UPGRADE_DEFS.bot_mk1.powerDraw +
    activeBotsMk2 * UPGRADE_DEFS.bot_mk2.powerDraw +
    activeRecyclers * UPGRADE_DEFS.water_recycler.powerDraw +
    activeForcefields * UPGRADE_DEFS.forcefield.powerDraw +
    activeResearch * UPGRADE_DEFS.research_lab.powerDraw
  const powerShortage = powerConsumed > powerGenerated
  const recyclerReduction = powerShortage ? 0 : activeRecyclers * 0.35
  const baseWater = state.colonists.count * 5 + Object.values(state.plots).filter(p => p.stage !== 'empty').length * 8
  const waterConsumedPerSol = Math.round(baseWater * (1 - Math.min(recyclerReduction, 0.7)))
  const researchPerSol = powerShortage ? 0 : activeResearch * 5
  const foodPerSol = -(state.colonists.count * 1.2)
  return {
    ...state,
    resources: { ...state.resources, power: powerGenerated, powerUsed: Math.min(powerConsumed, powerGenerated) },
    rates: { foodPerSol, waterConsumedPerSol, powerGenerated, powerConsumed, researchPerSol, creditsPerSol: 0 },
  }
}

function triggerRandomEvent(state: GameState): GameState {
  const roll = Math.random()
  let s = state
  if (roll < 0.35) {
    const duration = 2 + Math.floor(Math.random() * 3)
    const ev: ActiveEvent = { id: `ev-${Date.now()}`, type: 'dust_storm', description: `Dust storm (${duration} sols)`, solsRemaining: duration, severity: 'medium' }
    const panelDamage = Math.floor(s.upgrades.solar_panel.count * 0.7)
    s = { ...s, activeEvents: [...s.activeEvents, ev], upgrades: { ...s.upgrades, solar_panel: { ...s.upgrades.solar_panel, broken: Math.min(panelDamage, s.upgrades.solar_panel.count) } } }
    s = addLog(s, `Dust storm incoming! Solar output reduced for ${duration} sols.`, 'warning')
  } else if (roll < 0.5) {
    const candidates = (['bot_mk1','bot_mk2','water_recycler','forcefield','solar_panel'] as UpgradeId[]).filter(id => s.upgrades[id].count > s.upgrades[id].broken)
    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)]
      const upg = s.upgrades[target]
      s = { ...s, upgrades: { ...s.upgrades, [target]: { ...upg, broken: upg.broken + 1 } } }
      s = addLog(s, `${UPGRADE_DEFS[target].name} malfunction! Repair needed.`, 'danger')
    }
  } else if (roll < 0.65) {
    const panelsBroken = Math.min(s.upgrades.solar_panel.count, Math.ceil(s.upgrades.solar_panel.count * 0.6))
    const flareDuration = 1 + Math.floor(Math.random() * 3)
    const ev: ActiveEvent = { id: `ev-${Date.now()}`, type: 'solar_flare', description: `Solar flare (${flareDuration} sols)`, solsRemaining: flareDuration, severity: 'medium' }
    s = { ...s, activeEvents: [...s.activeEvents, ev], upgrades: { ...s.upgrades, solar_panel: { ...s.upgrades.solar_panel, broken: panelsBroken } } }
    s = addLog(s, `Solar flare! ${panelsBroken} solar arrays offline for ${flareDuration} sols.`, 'danger')
  } else if (roll < 0.78) {
    const blightable = Object.values(s.plots).filter(p => p.stage !== 'empty' && !p.blighted)
    if (blightable.length > 0) {
      const target = blightable[Math.floor(Math.random() * blightable.length)]
      const dome = s.domes.find(d => d.id === target.domeId)
      if (!dome?.hasForceField || dome.forcefieldIntegrity <= 0) {
        s = { ...s, plots: { ...s.plots, [target.id]: { ...target, blighted: true } } }
        s = addLog(s, `Crop blight in ${dome?.name || 'a dome'}! Treat immediately.`, 'danger')
      }
    }
  } else if (roll < 0.88) {
    const ev: ActiveEvent = { id: `ev-${Date.now()}`, type: 'meteor', description: 'Meteor impact imminent', solsRemaining: 1, severity: 'high' }
    s = { ...s, activeEvents: [...s.activeEvents, ev] }
    s = addLog(s, 'METEOR WARNING: Impact expected next sol! Activate forcefields.', 'danger')
  }
  return s
}

function tickEvents(state: GameState): GameState {
  let s = state
  const updatedEvents: ActiveEvent[] = []
  for (const ev of s.activeEvents) {
    if (ev.solsRemaining <= 1) s = addLog(s, `${ev.description} — has passed.`, 'info')
    else updatedEvents.push({ ...ev, solsRemaining: ev.solsRemaining - 1 })
  }
  s = { ...s, activeEvents: updatedEvents }
  if (Math.random() < 0.20) s = triggerRandomEvent(s)
  return s
}

function runSolTick(state: GameState): GameState {
  let s = addLog(state, `Sol ${state.sol + 1} begins.`, 'info')
  s = tickCrops(s)
  s = tickColonists(s)
  s = tickEvents(s)
  s = recalcRates(s)
  s = {
    ...s,
    sol: s.sol + 1,
    solTimer: 0,
    resources: { ...s.resources, research: s.resources.research + s.rates.researchPerSol, water: Math.max(0, s.resources.water - s.rates.waterConsumedPerSol + 50) },
  }
  if (s.resources.research >= 100 && s.researchTier === 1) {
    s = { ...s, researchTier: 2 }
    s = addLog(s, 'Research Tier 2 unlocked! Wheat, Soy, Fungi and Mk2 bots now available.', 'success')
  }
  saveGame(s)
  return s
}

function makeDomePlots(domeId: string, count: number, startIndex: number): { plots: CropPlot[]; ids: string[] } {
  const plots: CropPlot[] = []
  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    const id = `${domeId}-plot-${startIndex + i}`
    ids.push(id)
    plots.push({ id, domeId, cropType: null, stage: 'empty', waterLevel: 80, nutrientLevel: 80, blighted: false, solPlanted: 0, tendedThisSol: false })
  }
  return { plots, ids }
}

interface GameStore {
  state: GameState
  plant: (plotId: string, cropType: CropType) => void
  tend: (plotId: string) => void
  harvest: (plotId: string) => void
  sellPlot: (plotId: string) => void
  sellFood: (kg: number) => void
  recruitColonist: () => void
  investProductivity: () => void
  buyUpgrade: (id: UpgradeId) => void
  repairUpgrade: (id: UpgradeId) => void
  tick: (deltaSeconds: number) => void
  togglePause: () => void
  newGame: () => void
  clearBlight: (plotId: string) => void
}

export const useGameStore = create<GameStore>((set) => ({
  state: loadGame() ?? createInitialState(),

  plant: (plotId, cropType) => set(s => ({ state: plantCrop(s.state, plotId, cropType) })),
  tend: (plotId) => set(s => ({ state: tendPlot(s.state, plotId) })),
  harvest: (plotId) => set(s => ({ state: harvestPlot(s.state, plotId) })),
  sellPlot: (plotId) => set(s => ({ state: sellPlot(s.state, plotId) })),
  sellFood: (kg) => set(s => ({ state: sellFood(s.state, kg) })),
  recruitColonist: () => set(s => ({ state: recruitColonist(s.state) })),
  investProductivity: () => set(s => ({ state: investProductivity(s.state) })),

  clearBlight: (plotId) => set(s => {
    const state = s.state
    const plot = state.plots[plotId]
    if (!plot || !plot.blighted) return s
    const cost = 150
    if (state.resources.credits < cost) return s
    return {
      state: addLog({
        ...state,
        plots: { ...state.plots, [plotId]: { ...plot, blighted: false } },
        resources: { ...state.resources, credits: state.resources.credits - cost },
      }, `Blight treated for ${cost}₹.`, 'success'),
    }
  }),

  buyUpgrade: (id) => set(s => {
    const state = s.state
    const def = UPGRADE_DEFS[id]
    const cost = Math.floor(def.baseCost * Math.pow(1.5, state.upgrades[id].count))
    if (state.resources.credits < cost) return s

    if (id === 'dome') {
      const domeCount = state.domes.length
      if (domeCount >= 4) return { state: addLog(state, 'Maximum 4 domes reached.', 'warning') }
      const newDomeId = `dome-${domeCount + 1}`
      const letters = ['Alpha','Beta','Gamma','Delta']
      const { plots: newPlots, ids: newIds } = makeDomePlots(newDomeId, 6, Object.keys(state.plots).length)
      const plotMap = { ...state.plots }
      newPlots.forEach(p => { plotMap[p.id] = p })
      return {
        state: addLog({
          ...state,
          domes: [...state.domes, { id: newDomeId, name: `Dome ${letters[domeCount]}`, hasForceField: false, forcefieldIntegrity: 100, plots: newIds }],
          plots: plotMap,
          upgrades: { ...state.upgrades, dome: { ...state.upgrades.dome, count: state.upgrades.dome.count + 1 } },
          resources: { ...state.resources, credits: state.resources.credits - cost },
        }, `${letters[domeCount]} dome constructed. 6 new plots available.`, 'success'),
      }
    }

    if (id === 'forcefield') {
      const targetDome = state.domes.find(d => !d.hasForceField)
      if (!targetDome) return { state: addLog(state, 'All domes already have forcefields.', 'warning') }
      return {
        state: addLog({
          ...state,
          domes: state.domes.map(d => d.id === targetDome.id ? { ...d, hasForceField: true, forcefieldIntegrity: 100 } : d),
          upgrades: { ...state.upgrades, forcefield: { ...state.upgrades.forcefield, count: state.upgrades.forcefield.count + 1 } },
          resources: { ...state.resources, credits: state.resources.credits - cost },
        }, `Forcefield activated on ${targetDome.name}.`, 'success'),
      }
    }

    if (id === 'trade_rocket') {
      return {
        state: addLog({
          ...state,
          tradeRocketUnlocked: true,
          upgrades: { ...state.upgrades, trade_rocket: { ...state.upgrades.trade_rocket, count: 1 } },
          resources: { ...state.resources, credits: state.resources.credits - cost },
        }, 'Trade rocket ready. First launch in 20 sols.', 'success'),
      }
    }

    return {
      state: addLog(recalcRates({
        ...state,
        upgrades: { ...state.upgrades, [id]: { ...state.upgrades[id], count: state.upgrades[id].count + 1 } },
        resources: { ...state.resources, credits: state.resources.credits - cost },
      }), `${def.name} purchased.`, 'success'),
    }
  }),

  repairUpgrade: (id) => set(s => {
    const state = s.state
    const upg = state.upgrades[id]
    if (upg.broken === 0) return s
    const repairCost = Math.floor(UPGRADE_DEFS[id].baseCost * 0.4)
    if (state.resources.credits < repairCost) return { state: addLog(state, `Need ${repairCost}₹ to repair.`, 'warning') }
    return {
      state: addLog(recalcRates({
        ...state,
        upgrades: { ...state.upgrades, [id]: { ...upg, broken: upg.broken - 1 } },
        resources: { ...state.resources, credits: state.resources.credits - repairCost },
      }), `${UPGRADE_DEFS[id].name} repaired.`, 'success'),
    }
  }),

  tick: (deltaSeconds) => set(s => {
    if (s.state.paused) return s
    let newTimer = s.state.solTimer + deltaSeconds
    let nextState = s.state
    while (newTimer >= nextState.solDuration) {
      newTimer -= nextState.solDuration
      nextState = runSolTick(nextState)
    }
    return { state: { ...nextState, solTimer: newTimer } }
  }),

  togglePause: () => set(s => ({ state: { ...s.state, paused: !s.state.paused } })),
  newGame: () => set({ state: createInitialState() }),
}))