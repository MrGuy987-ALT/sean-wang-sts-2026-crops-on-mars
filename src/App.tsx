import { useEffect, useRef } from 'react'
import { useGameStore } from './game/GameLoop'
import { HUD } from './ui/HUD'
import { CropPanel } from './ui/CropPanel'
import { EventLog } from './ui/EventLog'
import { UpgradeShop } from './ui/UpgradeShop'
import { TradePanel } from './ui/TradePanel'

function GameTicker() {
  const tick = useGameStore(s => s.tick)
  const lastRef = useRef<number>(performance.now())

  useEffect(() => {
    let animId: number
    function loop(now: number) {
      const delta = (now - lastRef.current) / 1000
      lastRef.current = now
      tick(delta)
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [tick])

  return null
}

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <GameTicker />
      <HUD />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        flex: 1,
        minHeight: 0,
      }}>
        <div style={{ overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <CropPanel />
          <div style={{ height: 40 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '0.8fr 0.6fr 1fr', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', minHeight: 0 }}>
            <UpgradeShop />
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', minHeight: 0 }}>
            <TradePanel />
          </div>
          <div style={{ overflowY: 'auto', minHeight: 0 }}>
            <EventLog />
          </div>
        </div>
      </div>
    </div>
  )
}