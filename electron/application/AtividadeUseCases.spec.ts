import { describe, it, expect, vi } from 'vitest'
import { AtividadeUseCases } from './AtividadeUseCases'
import type { IAtividadeRepository } from '../repositories/IAtividadeRepository'
import type { Atividade } from '../domain/entities'

function makeAtividade(overrides: Partial<Atividade> = {}): Atividade {
  return { id: 1, tema_id: 10, nome: 'Ler livro', status: 'ativa', ...overrides }
}

function makeRepo(overrides: Partial<IAtividadeRepository> = {}): IAtividadeRepository {
  return {
    findAll: vi.fn(() => []),
    create: vi.fn((input) =>
      makeAtividade({ nome: input.nome, tema_id: input.tema_id ?? null, status: (input.status as 'ativa' | 'inativa') ?? 'ativa' }),
    ),
    update: vi.fn((input) =>
      makeAtividade({ id: input.id, nome: input.nome, tema_id: input.tema_id ?? null, status: input.status as 'ativa' | 'inativa' }),
    ),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('AtividadeUseCases', () => {
  describe('getAtividades', () => {
    it('retorna todas as atividades sem filtro', () => {
      const lista = [makeAtividade(), makeAtividade({ id: 2, nome: 'Correr' })]
      const repo = makeRepo({ findAll: vi.fn(() => lista) })
      const uc = new AtividadeUseCases(repo)

      const result = uc.getAtividades()

      expect(result).toBe(lista)
      expect(repo.findAll).toHaveBeenCalledWith(undefined)
    })

    it('repassa o filtro por tema_id ao repositório', () => {
      const repo = makeRepo()
      const uc = new AtividadeUseCases(repo)

      uc.getAtividades({ tema_id: 3 })

      expect(repo.findAll).toHaveBeenCalledWith({ tema_id: 3 })
    })

    it('repassa o filtro por status ao repositório', () => {
      const repo = makeRepo()
      const uc = new AtividadeUseCases(repo)

      uc.getAtividades({ status: 'inativa' })

      expect(repo.findAll).toHaveBeenCalledWith({ status: 'inativa' })
    })

    it('repassa filtro combinado tema_id + status', () => {
      const repo = makeRepo()
      const uc = new AtividadeUseCases(repo)

      uc.getAtividades({ tema_id: 2, status: 'ativa' })

      expect(repo.findAll).toHaveBeenCalledWith({ tema_id: 2, status: 'ativa' })
    })

    it('retorna lista vazia quando não há atividades', () => {
      const repo = makeRepo()
      const uc = new AtividadeUseCases(repo)

      expect(uc.getAtividades()).toEqual([])
    })
  })

  describe('createAtividade', () => {
    it('delega ao repositório com nome, tema_id e status', () => {
      const criada = makeAtividade({ nome: 'Meditar', tema_id: 5, status: 'ativa' })
      const repo = makeRepo({ create: vi.fn(() => criada) })
      const uc = new AtividadeUseCases(repo)

      const result = uc.createAtividade({ nome: 'Meditar', tema_id: 5, status: 'ativa' })

      expect(repo.create).toHaveBeenCalledWith({ nome: 'Meditar', tema_id: 5, status: 'ativa' })
      expect(result).toBe(criada)
    })

    it('aceita tema_id nulo (atividade sem tema)', () => {
      const criada = makeAtividade({ nome: 'Genérica', tema_id: null })
      const repo = makeRepo({ create: vi.fn(() => criada) })
      const uc = new AtividadeUseCases(repo)

      const result = uc.createAtividade({ nome: 'Genérica', tema_id: null })

      expect(repo.create).toHaveBeenCalledWith({ nome: 'Genérica', tema_id: null })
      expect(result).toBe(criada)
    })

    it('aceita criação apenas com nome (campos opcionais ausentes)', () => {
      const criada = makeAtividade({ nome: 'Simples', tema_id: null, status: 'ativa' })
      const repo = makeRepo({ create: vi.fn(() => criada) })
      const uc = new AtividadeUseCases(repo)

      const result = uc.createAtividade({ nome: 'Simples' })

      expect(repo.create).toHaveBeenCalledWith({ nome: 'Simples' })
      expect(result).toBe(criada)
    })
  })

  describe('updateAtividade', () => {
    it('delega ao repositório com todos os campos', () => {
      const atualizada = makeAtividade({ id: 7, nome: 'Atualizada', tema_id: 2, status: 'inativa' })
      const repo = makeRepo({ update: vi.fn(() => atualizada) })
      const uc = new AtividadeUseCases(repo)

      const result = uc.updateAtividade({ id: 7, nome: 'Atualizada', tema_id: 2, status: 'inativa' })

      expect(repo.update).toHaveBeenCalledWith({ id: 7, nome: 'Atualizada', tema_id: 2, status: 'inativa' })
      expect(result).toBe(atualizada)
    })

    it('aceita tema_id nulo no update', () => {
      const atualizada = makeAtividade({ id: 4, nome: 'Sem tema', tema_id: null, status: 'ativa' })
      const repo = makeRepo({ update: vi.fn(() => atualizada) })
      const uc = new AtividadeUseCases(repo)

      const result = uc.updateAtividade({ id: 4, nome: 'Sem tema', tema_id: null, status: 'ativa' })

      expect(repo.update).toHaveBeenCalledWith({ id: 4, nome: 'Sem tema', tema_id: null, status: 'ativa' })
      expect(result).toBe(atualizada)
    })
  })

  describe('deleteAtividade', () => {
    it('delega ao repositório com o id correto', () => {
      const repo = makeRepo()
      const uc = new AtividadeUseCases(repo)

      uc.deleteAtividade(9)

      expect(repo.delete).toHaveBeenCalledWith(9)
      expect(repo.delete).toHaveBeenCalledOnce()
    })

    it('não retorna nada', () => {
      const repo = makeRepo()
      const uc = new AtividadeUseCases(repo)

      const result = uc.deleteAtividade(1)

      expect(result).toBeUndefined()
    })
  })
})
