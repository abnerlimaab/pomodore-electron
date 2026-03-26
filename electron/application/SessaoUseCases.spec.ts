import { describe, it, expect, vi } from 'vitest'
import { SessaoUseCases } from './SessaoUseCases'
import type { ISessaoRepository } from '../repositories/ISessaoRepository'
import type { Sessao } from '../domain/entities'

function makeSessao(overrides: Partial<Sessao> = {}): Sessao {
  return {
    id: 1,
    tipo: 'pomodoro',
    inicio: '2026-03-26T09:00:00.000Z',
    fim: '2026-03-26T09:25:00.000Z',
    duracao_total_segundos: 1500,
    atividades: [],
    ...overrides,
  }
}

function makeRepo(overrides: Partial<ISessaoRepository> = {}): ISessaoRepository {
  return {
    create: vi.fn((input) => ({ id: 1, tipo: input.tipo, inicio: input.inicio })),
    finalize: vi.fn(),
    createVinculo: vi.fn(),
    findByRange: vi.fn(() => []),
    ...overrides,
  }
}

describe('SessaoUseCases', () => {
  describe('createSessao', () => {
    it('delega ao repositório com tipo e inicio', () => {
      const criada = { id: 42, tipo: 'pomodoro', inicio: '2026-03-26T09:00:00.000Z' }
      const repo = makeRepo({ create: vi.fn(() => criada) })
      const uc = new SessaoUseCases(repo)

      const result = uc.createSessao({ tipo: 'pomodoro', inicio: '2026-03-26T09:00:00.000Z' })

      expect(repo.create).toHaveBeenCalledWith({ tipo: 'pomodoro', inicio: '2026-03-26T09:00:00.000Z' })
      expect(result).toBe(criada)
    })

    it('funciona para tipo short-break', () => {
      const criada = { id: 2, tipo: 'short-break', inicio: '2026-03-26T09:25:00.000Z' }
      const repo = makeRepo({ create: vi.fn(() => criada) })
      const uc = new SessaoUseCases(repo)

      const result = uc.createSessao({ tipo: 'short-break', inicio: '2026-03-26T09:25:00.000Z' })

      expect(repo.create).toHaveBeenCalledWith({ tipo: 'short-break', inicio: '2026-03-26T09:25:00.000Z' })
      expect(result).toBe(criada)
    })

    it('retorna apenas id, tipo e inicio (sem campos de finalização)', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      const result = uc.createSessao({ tipo: 'free', inicio: '2026-03-26T10:00:00.000Z' })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('tipo')
      expect(result).toHaveProperty('inicio')
      expect(result).not.toHaveProperty('fim')
      expect(result).not.toHaveProperty('duracao_total_segundos')
    })
  })

  describe('finalizeSessao', () => {
    it('delega ao repositório com id, fim e duracao_total_segundos', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      uc.finalizeSessao({ id: 1, fim: '2026-03-26T09:25:00.000Z', duracao_total_segundos: 1500 })

      expect(repo.finalize).toHaveBeenCalledWith({
        id: 1,
        fim: '2026-03-26T09:25:00.000Z',
        duracao_total_segundos: 1500,
      })
      expect(repo.finalize).toHaveBeenCalledOnce()
    })

    it('não retorna nada', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      const result = uc.finalizeSessao({ id: 1, fim: '2026-03-26T09:25:00.000Z', duracao_total_segundos: 1500 })

      expect(result).toBeUndefined()
    })

    it('aceita duração zero (sessão interrompida imediatamente)', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      uc.finalizeSessao({ id: 5, fim: '2026-03-26T09:00:01.000Z', duracao_total_segundos: 0 })

      expect(repo.finalize).toHaveBeenCalledWith({
        id: 5,
        fim: '2026-03-26T09:00:01.000Z',
        duracao_total_segundos: 0,
      })
    })
  })

  describe('createVinculo', () => {
    it('delega ao repositório com sessao_id, atividade_id e prioridade Primaria', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      uc.createVinculo({ sessao_id: 10, atividade_id: 3, prioridade: 'Primaria' })

      expect(repo.createVinculo).toHaveBeenCalledWith({
        sessao_id: 10,
        atividade_id: 3,
        prioridade: 'Primaria',
      })
      expect(repo.createVinculo).toHaveBeenCalledOnce()
    })

    it('delega ao repositório com prioridade Secundaria', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      uc.createVinculo({ sessao_id: 10, atividade_id: 7, prioridade: 'Secundaria' })

      expect(repo.createVinculo).toHaveBeenCalledWith({
        sessao_id: 10,
        atividade_id: 7,
        prioridade: 'Secundaria',
      })
    })

    it('não retorna nada', () => {
      const repo = makeRepo()
      const uc = new SessaoUseCases(repo)

      const result = uc.createVinculo({ sessao_id: 1, atividade_id: 1, prioridade: 'Primaria' })

      expect(result).toBeUndefined()
    })
  })

  describe('getSessoesByRange', () => {
    it('delega ao repositório com o intervalo de datas', () => {
      const sessoes = [makeSessao(), makeSessao({ id: 2 })]
      const repo = makeRepo({ findByRange: vi.fn(() => sessoes) })
      const uc = new SessaoUseCases(repo)

      const result = uc.getSessoesByRange({
        inicio: '2026-03-01T00:00:00.000Z',
        fim: '2026-03-31T23:59:59.000Z',
      })

      expect(repo.findByRange).toHaveBeenCalledWith({
        inicio: '2026-03-01T00:00:00.000Z',
        fim: '2026-03-31T23:59:59.000Z',
      })
      expect(result).toBe(sessoes)
    })

    it('retorna lista vazia quando não há sessões no período', () => {
      const repo = makeRepo({ findByRange: vi.fn(() => []) })
      const uc = new SessaoUseCases(repo)

      const result = uc.getSessoesByRange({
        inicio: '2020-01-01T00:00:00.000Z',
        fim: '2020-01-01T23:59:59.000Z',
      })

      expect(result).toEqual([])
    })

    it('retorna sessões com atividades vinculadas', () => {
      const sessaoComAtividade = makeSessao({
        atividades: [
          { atividade_id: 1, prioridade: 'Primaria', nome: 'Codar', tema_id: 1, tema_nome: 'Trabalho', tema_cor: '#ff0000' },
        ],
      })
      const repo = makeRepo({ findByRange: vi.fn(() => [sessaoComAtividade]) })
      const uc = new SessaoUseCases(repo)

      const result = uc.getSessoesByRange({ inicio: '2026-03-26T00:00:00.000Z', fim: '2026-03-26T23:59:59.000Z' })

      expect(result[0].atividades).toHaveLength(1)
      expect(result[0].atividades![0].prioridade).toBe('Primaria')
    })
  })
})
