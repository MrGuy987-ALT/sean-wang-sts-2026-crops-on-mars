// Developer Console - Exposes debug commands to window.dev
import { useGameStore } from './game/GameLoop'

export function initDevConsole() {
  const dev = {
    setMoney: (amount: number) => {
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, credits: amount }
        }
      }))
      console.log(`Credits set to ${amount}`)
    },

    setDay: (day: number) => {
      useGameStore.setState(s => ({
        state: { ...s.state, sol: day }
      }))
      console.log(`Sol set to ${day}`)
    },

    setWater: (amount: number) => {
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, water: amount }
        }
      }))
      console.log(`Water set to ${amount}`)
    },

    setFood: (amount: number) => {
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, food: amount }
        }
      }))
      console.log(`Food set to ${amount}`)
    },

    setPower: (amount: number) => {
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, power: amount }
        }
      }))
      console.log(`Power generation set to ${amount}`)
    },

    setResearch: (amount: number) => {
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, research: amount }
        }
      }))
      console.log(`Research set to ${amount}`)
    },

    setColonists: (count: number) => {
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          colonists: { ...s.state.colonists, count }
        }
      }))
      console.log(`Colonists set to ${count}`)
    },

    getState: () => {
      return useGameStore.getState().state
    },

    help: () => {
      console.log(`
Dev Console Commands:
  dev.setMoney(amount)      - Set credits
  dev.setDay(day)           - Set current sol
  dev.setWater(amount)      - Set water
  dev.setFood(amount)       - Set food
  dev.setPower(amount)      - Set power generation
  dev.setResearch(amount)   - Set research points
  dev.setColonists(count)   - Set colonist count
  dev.getState()            - Get current game state
  dev.help()                - Show this help
      `)
    }
  }

  ;(window as any).dev = dev
  console.log('Dev console ready! Type: dev.help()')
  console.warn('Using excessive numbers may cause the game to break. Use with caution. ')
}
