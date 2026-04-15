// Developer Console - Exposes debug commands to window.dev
import { useGameStore } from './game/GameLoop'

const DEV_PASSWORD = 'mars2026'

let isUnlocked = false

function promptAuth() {
  const input = prompt('Enter dev password:')
  if (input === DEV_PASSWORD) {
    isUnlocked = true
    console.log('Dev console unlocked')
  } else {
    console.error('Access denied')
  }
}

export function initDevConsole() {
  // Hard gate
  if (!isUnlocked) {
    console.warn('Dev console locked. Run dev.unlock() first.')
  }

  const dev = {
    unlock: () => {
      promptAuth()
    },

    setMoney: (amount: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, credits: amount }
        }
      }))
      console.log(`Credits set to ${amount}`)
    },

    setDay: (day: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: { ...s.state, sol: day }
      }))
      console.log(`Sol set to ${day}`)
    },

    setWater: (amount: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, water: amount }
        }
      }))
      console.log(`Water set to ${amount}`)
    },

    setFood: (amount: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, food: amount }
        }
      }))
      console.log(`Food set to ${amount}`)
    },

    setPower: (amount: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, power: amount }
        }
      }))
      console.log(`Power generation set to ${amount}`)
    },

    setResearch: (amount: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          resources: { ...s.state.resources, research: amount }
        }
      }))
      console.log(`Research set to ${amount}`)
    },

    setColonists: (count: number) => {
      if (!isUnlocked) return console.warn('Locked')
      useGameStore.setState(s => ({
        state: {
          ...s.state,
          colonists: { ...s.state.colonists, count }
        }
      }))
      console.log(`Colonists set to ${count}`)
    },

    getState: () => {
      if (!isUnlocked) return console.warn('Locked')
      return useGameStore.getState().state
    },

    help: () => {
      console.log(`
Dev Console Commands:
  dev.unlock()              - Unlock dev tools
  dev.setMoney(amount)
  dev.setDay(day)
  dev.setWater(amount)
  dev.setFood(amount)
  dev.setPower(amount)
  dev.setResearch(amount)
  dev.setColonists(count)
  dev.getState()
  dev.help()
      `)
    }
  }

  ;(window as any).dev = dev

  console.log('Dev console loaded. Run dev.help()')
}