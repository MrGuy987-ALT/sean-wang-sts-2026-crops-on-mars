// GameState.ts

export type CropType = 'potato' | 'wheat' | 'corn' | 'soybean' | 'rice'

export type GrowthStage = 'empty' | 'seeded' | 'planted' | 'growing' | 'ready' | 'blighted'

export interface CropPlot {
  id: string
  domeId: string
  stage: GrowthStage
  cropType: CropType | null
  blighted: boolean
  tendedThisSol: boolean
  solPlanted: number
  waterLevel: number
  nutrientLevel: number
}

export interface Dome {
  id: string
  name: string
  hasForceField: boolean
  forcefieldIntegrity: number
  plots: string[]
}

export interface ColonistInfo {
  count: number
  productivity: number
  productivityBonus: number
  foodDeficitTier: 0 | 1 | 2 | 3
}

export type UpgradeId = 'solar_panel' | 'bot_mk1' | 'bot_mk2' | 'water_recycler' | 'forcefield' | 'research_lab' | 'dome' | 'trade_rocket'

export interface UpgradeState {
  count: number
  broken: number
}

export interface LogEntry {
  sol: number
  message: string
  type: 'info' | 'warning' | 'danger' | 'success'
  timestamp: number
}

export interface ActiveEvent {
  id: string
  type: string
  description: string
  solsRemaining: number
  severity: 'low' | 'medium' | 'high'
}

export interface Resources {
  food: number
  water: number
  nutrients: number
  credits: number
  power: number
  powerUsed: number
  research: number
}

export interface Rates {
  foodPerSol: number
  waterConsumedPerSol: number
  powerGenerated: number
  powerConsumed: number
  researchPerSol: number
  creditsPerSol: number
}

export interface GameState {
  sol: number
  colonists: ColonistInfo
  resources: Resources
  rates: Rates
  plots: Record<string, CropPlot>
  domes: Dome[]
  upgrades: Record<UpgradeId, UpgradeState>
  eventLog: LogEntry[]
  activeEvents: ActiveEvent[]
  researchTier: number
  solTimer: number
  paused: boolean
  solDuration: number
  tradeRocketUnlocked: boolean
}

export const FOOD_PER_COLONIST_PER_SOL = 1.2

export const CROP_DEFS: Record<CropType, { name: string; color: string; tier: number; growSols: number; waterNeed: number; nutrientNeed: number; foodYield: number; value: number }> = {
  potato: { name: 'Potato', color: '#F5DEB3', tier: 1, growSols: 4, waterNeed: 2, nutrientNeed: 1, foodYield: 3, value: 5 },
  wheat: { name: 'Wheat', color: '#FFD700', tier: 1, growSols: 6, waterNeed: 3, nutrientNeed: 2, foodYield: 4, value: 7 },
  corn: { name: 'Corn', color: '#FFC700', tier: 2, growSols: 8, waterNeed: 4, nutrientNeed: 3, foodYield: 5, value: 10 },
  soybean: { name: 'Soybean', color: '#8B7355', tier: 2, growSols: 5, waterNeed: 2, nutrientNeed: 4, foodYield: 3, value: 8 },
  rice: { name: 'Rice', color: '#D4A574', tier: 2, growSols: 7, waterNeed: 5, nutrientNeed: 2, foodYield: 6, value: 12 },
}

export const UPGRADE_DEFS: Record<UpgradeId, { name: string; baseCost: number; powerDraw: number; description: string }> = {
  solar_panel: { name: 'Solar Panel', baseCost: 50, powerDraw: 0, description: 'Generates 10 power' },
  bot_mk1: { name: 'Bot Mk1', baseCost: 100, powerDraw: 5, description: 'Automates tending' },
  bot_mk2: { name: 'Bot Mk2', baseCost: 200, powerDraw: 8, description: 'Advanced automation' },
  water_recycler: { name: 'Water Recycler', baseCost: 150, powerDraw: 3, description: 'Reduces water consumption' },
  forcefield: { name: 'Forcefield', baseCost: 300, powerDraw: 10, description: 'Protects domes' },
  research_lab: { name: 'Research Lab', baseCost: 250, powerDraw: 6, description: 'Generates research' },
  dome: { name: 'Dome', baseCost: 500, powerDraw: 0, description: 'Expands colony' },
  trade_rocket: { name: 'Trade Rocket', baseCost: 1000, powerDraw: 0, description: 'Enables trade' },
}

export function createInitialState(): GameState {
  const domes: Dome[] = [
    { id: 'dome1', name: 'Dome 1', hasForceField: false, forcefieldIntegrity: 0, plots: [] },
    { id: 'dome2', name: 'Dome 2', hasForceField: false, forcefieldIntegrity: 0, plots: [] },
  ]
  const plots: Record<string, CropPlot> = {}
  domes.forEach(dome => {
    for (let i = 0; i < 10; i++) {
      const id = `${dome.id}-plot${i}`
      plots[id] = {
        id,
        domeId: dome.id,
        stage: 'empty',
        cropType: null,
        blighted: false,
        tendedThisSol: false,
        solPlanted: 0,
        waterLevel: 100,
        nutrientLevel: 100,
      }
      dome.plots.push(id)
    }
  })
  return {
    sol: 1,
    colonists: { count: 5, productivity: 1.0, productivityBonus: 0, foodDeficitTier: 0 },
    resources: { food: 50, water: 200, nutrients: 100, credits: 1000, power: 0, powerUsed: 0, research: 0 },
    rates: { foodPerSol: -6, waterConsumedPerSol: 40, powerGenerated: 0, powerConsumed: 0, researchPerSol: 0, creditsPerSol: 0 },
    plots,
    domes,
    upgrades: {
      solar_panel: { count: 0, broken: 0 },
      bot_mk1: { count: 0, broken: 0 },
      bot_mk2: { count: 0, broken: 0 },
      water_recycler: { count: 0, broken: 0 },
      forcefield: { count: 0, broken: 0 },
      research_lab: { count: 0, broken: 0 },
      dome: { count: 2, broken: 0 },
      trade_rocket: { count: 0, broken: 0 },
    },
    eventLog: [],
    activeEvents: [],
    researchTier: 1,
    solTimer: 0,
    paused: false,
    solDuration: 2,
    tradeRocketUnlocked: false,
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem('marsColonyGameState', JSON.stringify(state))
}

export function loadGame(): GameState | null {
  const saved = localStorage.getItem('marsColonyGameState')
  return saved ? JSON.parse(saved) : null
}