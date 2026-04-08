import { useGameStore } from '../game/GameLoop'
import { MARKET_FOOD_PRICE_PER_KG, COLONIST_RECRUIT_COST, PRODUCTIVITY_INVEST_COST, PRODUCTIVITY_MAX_BONUS, PRODUCTIVITY_STEP } from '../game/TradeSystem'

export function TradePanel() {
  const { resources, colonists } = useGameStore(s => s.state)
  const sellFood = useGameStore(s => s.sellFood)
  const recruitColonist = useGameStore(s => s.recruitColonist)
  const investProductivity = useGameStore(s => s.investProductivity)

  const currentBonus = Math.round((colonists.productivityBonus ?? 0) * 100)
  const nextBonus = Math.round(Math.min(PRODUCTIVITY_MAX_BONUS, (colonists.productivityBonus ?? 0) + PRODUCTIVITY_STEP) * 100)
  const productivityCapReached = (colonists.productivityBonus ?? 0) >= PRODUCTIVITY_MAX_BONUS

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', letterSpacing: 1, marginBottom: 4 }}>EXPORTS & TRADE</div>
      <div style={{ fontSize: 10, color: 'var(--text)', marginBottom: 6, lineHeight: 1.4, fontFamily: 'var(--font-pixel)' }}>
        Food can be sold to the Australian market at a fixed export rate. Selling food earns credits, which can then be used to recruit colonists or boost colony productivity.
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <button disabled={resources.food < 10} onClick={() => sellFood(10)} style={{
          width: '100%', background: resources.food >= 10 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px', color: 'var(--text)', cursor: resources.food >= 10 ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-pixel)', fontSize: 10,
        }}>
          Sell 10kg food for {10 * MARKET_FOOD_PRICE_PER_KG}₹
        </button>
        <button disabled={resources.food < 25} onClick={() => sellFood(25)} style={{
          width: '100%', background: resources.food >= 25 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px', color: 'var(--text)', cursor: resources.food >= 25 ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-pixel)', fontSize: 10,
        }}>
          Sell 25kg food for {25 * MARKET_FOOD_PRICE_PER_KG}₹
        </button>
        <button disabled={resources.food < 1} onClick={() => sellFood(Math.floor(resources.food))} style={{
          width: '100%', background: resources.food >= 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px', color: 'var(--text)', cursor: resources.food >= 1 ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-pixel)', fontSize: 10,
        }}>
          Sell all food ({Math.floor(resources.food)}kg) for {Math.floor(resources.food) * MARKET_FOOD_PRICE_PER_KG}₹
        </button>
      </div>

      <div style={{ marginTop: 10, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, fontFamily: 'var(--font-pixel)' }}>CURRENT FOOD STOCK</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-pixel)' }}>{Math.floor(resources.food)}kg</div>
      </div>

      <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
        <button disabled={resources.credits < COLONIST_RECRUIT_COST} onClick={recruitColonist} style={{
          width: '100%', background: resources.credits >= COLONIST_RECRUIT_COST ? 'rgba(79,153,255,0.12)' : 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(79,153,255,0.25)', borderRadius: 8, padding: '10px', color: resources.credits >= COLONIST_RECRUIT_COST ? 'var(--text)' : 'var(--text-dim)',
          cursor: resources.credits >= COLONIST_RECRUIT_COST ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-pixel)', fontSize: 10,
        }}>
          Recruit 1 colonist for {COLONIST_RECRUIT_COST}₹
        </button>
        <button disabled={resources.credits < PRODUCTIVITY_INVEST_COST || productivityCapReached} onClick={investProductivity} style={{
          width: '100%', background: resources.credits >= PRODUCTIVITY_INVEST_COST && !productivityCapReached ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(168,85,247,0.25)', borderRadius: 8, padding: '10px', color: resources.credits >= PRODUCTIVITY_INVEST_COST && !productivityCapReached ? 'var(--text)' : 'var(--text-dim)',
          cursor: resources.credits >= PRODUCTIVITY_INVEST_COST && !productivityCapReached ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-pixel)', fontSize: 10,
        }}>
          Invest {PRODUCTIVITY_INVEST_COST}₹ for +{PRODUCTIVITY_STEP * 100}% productivity ({currentBonus}% → {productivityCapReached ? currentBonus : nextBonus}%)
        </button>
      </div>
    </div>
  )
}
