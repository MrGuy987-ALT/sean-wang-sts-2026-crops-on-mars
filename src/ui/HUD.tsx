import { useGameStore } from '../game/GameLoop'
import { FOOD_PER_COLONIST_PER_SOL } from '../GameState'

function SolProgress() {
  const { solTimer, solDuration, paused } = useGameStore(s => s.state)
  const pct = Math.min(100, (solTimer / solDuration) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-pixel)', letterSpacing: 1 }}>
        {paused ? '⏸ PAUSED' : '▶ RUNNING'}
      </span>
      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--amber)', transition: 'width 0.5s linear', borderRadius: 3 }} />
      </div>
    </div>
  )
}

function ResourcePill({ icon, label, value, subtext, color = 'var(--text)', alert }: {
  icon: string; label: string; value: string; subtext?: string; color?: string; alert?: boolean
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: alert ? 'rgba(220,60,60,0.15)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${alert ? 'rgba(220,60,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 6, padding: '6px 12px', minWidth: 80, transition: 'all 0.3s',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1 }}>{icon} {label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: alert ? '#f87171' : color, fontFamily: 'var(--font-pixel)', marginTop: 2 }}>{value}</div>
      {subtext && <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>{subtext}</div>}
    </div>
  )
}

export function HUD() {
  const { sol, resources, rates, colonists, paused, upgrades } = useGameStore(s => s.state)
  const togglePause = useGameStore(s => s.togglePause)
  const newGame = useGameStore(s => s.newGame)
  const solsOfFood = resources.food / (colonists.count * FOOD_PER_COLONIST_PER_SOL || 1)
  const foodAlert = solsOfFood < 5
  const powerAlert = rates.powerConsumed > rates.powerGenerated
  const prodPct = Math.round(colonists.productivity * 100)
  const brokenItems = Object.values(upgrades).filter(u => u.broken > 0).length

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--surface)', borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', marginRight: 8 }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 2 }}>MARS SOL</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-pixel)', lineHeight: 1 }}>
          {sol.toString().padStart(3, '0')}
        </div>
        <SolProgress />
      </div>

      <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <ResourcePill icon="🌾" label="FOOD" value={`${Math.floor(resources.food)}kg`} subtext={`${solsOfFood.toFixed(1)} sols left`} alert={foodAlert} />
        <ResourcePill icon="💧" label="WATER" value={`${Math.floor(resources.water)}L`} subtext={`-${rates.waterConsumedPerSol}/sol`} />
        <ResourcePill icon="⚡" label="POWER" value={`${rates.powerGenerated}kW`} subtext={`${rates.powerConsumed}kW used`} alert={powerAlert} color={powerAlert ? '#f87171' : 'var(--green)'} />
        <ResourcePill icon="₹" label="CREDITS" value={Math.floor(resources.credits).toLocaleString()} />
        <ResourcePill icon="🔬" label="RESEARCH" value={`${Math.floor(resources.research)}`} subtext={`+${rates.researchPerSol}/sol`} color="var(--purple)" />
      </div>

      <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: colonists.foodDeficitTier > 0 ? 'rgba(220,60,60,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${colonists.foodDeficitTier > 0 ? 'rgba(220,60,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 6, padding: '6px 12px',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1 }}>👤 COLONY</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-pixel)', marginTop: 2 }}>{colonists.count} colonists</div>
        <div style={{ fontSize: 9, color: prodPct < 100 ? '#f87171' : 'var(--green)', marginTop: 1 }}>{prodPct}% productivity</div>
      </div>

      {brokenItems > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
          borderRadius: 6, padding: '6px 12px', animation: 'blink 1.5s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: '#f87171', letterSpacing: 1 }}>MALFUNCTION</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{brokenItems} item{brokenItems !== 1 ? 's' : ''} need repair</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={togglePause} style={{
          background: paused ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 14px',
          color: paused ? '#000' : 'var(--text)', fontFamily: 'var(--font-pixel)', fontSize: 10,
          cursor: 'pointer', letterSpacing: 1, transition: 'all 0.2s',
        }}>
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
        <button onClick={() => { if (confirm('Start a new colony? All progress will be lost.')) newGame() }} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, padding: '6px 14px', color: 'var(--text-dim)',
          fontFamily: 'var(--font-pixel)', fontSize: 10, cursor: 'pointer', letterSpacing: 1,
        }}>
          NEW COLONY
        </button>
      </div>
    </header>
  )
}