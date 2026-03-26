import { describe, it, expect, beforeEach } from 'vitest'
import { useTemaStore } from './temaStore'
import type { Tema } from '@/shared/types'

function makeTema(overrides: Partial<Tema> = {}): Tema {
  return { id: 1, nome: 'Trabalho', cor_hex: '#6750A4', ...overrides }
}

beforeEach(() => {
  useTemaStore.setState({ grupos: [] })
})

describe('estado inicial', () => {
  it('começa com lista de grupos vazia', () => {
    expect(useTemaStore.getState().grupos).toEqual([])
  })
})

describe('setGrupos', () => {
  it('define a lista de temas', () => {
    const lista = [makeTema({ id: 1 }), makeTema({ id: 2, nome: 'Estudo', cor_hex: '#00ff00' })]
    useTemaStore.getState().setGrupos(lista)
    expect(useTemaStore.getState().grupos).toEqual(lista)
  })

  it('substitui a lista anterior completamente', () => {
    useTemaStore.getState().setGrupos([makeTema({ id: 1 })])
    useTemaStore.getState().setGrupos([makeTema({ id: 2, nome: 'Saúde' })])
    const grupos = useTemaStore.getState().grupos
    expect(grupos).toHaveLength(1)
    expect(grupos[0].id).toBe(2)
  })

  it('aceita lista vazia para limpar os grupos', () => {
    useTemaStore.getState().setGrupos([makeTema()])
    useTemaStore.getState().setGrupos([])
    expect(useTemaStore.getState().grupos).toEqual([])
  })

  it('preserva todos os campos do tema', () => {
    const tema = makeTema({ id: 7, nome: 'Lazer', cor_hex: '#ff5500' })
    useTemaStore.getState().setGrupos([tema])
    expect(useTemaStore.getState().grupos[0]).toEqual(tema)
  })
})
