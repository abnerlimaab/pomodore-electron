import { describe, it, expect, beforeEach } from 'vitest'
import { useUiSettingsStore } from './uiSettingsStore'

beforeEach(() => {
  useUiSettingsStore.setState({ colorScheme: 'dark', palette: 'violeta', railExpanded: false })
})

describe('estado inicial', () => {
  it('colorScheme começa como dark', () => {
    expect(useUiSettingsStore.getState().colorScheme).toBe('dark')
  })

  it('palette começa como violeta', () => {
    expect(useUiSettingsStore.getState().palette).toBe('violeta')
  })

  it('railExpanded começa como false', () => {
    expect(useUiSettingsStore.getState().railExpanded).toBe(false)
  })
})

describe('setColorScheme', () => {
  it('muda para light', () => {
    useUiSettingsStore.getState().setColorScheme('light')
    expect(useUiSettingsStore.getState().colorScheme).toBe('light')
  })

  it('muda de volta para dark', () => {
    useUiSettingsStore.setState({ colorScheme: 'light' })
    useUiSettingsStore.getState().setColorScheme('dark')
    expect(useUiSettingsStore.getState().colorScheme).toBe('dark')
  })
})

describe('setPalette', () => {
  it('atualiza a paleta de cores', () => {
    useUiSettingsStore.getState().setPalette('azul')
    expect(useUiSettingsStore.getState().palette).toBe('azul')
  })

  it('aceita qualquer string como paleta', () => {
    useUiSettingsStore.getState().setPalette('custom-palette-123')
    expect(useUiSettingsStore.getState().palette).toBe('custom-palette-123')
  })
})

describe('toggleRail', () => {
  it('abre o rail quando está fechado', () => {
    useUiSettingsStore.getState().toggleRail()
    expect(useUiSettingsStore.getState().railExpanded).toBe(true)
  })

  it('fecha o rail quando está aberto', () => {
    useUiSettingsStore.setState({ railExpanded: true })
    useUiSettingsStore.getState().toggleRail()
    expect(useUiSettingsStore.getState().railExpanded).toBe(false)
  })

  it('alterna corretamente em chamadas múltiplas', () => {
    useUiSettingsStore.getState().toggleRail()
    useUiSettingsStore.getState().toggleRail()
    useUiSettingsStore.getState().toggleRail()
    expect(useUiSettingsStore.getState().railExpanded).toBe(true)
  })
})
