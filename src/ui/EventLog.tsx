import { useGameStore } from '../game/GameLoop'
import type { LogEntry } from '../game/GameState'

const LOG_COLORS: Record<LogEntry['type'], string> = { info: 'var(--text-dim)', warning: 'var(--amber)', danger: '#f87171', success: 'var(--green)' }
const LOG_PREFIX: Record<LogEntry['type'], string> = { info: '·', warning: '▲', danger: '✕', success: '✓' }

export function EventLog() {
  const eventLog = useGameStore(s => s.state.eventLog)
  const activeEvents = useGameStore(s => s.state.activeEvents)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {activeEvents.length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1, marginBottom: 6 }}>ACTIVE EVENTS</div>
          {activeEvents.map(ev => (
            <div key={ev.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: ev.severity === 'high' ? 'rgba(220,60,60,0.15)' : 'rgba(239,168,68,0.1)',
              border: `1px solid ${ev.severity === 'high' ? 'rgba(220,60,60,0.3)' : 'rgba(239,168,68,0.3)'}`,
              borderRadius: 5, padding: '5px 8px', marginBottom: 4,
            }}>
              <span style={{ fontSize: 10, color: ev.severity === 'high' ? '#f87171' : 'var(--amber)', fontFamily: 'var(--font-pixel)' }}>{ev.description}</span>
              <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)' }}>{ev.solsRemaining}s left</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1 }}>MISSION LOG</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {eventLog.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11, lineHeight: 1.4 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-pixel)', whiteSpace: 'nowrap', flexShrink: 0 }}>S{entry.sol.toString().padStart(3, '0')}</span>
            <span style={{ color: LOG_COLORS[entry.type], fontSize: 9, fontFamily: 'var(--font-pixel)', flexShrink: 0 }}>{LOG_PREFIX[entry.type]}</span>
            <span style={{ color: LOG_COLORS[entry.type], fontSize: 11 }}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}