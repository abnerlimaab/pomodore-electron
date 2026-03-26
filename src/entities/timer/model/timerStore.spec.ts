import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTimerStore } from './timerStore'
import { MODES } from '../lib/modes'

const INITIAL_STATE = {
  currentMode: 'pomodoro-25' as const,
  customSeconds: 25 * 60,
  timeLeft: 25 * 60,
  isRunning: false,
  isPaused: false,
  currentSessionId: null,
  currentSessionStart: null,
  freeElapsed: 0,
  timerStartedAt: null,
  timeLeftAtStart: 0,
  freeElapsedBase: 0,
}

beforeEach(() => {
  useTimerStore.setState(INITIAL_STATE)
})

describe('estado inicial', () => {
  it('começa no modo pomodoro-25', () => {
    expect(useTimerStore.getState().currentMode).toBe('pomodoro-25')
  })

  it('timeLeft começa com 25 minutos', () => {
    expect(useTimerStore.getState().timeLeft).toBe(25 * 60)
  })

  it('timer começa parado e sem sessão', () => {
    const { isRunning, isPaused, currentSessionId } = useTimerStore.getState()
    expect(isRunning).toBe(false)
    expect(isPaused).toBe(false)
    expect(currentSessionId).toBeNull()
  })
})

describe('setMode', () => {
  it('troca para outro modo e atualiza timeLeft', () => {
    useTimerStore.getState().setMode('pomodoro-50')
    const { currentMode, timeLeft } = useTimerStore.getState()
    expect(currentMode).toBe('pomodoro-50')
    expect(timeLeft).toBe(50 * 60)
  })

  it('troca para modo pausa e define timeLeft correto', () => {
    useTimerStore.getState().setMode('break-5')
    expect(useTimerStore.getState().timeLeft).toBe(5 * 60)
  })

  it('modo custom usa customSeconds em vez dos segundos padrão do modo', () => {
    useTimerStore.setState({ customSeconds: 40 * 60 })
    useTimerStore.getState().setMode('custom')
    expect(useTimerStore.getState().timeLeft).toBe(40 * 60)
  })

  it('modo free define timeLeft como 25*60 (fallback de seconds null)', () => {
    useTimerStore.getState().setMode('free')
    expect(useTimerStore.getState().timeLeft).toBe(25 * 60)
  })

  it('reseta isRunning, isPaused e currentSessionId ao trocar modo', () => {
    useTimerStore.setState({ isRunning: true, isPaused: true, currentSessionId: 42 })
    useTimerStore.getState().setMode('break-10')
    const { isRunning, isPaused, currentSessionId } = useTimerStore.getState()
    expect(isRunning).toBe(false)
    expect(isPaused).toBe(false)
    expect(currentSessionId).toBeNull()
  })

  it('ignora modo inválido sem alterar estado', () => {
    // @ts-expect-error testando modo inválido
    useTimerStore.getState().setMode('modo-invalido')
    expect(useTimerStore.getState().currentMode).toBe('pomodoro-25')
  })
})

describe('setCustomSeconds', () => {
  it('atualiza customSeconds e timeLeft simultaneamente', () => {
    useTimerStore.getState().setCustomSeconds(45 * 60)
    const { customSeconds, timeLeft } = useTimerStore.getState()
    expect(customSeconds).toBe(45 * 60)
    expect(timeLeft).toBe(45 * 60)
  })
})

describe('getModeData', () => {
  it('retorna os dados do modo atual', () => {
    const data = useTimerStore.getState().getModeData()
    expect(data).toEqual(MODES['pomodoro-25'])
  })

  it('para modo custom retorna seconds = customSeconds', () => {
    useTimerStore.setState({ currentMode: 'custom', customSeconds: 35 * 60 })
    const data = useTimerStore.getState().getModeData()
    expect(data.seconds).toBe(35 * 60)
  })

  it('retorna pomodoro-25 como fallback para modo desconhecido', () => {
    // @ts-expect-error forçando modo inválido
    useTimerStore.setState({ currentMode: 'inexistente' })
    const data = useTimerStore.getState().getModeData()
    expect(data).toEqual(MODES['pomodoro-25'])
  })
})

describe('getModes', () => {
  it('retorna o objeto MODES completo', () => {
    expect(useTimerStore.getState().getModes()).toBe(MODES)
  })
})

describe('startSession', () => {
  it('define isRunning=true e armazena o sessionId', () => {
    useTimerStore.getState().startSession(7)
    const { isRunning, currentSessionId } = useTimerStore.getState()
    expect(isRunning).toBe(true)
    expect(currentSessionId).toBe(7)
  })

  it('aceita sessionId null (sessão livre sem ID)', () => {
    useTimerStore.getState().startSession(null)
    expect(useTimerStore.getState().currentSessionId).toBeNull()
    expect(useTimerStore.getState().isRunning).toBe(true)
  })

  it('define currentSessionStart como ISO string', () => {
    useTimerStore.getState().startSession(1)
    const start = useTimerStore.getState().currentSessionStart
    expect(start).not.toBeNull()
    expect(() => new Date(start!)).not.toThrow()
  })

  it('snapshot timerStartedAt e timeLeftAtStart', () => {
    useTimerStore.setState({ timeLeft: 600 })
    useTimerStore.getState().startSession(1)
    const { timerStartedAt, timeLeftAtStart } = useTimerStore.getState()
    expect(timerStartedAt).toBeGreaterThan(0)
    expect(timeLeftAtStart).toBe(600)
  })
})

describe('pauseSession', () => {
  it('define isRunning=false e isPaused=true', () => {
    useTimerStore.setState({ isRunning: true, timerStartedAt: Date.now(), timeLeftAtStart: 60 })
    useTimerStore.getState().pauseSession()
    const { isRunning, isPaused } = useTimerStore.getState()
    expect(isRunning).toBe(false)
    expect(isPaused).toBe(true)
  })

  it('salva o tempo restante correto para modo cronometrado', () => {
    const start = Date.now() - 10_000 // 10s atrás
    useTimerStore.setState({ isRunning: true, timerStartedAt: start, timeLeftAtStart: 60, currentMode: 'pomodoro-25' })
    useTimerStore.getState().pauseSession()
    // ceil(10) = 10, 60 - 10 = 50
    expect(useTimerStore.getState().timeLeft).toBe(50)
  })

  it('para modo free acumula freeElapsed e atualiza base', () => {
    const start = Date.now() - 5_000 // 5s atrás
    useTimerStore.setState({ currentMode: 'free', timerStartedAt: start, freeElapsedBase: 20 })
    useTimerStore.getState().pauseSession()
    const { freeElapsed, freeElapsedBase } = useTimerStore.getState()
    expect(freeElapsed).toBeGreaterThanOrEqual(25)
    expect(freeElapsedBase).toBe(freeElapsed)
  })

  it('anula timerStartedAt ao pausar', () => {
    useTimerStore.setState({ isRunning: true, timerStartedAt: Date.now(), timeLeftAtStart: 100 })
    useTimerStore.getState().pauseSession()
    expect(useTimerStore.getState().timerStartedAt).toBeNull()
  })
})

describe('resumeSession', () => {
  it('define isRunning=true e isPaused=false', () => {
    useTimerStore.setState({ isPaused: true, timeLeft: 300 })
    useTimerStore.getState().resumeSession()
    const { isRunning, isPaused } = useTimerStore.getState()
    expect(isRunning).toBe(true)
    expect(isPaused).toBe(false)
  })

  it('snapshot timerStartedAt e timeLeftAtStart a partir do timeLeft atual', () => {
    useTimerStore.setState({ isPaused: true, timeLeft: 480 })
    useTimerStore.getState().resumeSession()
    const { timerStartedAt, timeLeftAtStart } = useTimerStore.getState()
    expect(timerStartedAt).toBeGreaterThan(0)
    expect(timeLeftAtStart).toBe(480)
  })
})

describe('stopSession', () => {
  it('para o timer e limpa a sessão', () => {
    useTimerStore.setState({ isRunning: true, isPaused: false, currentSessionId: 3 })
    useTimerStore.getState().stopSession()
    const { isRunning, isPaused, currentSessionId } = useTimerStore.getState()
    expect(isRunning).toBe(false)
    expect(isPaused).toBe(false)
    expect(currentSessionId).toBeNull()
  })

  it('restaura timeLeft ao valor padrão do modo atual', () => {
    useTimerStore.setState({ currentMode: 'break-5', timeLeft: 30 })
    useTimerStore.getState().stopSession()
    expect(useTimerStore.getState().timeLeft).toBe(5 * 60)
  })

  it('para modo custom restaura timeLeft = customSeconds', () => {
    useTimerStore.setState({ currentMode: 'custom', customSeconds: 30 * 60, timeLeft: 10 })
    useTimerStore.getState().stopSession()
    expect(useTimerStore.getState().timeLeft).toBe(30 * 60)
  })
})

describe('resetTimer', () => {
  it('restaura timeLeft ao padrão do modo sem alterar o modo', () => {
    useTimerStore.setState({ currentMode: 'pomodoro-50', timeLeft: 100 })
    useTimerStore.getState().resetTimer()
    expect(useTimerStore.getState().timeLeft).toBe(50 * 60)
    expect(useTimerStore.getState().currentMode).toBe('pomodoro-50')
  })

  it('zera freeElapsed e limpa flags de sessão', () => {
    useTimerStore.setState({ freeElapsed: 999, currentSessionId: 5 })
    useTimerStore.getState().resetTimer()
    const { freeElapsed, currentSessionId } = useTimerStore.getState()
    expect(freeElapsed).toBe(0)
    expect(currentSessionId).toBeNull()
  })
})

describe('tick', () => {
  it('decrementa timeLeft com base no tempo real decorrido', () => {
    const spyNow = vi.spyOn(Date, 'now').mockReturnValue(10_000)
    useTimerStore.setState({ timerStartedAt: 0, timeLeftAtStart: 60, currentMode: 'pomodoro-25' })

    // 10 segundos decorridos
    useTimerStore.getState().tick()

    expect(useTimerStore.getState().timeLeft).toBe(50)
    spyNow.mockRestore()
  })

  it('retorna false enquanto há tempo restante', () => {
    const spyNow = vi.spyOn(Date, 'now').mockReturnValue(5_000)
    useTimerStore.setState({ timerStartedAt: 0, timeLeftAtStart: 60, currentMode: 'pomodoro-25' })

    const done = useTimerStore.getState().tick()

    expect(done).toBe(false)
    spyNow.mockRestore()
  })

  it('retorna true e para o timer quando timeLeft chega a zero', () => {
    const spyNow = vi.spyOn(Date, 'now').mockReturnValue(61_000)
    useTimerStore.setState({ timerStartedAt: 0, timeLeftAtStart: 60, currentMode: 'pomodoro-25' })

    const done = useTimerStore.getState().tick()

    expect(done).toBe(true)
    expect(useTimerStore.getState().timeLeft).toBe(0)
    expect(useTimerStore.getState().isRunning).toBe(false)
    spyNow.mockRestore()
  })

  it('não deixa timeLeft ficar negativo', () => {
    const spyNow = vi.spyOn(Date, 'now').mockReturnValue(999_000)
    useTimerStore.setState({ timerStartedAt: 0, timeLeftAtStart: 60, currentMode: 'pomodoro-25' })

    useTimerStore.getState().tick()

    expect(useTimerStore.getState().timeLeft).toBe(0)
    spyNow.mockRestore()
  })

  it('em modo free incrementa freeElapsed e retorna false', () => {
    const spyNow = vi.spyOn(Date, 'now').mockReturnValue(15_000)
    useTimerStore.setState({ currentMode: 'free', timerStartedAt: 0, freeElapsedBase: 10 })

    const done = useTimerStore.getState().tick()

    expect(done).toBe(false)
    expect(useTimerStore.getState().freeElapsed).toBe(25) // base(10) + elapsed(15)
    spyNow.mockRestore()
  })

  it('em modo free não altera timeLeft', () => {
    const spyNow = vi.spyOn(Date, 'now').mockReturnValue(10_000)
    useTimerStore.setState({ currentMode: 'free', timerStartedAt: 0, timeLeft: 999 })

    useTimerStore.getState().tick()

    expect(useTimerStore.getState().timeLeft).toBe(999)
    spyNow.mockRestore()
  })
})
