import { describe, it, expect, beforeEach } from 'vitest'
import { useAtividadeStore } from './atividadeStore'
import type { Atividade, SelectedActivity } from '@/shared/types'

function makeSelected(overrides: Partial<SelectedActivity> = {}): Omit<SelectedActivity, 'prioridade'> {
  return { id: 1, nome: 'Codar', tema_nome: 'Trabalho', tema_cor: '#ff0000', ...overrides }
}

function makeAtividade(overrides: Partial<Atividade> = {}): Atividade {
  return { id: 1, tema_id: 1, nome: 'Codar', status: 'ativa', ...overrides }
}

beforeEach(() => {
  useAtividadeStore.setState({ selectedActivities: [], atividades: [] })
})

describe('estado inicial', () => {
  it('começa sem atividades selecionadas', () => {
    expect(useAtividadeStore.getState().selectedActivities).toEqual([])
  })

  it('começa com lista de atividades vazia', () => {
    expect(useAtividadeStore.getState().atividades).toEqual([])
  })
})

describe('addActivity', () => {
  it('primeira atividade adicionada é Primaria', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    const [a] = useAtividadeStore.getState().selectedActivities
    expect(a.prioridade).toBe('Primaria')
  })

  it('segunda atividade adicionada é Secundaria', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2, nome: 'Ler' }))
    const activities = useAtividadeStore.getState().selectedActivities
    expect(activities[1].prioridade).toBe('Secundaria')
  })

  it('terceira atividade também é Secundaria', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 3 }))
    const activities = useAtividadeStore.getState().selectedActivities
    expect(activities[2].prioridade).toBe('Secundaria')
  })

  it('ignora duplicatas (mesmo id)', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 5 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 5 }))
    expect(useAtividadeStore.getState().selectedActivities).toHaveLength(1)
  })

  it('preserva os dados da atividade ao adicionar', () => {
    const act = makeSelected({ id: 9, nome: 'Meditar', tema_nome: 'Saúde', tema_cor: '#00ff00' })
    useAtividadeStore.getState().addActivity(act)
    const added = useAtividadeStore.getState().selectedActivities[0]
    expect(added.nome).toBe('Meditar')
    expect(added.tema_nome).toBe('Saúde')
    expect(added.tema_cor).toBe('#00ff00')
  })
})

describe('removeActivity', () => {
  it('remove a atividade pelo id', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().removeActivity(1)
    const activities = useAtividadeStore.getState().selectedActivities
    expect(activities).toHaveLength(1)
    expect(activities[0].id).toBe(2)
  })

  it('promove a próxima atividade para Primaria quando a Primaria é removida', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().removeActivity(1)
    expect(useAtividadeStore.getState().selectedActivities[0].prioridade).toBe('Primaria')
  })

  it('não altera prioridades quando uma Secundaria é removida', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().removeActivity(2)
    expect(useAtividadeStore.getState().selectedActivities[0].prioridade).toBe('Primaria')
  })

  it('lista fica vazia ao remover a única atividade', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().removeActivity(1)
    expect(useAtividadeStore.getState().selectedActivities).toEqual([])
  })

  it('não falha ao tentar remover id inexistente', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().removeActivity(999)
    expect(useAtividadeStore.getState().selectedActivities).toHaveLength(1)
  })
})

describe('setPrimary', () => {
  it('define a atividade alvo como Primaria', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().setPrimary(2)
    const activities = useAtividadeStore.getState().selectedActivities
    expect(activities.find(a => a.id === 2)!.prioridade).toBe('Primaria')
  })

  it('a atividade anterior Primaria passa a ser Secundaria', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().setPrimary(2)
    const activities = useAtividadeStore.getState().selectedActivities
    expect(activities.find(a => a.id === 1)!.prioridade).toBe('Secundaria')
  })

  it('com três atividades apenas a alvo fica como Primaria', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 3 }))
    useAtividadeStore.getState().setPrimary(3)
    const activities = useAtividadeStore.getState().selectedActivities
    const primarias = activities.filter(a => a.prioridade === 'Primaria')
    expect(primarias).toHaveLength(1)
    expect(primarias[0].id).toBe(3)
  })
})

describe('clearActivities', () => {
  it('esvazia selectedActivities', () => {
    useAtividadeStore.getState().addActivity(makeSelected({ id: 1 }))
    useAtividadeStore.getState().addActivity(makeSelected({ id: 2 }))
    useAtividadeStore.getState().clearActivities()
    expect(useAtividadeStore.getState().selectedActivities).toEqual([])
  })

  it('não falha quando já está vazio', () => {
    expect(() => useAtividadeStore.getState().clearActivities()).not.toThrow()
  })
})

describe('setAtividades', () => {
  it('substitui a lista de atividades disponíveis', () => {
    const lista = [makeAtividade({ id: 1 }), makeAtividade({ id: 2, nome: 'Ler' })]
    useAtividadeStore.getState().setAtividades(lista)
    expect(useAtividadeStore.getState().atividades).toEqual(lista)
  })

  it('aceita lista vazia para limpar', () => {
    useAtividadeStore.getState().setAtividades([makeAtividade()])
    useAtividadeStore.getState().setAtividades([])
    expect(useAtividadeStore.getState().atividades).toEqual([])
  })
})
