import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateTray } from './tray'
import { ipcInvoke } from '../../../test/mocks/ipc'

beforeEach(() => {
  Object.defineProperty(window, '__ipc', {
    value: { invoke: ipcInvoke },
    writable: true,
    configurable: true,
  })
  ipcInvoke.mockResolvedValue({ data: null })
})

describe('updateTray', () => {
  it('invoca tray.updateTime com timeText e isRunning corretos', async () => {
    await updateTray(25 * 60, true, 'Pomodoro 25')

    expect(ipcInvoke).toHaveBeenCalledWith(
      'tray.updateTime',
      { timeText: 'Pomodoro 25 - 25:00', isRunning: true },
    )
  })

  it('passa isRunning=false quando timer está pausado', async () => {
    await updateTray(300, false, 'Pausa 5')

    expect(ipcInvoke).toHaveBeenCalledWith(
      'tray.updateTime',
      { timeText: 'Pausa 5 - 05:00', isRunning: false },
    )
  })

  it('usa "Timer" como fallback quando modeName é vazio', async () => {
    await updateTray(60, false, '')

    const [, payload] = ipcInvoke.mock.calls[0] as [string, { timeText: string }]
    expect(payload.timeText).toBe('Timer - 01:00')
  })

  it('formata timeLeft null como --:-- no texto do tray', async () => {
    await updateTray(null, false, 'Livre')

    const [, payload] = ipcInvoke.mock.calls[0] as [string, { timeText: string }]
    expect(payload.timeText).toBe('Livre - --:--')
  })

  it('retorna early sem chamar IPC quando window.__ipc está ausente', async () => {
    Object.defineProperty(window, '__ipc', { value: undefined, writable: true, configurable: true })

    await updateTray(60, true, 'Pomodoro 25')

    expect(ipcInvoke).not.toHaveBeenCalled()
  })

  it('não lança exceção quando IPC rejeita (engole o erro)', async () => {
    ipcInvoke.mockRejectedValueOnce(new Error('IPC error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(updateTray(60, true, 'Pomodoro 25')).resolves.toBeUndefined()

    consoleSpy.mockRestore()
  })

  it('loga o erro no console quando IPC falha', async () => {
    const error = new Error('conexão perdida')
    ipcInvoke.mockRejectedValueOnce(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await updateTray(60, true, 'Pomodoro 25')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update tray:', error)
    consoleSpy.mockRestore()
  })
})
