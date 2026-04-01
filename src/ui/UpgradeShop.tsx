import { useGameStore } from '../game/GameLoop'
import { UPGRADE_DEFS, type UpgradeId } from '../game/GameState'

const UPGRADE_ORDER: UpgradeId[] = ['solar_panel','bot_mk1','water_recycler','dome','forcefield','research_lab','trade_rocket','bot_mk2']
const UPGRADE_ICONS: Record<UpgradeId, string> = {
  solar_panel: '☀', bot_mk1: '🤖', bot_mk2: '🤖', water_recycler: '♻',
  dome: '⬡', forcefield: '⬡', research_lab: '🔬', trade_rocket: '🚀',
}

export function UpgradeShop() {
  const { upgrades, resources, researchTier, domes } = useGameStore(s => s.state)
  const buyUpgrade = useGameStore(s => s.buyUpgrade)
  const repairUpgrade = useGameStore(s => s.repairUpgrade)

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1, marginBottom: 4 }}>UPGRADES & TECH</div>
      {UPGRADE_ORDER.map(id => {
        const upg = upgrades[id]
        const def = UPGRADE_DEFS[id]
        const cost = Math.floor(def.baseCost * Math.pow(1.5, upg.count))
        const canAfford = resources.credits >= cost
        const locked = id === 'bot_mk2' && researchTier < 2
        const repairCost = Math.floor(def.baseCost * 0.4)
        const hasBroken = upg.broken > 0
        if (id === 'dome' && domes.length >= 4) return null
        if (id === 'forcefield' && domes.filter(d => !d.hasForceField).length === 0 && upg.count > 0) return null

        return (
          <div key={id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${hasBroken ? 'rgba(220,60,60,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '10px 12px', opacity: locked ? 0.4 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13 }}>{UPGRADE_ICONS[id]}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--text)', letterSpacing: 0.5 }}>{def.name}</span>
                  {upg.count > 0 && <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', background: 'rgba(255,255,255,0.1)', borderRadius: 3, padding: '1px 5px', color: 'var(--text-dim)' }}>x{upg.count}</span>}
                  {hasBroken && <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', background: 'rgba(220,60,60,0.2)', borderRadius: 3, padding: '1px 5px', color: '#f87171' }}>{upg.broken} BROKEN</span>}
                  {locked && <span style={{ fontSize: 8, color: 'var(--purple)', fontFamily: 'var(--font-pixel)' }}>🔒 T2</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.4 }}>{def.description}</div>
                {def.powerDraw > 0 && <div style={{ fontSize: 9, color: '#f97316', marginTop: 2, fontFamily: 'var(--font-pixel)' }}>⚡ -{def.powerDraw}kW</div>}
                {def.powerDraw < 0 && <div style={{ fontSize: 9, color: 'var(--green)', marginTop: 2, fontFamily: 'var(--font-pixel)' }}>⚡ +{Math.abs(def.powerDraw)}kW</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                <button disabled={!canAfford || locked} onClick={() => buyUpgrade(id)} style={{
                  background: canAfford && !locked ? 'rgba(255,210,100,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${canAfford && !locked ? 'rgba(255,210,100,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 5, padding: '5px 10px',
                  color: canAfford && !locked ? 'var(--amber)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-pixel)', fontSize: 9, cursor: canAfford && !locked ? 'pointer' : 'not-allowed',
                  letterSpacing: 0.5, whiteSpace: 'nowrap',
                }}>
                  BUY {cost.toLocaleString()}₹
                </button>
                {hasBroken && (
                  <button disabled={resources.credits < repairCost} onClick={() => repairUpgrade(id)} style={{
                    background: 'rgba(220,60,60,0.15)', border: '1px solid rgba(220,60,60,0.4)',
                    borderRadius: 5, padding: '5px 10px', color: '#f87171',
                    fontFamily: 'var(--font-pixel)', fontSize: 9,
                    cursor: resources.credits >= repairCost ? 'pointer' : 'not-allowed',
                    letterSpacing: 0.5, whiteSpace: 'nowrap', opacity: resources.credits >= repairCost ? 1 : 0.5,
                  }}>
                    REPAIR {repairCost.toLocaleString()}₹
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}