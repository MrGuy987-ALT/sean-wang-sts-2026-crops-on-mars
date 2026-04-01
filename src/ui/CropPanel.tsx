import { useState } from 'react'
import { useGameStore } from '../game/GameLoop'
import { CROP_DEFS, type CropType, type CropPlot } from '../game/GameState'

const STAGE_COLORS: Record<string, string> = {
  empty: 'rgba(255,255,255,0.04)',
  seeded: '#3d2a1a',
  growing: '#2d4a1a',
  ready: '#1a3a0a',
}

const STAGE_LABELS: Record<string, string> = {
  empty: 'EMPTY', seeded: 'SEEDED', growing: 'GROWING', ready: '✦ READY',
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
    </div>
  )
}

function actionBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${color}40`, borderRadius: 5, padding: '6px 0',
    color, fontFamily: 'var(--font-pixel)', fontSize: 9, cursor: 'pointer',
    letterSpacing: 1, width: '100%', transition: 'all 0.15s',
  }
}

function PlotCard({ plot }: { plot: CropPlot }) {
  const [picking, setPicking] = useState(false)
  const plant = useGameStore(s => s.plant)
  const tend = useGameStore(s => s.tend)
  const harvest = useGameStore(s => s.harvest)
  const clearBlight = useGameStore(s => s.clearBlight)
  const researchTier = useGameStore(s => s.state.researchTier)
  const def = plot.cropType ? CROP_DEFS[plot.cropType] : null
  const isReady = plot.stage === 'ready'
  const canTend = plot.stage !== 'empty' && plot.stage !== 'ready' && !plot.tendedThisSol

  if (picking) {
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1, marginBottom: 4 }}>PLANT CROP</div>
        {(Object.entries(CROP_DEFS) as [CropType, typeof CROP_DEFS[CropType]][]).map(([id, c]) => (
          <button key={id} disabled={c.tier > researchTier} onClick={() => { plant(plot.id, id); setPicking(false) }} style={{
            background: c.tier > researchTier ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${c.tier > researchTier ? 'rgba(255,255,255,0.05)' : c.color + '60'}`,
            borderRadius: 5, padding: '5px 8px', cursor: c.tier > researchTier ? 'not-allowed' : 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: c.tier > researchTier ? 'var(--text-dim)' : 'var(--text)',
            fontSize: 11, fontFamily: 'var(--font-pixel)', opacity: c.tier > researchTier ? 0.4 : 1,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: c.color, borderRadius: 2, display: 'inline-block' }} />
              {c.name}
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>{c.tier > researchTier ? '🔒 T2' : `${c.growSols}sol`}</span>
          </button>
        ))}
        <button onClick={() => setPicking(false)} style={{ fontSize: 9, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--font-pixel)', marginTop: 4 }}>
          CANCEL
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: plot.blighted ? 'rgba(120,30,30,0.4)' : STAGE_COLORS[plot.stage],
      border: `1px solid ${plot.blighted ? 'rgba(220,50,50,0.5)' : isReady ? 'rgba(74,122,42,0.6)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 0.3s',
      boxShadow: isReady ? '0 0 12px rgba(74,122,42,0.3)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {def && <span style={{ width: 8, height: 8, background: def.color, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />}
          <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: isReady ? 'var(--green)' : 'var(--text)', letterSpacing: 0.5 }}>
            {def ? def.name : '—'}
          </span>
        </div>
        <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', letterSpacing: 1, color: isReady ? 'var(--green)' : plot.stage === 'empty' ? 'var(--text-dim)' : 'var(--amber)' }}>
          {plot.blighted ? '☠ BLIGHT' : STAGE_LABELS[plot.stage]}
        </span>
      </div>

      {plot.stage !== 'empty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)' }}>
            <span>H₂O</span><span>{Math.round(plot.waterLevel)}%</span>
          </div>
          <MiniBar value={plot.waterLevel} color="#4a9acc" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)' }}>
            <span>NPK</span><span>{Math.round(plot.nutrientLevel)}%</span>
          </div>
          <MiniBar value={plot.nutrientLevel} color="#8a6a2a" />
        </div>
      )}

      {plot.tendedThisSol && plot.stage !== 'ready' && (
        <div style={{ fontSize: 8, color: 'var(--green)', fontFamily: 'var(--font-pixel)', textAlign: 'center' }}>✓ TENDED</div>
      )}

      {plot.blighted ? (
        <button onClick={() => clearBlight(plot.id)} style={actionBtnStyle('#8a1a1a', '#f87171')}>TREAT (150₹)</button>
      ) : isReady ? (
        <button onClick={() => harvest(plot.id)} style={actionBtnStyle('#2a4a1a', 'var(--green)')}>HARVEST</button>
      ) : plot.stage === 'empty' ? (
        <button onClick={() => setPicking(true)} style={actionBtnStyle('rgba(255,255,255,0.05)', 'var(--text-dim)')}>+ PLANT</button>
      ) : canTend ? (
        <button onClick={() => tend(plot.id)} style={actionBtnStyle('#2a3a1a', 'var(--amber)')}>TEND</button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)' }}>WAIT...</div>
      )}
    </div>
  )
}

export function CropPanel() {
  const { domes, plots } = useGameStore(s => s.state)
  return (
    <div style={{ padding: '20px 20px 0' }}>
      {domes.map(dome => (
        <div key={dome.id} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontSize: 11, fontFamily: 'var(--font-pixel)', letterSpacing: 2, color: 'var(--text)', margin: 0 }}>{dome.name}</h2>
            {dome.hasForceField && (
              <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', letterSpacing: 1, color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 4, padding: '2px 6px' }}>
                ⬡ SHIELD {dome.forcefieldIntegrity}%
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {dome.plots.map(plotId => <PlotCard key={plotId} plot={plots[plotId]} />)}
          </div>
        </div>
      ))}
    </div>
  )
}