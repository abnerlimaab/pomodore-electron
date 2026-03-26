import { describe, it, expect } from 'vitest'
import { formatTime, formatTimeForTray } from './formatTime'

describe('formatTime', () => {
  it('retorna 00:00 para null', () => {
    expect(formatTime(null)).toBe('00:00')
  })

  it('retorna 00:00 para undefined', () => {
    expect(formatTime(undefined)).toBe('00:00')
  })

  it('retorna 00:00 para zero segundos', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formata segundos sem minutos', () => {
    expect(formatTime(9)).toBe('00:09')
    expect(formatTime(59)).toBe('00:59')
  })

  it('formata minutos e segundos', () => {
    expect(formatTime(60)).toBe('01:00')
    expect(formatTime(90)).toBe('01:30')
    expect(formatTime(25 * 60)).toBe('25:00')
  })

  it('não inclui horas quando total < 1h', () => {
    expect(formatTime(3599)).toBe('59:59')
  })

  it('inclui horas quando total >= 1h', () => {
    expect(formatTime(3600)).toBe('01:00:00')
    expect(formatTime(3661)).toBe('01:01:01')
    expect(formatTime(7384)).toBe('02:03:04')
  })

  it('formata horas com padding', () => {
    expect(formatTime(36000)).toBe('10:00:00')
  })
})

describe('formatTimeForTray', () => {
  it('retorna --:-- para null', () => {
    expect(formatTimeForTray(null)).toBe('--:--')
  })

  it('retorna --:-- para undefined', () => {
    expect(formatTimeForTray(undefined)).toBe('--:--')
  })

  it('retorna 00:00 para zero segundos', () => {
    expect(formatTimeForTray(0)).toBe('00:00')
  })

  it('formata segundos sem minutos', () => {
    expect(formatTimeForTray(9)).toBe('00:09')
    expect(formatTimeForTray(59)).toBe('00:59')
  })

  it('formata minutos e segundos', () => {
    expect(formatTimeForTray(60)).toBe('01:00')
    expect(formatTimeForTray(25 * 60)).toBe('25:00')
  })

  it('ignora horas e continua no formato MM:SS mesmo acima de 1h', () => {
    // Tray sempre exibe MM:SS — sem a segmentação de horas
    expect(formatTimeForTray(3600)).toBe('60:00')
    expect(formatTimeForTray(3661)).toBe('61:01')
  })
})
