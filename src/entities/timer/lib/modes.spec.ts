import { describe, it, expect } from 'vitest'
import { MODES, type ModeKey } from './modes'

const ALL_KEYS: ModeKey[] = ['pomodoro-25', 'pomodoro-50', 'break-5', 'break-10', 'break-30', 'custom', 'free']

describe('MODES', () => {
  it('contém exatamente os 7 modos esperados', () => {
    expect(Object.keys(MODES)).toEqual(ALL_KEYS)
  })

  it('cada modo tem as propriedades obrigatórias', () => {
    for (const key of ALL_KEYS) {
      const mode = MODES[key]
      expect(mode, `modo ${key} deve existir`).toBeDefined()
      expect(typeof mode.label).toBe('string')
      expect(typeof mode.tipo).toBe('string')
      expect(typeof mode.isBreak).toBe('boolean')
    }
  })

  describe('modos Pomodoro', () => {
    it('pomodoro-25 tem 25 minutos e não é pausa', () => {
      expect(MODES['pomodoro-25'].seconds).toBe(25 * 60)
      expect(MODES['pomodoro-25'].tipo).toBe('Pomodoro')
      expect(MODES['pomodoro-25'].isBreak).toBe(false)
    })

    it('pomodoro-50 tem 50 minutos e não é pausa', () => {
      expect(MODES['pomodoro-50'].seconds).toBe(50 * 60)
      expect(MODES['pomodoro-50'].tipo).toBe('Pomodoro')
      expect(MODES['pomodoro-50'].isBreak).toBe(false)
    })
  })

  describe('modos Pausa', () => {
    it('break-5 tem 5 minutos e é pausa', () => {
      expect(MODES['break-5'].seconds).toBe(5 * 60)
      expect(MODES['break-5'].tipo).toBe('Pausa')
      expect(MODES['break-5'].isBreak).toBe(true)
    })

    it('break-10 tem 10 minutos e é pausa', () => {
      expect(MODES['break-10'].seconds).toBe(10 * 60)
      expect(MODES['break-10'].isBreak).toBe(true)
    })

    it('break-30 tem 30 minutos e é pausa', () => {
      expect(MODES['break-30'].seconds).toBe(30 * 60)
      expect(MODES['break-30'].isBreak).toBe(true)
    })
  })

  describe('modo custom', () => {
    it('tem segundos padrão de 25 min e não é pausa', () => {
      expect(MODES['custom'].seconds).toBe(25 * 60)
      expect(MODES['custom'].tipo).toBe('Pomodoro')
      expect(MODES['custom'].isBreak).toBe(false)
    })
  })

  describe('modo free', () => {
    it('tem seconds null (sem limite de tempo)', () => {
      expect(MODES['free'].seconds).toBeNull()
    })

    it('tem tipo Livre e não é pausa', () => {
      expect(MODES['free'].tipo).toBe('Livre')
      expect(MODES['free'].isBreak).toBe(false)
    })
  })
})
