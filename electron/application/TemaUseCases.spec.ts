import { describe, it, expect, vi } from 'vitest'
import { TemaUseCases } from './TemaUseCases'
import type { ITemaRepository } from '../repositories/ITemaRepository'
import type { Tema } from '../domain/entities'

function makeTema(overrides: Partial<Tema> = {}): Tema {
  return { id: 1, nome: 'Trabalho', cor_hex: '#ff0000', ...overrides }
}

function makeRepo(overrides: Partial<ITemaRepository> = {}): ITemaRepository {
  return {
    findAll: vi.fn(() => []),
    create: vi.fn((input) => makeTema({ nome: input.nome, cor_hex: input.cor_hex ?? '#000000' })),
    update: vi.fn((input) => makeTema(input)),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('TemaUseCases', () => {
  describe('getTemas', () => {
    it('retorna a lista do repositório', () => {
      const temas = [makeTema(), makeTema({ id: 2, nome: 'Estudo' })]
      const repo = makeRepo({ findAll: vi.fn(() => temas) })
      const uc = new TemaUseCases(repo)

      const result = uc.getTemas()

      expect(result).toBe(temas)
      expect(repo.findAll).toHaveBeenCalledOnce()
    })

    it('retorna lista vazia quando não há temas', () => {
      const repo = makeRepo({ findAll: vi.fn(() => []) })
      const uc = new TemaUseCases(repo)

      expect(uc.getTemas()).toEqual([])
    })
  })

  describe('createTema', () => {
    it('delega ao repositório com nome e cor_hex', () => {
      const criado = makeTema({ nome: 'Saúde', cor_hex: '#00ff00' })
      const repo = makeRepo({ create: vi.fn(() => criado) })
      const uc = new TemaUseCases(repo)

      const result = uc.createTema({ nome: 'Saúde', cor_hex: '#00ff00' })

      expect(repo.create).toHaveBeenCalledWith({ nome: 'Saúde', cor_hex: '#00ff00' })
      expect(result).toBe(criado)
    })

    it('delega ao repositório sem cor_hex (campo opcional)', () => {
      const criado = makeTema({ nome: 'Lazer', cor_hex: '#000000' })
      const repo = makeRepo({ create: vi.fn(() => criado) })
      const uc = new TemaUseCases(repo)

      const result = uc.createTema({ nome: 'Lazer' })

      expect(repo.create).toHaveBeenCalledWith({ nome: 'Lazer' })
      expect(result).toBe(criado)
    })
  })

  describe('updateTema', () => {
    it('delega ao repositório com id, nome e cor_hex', () => {
      const atualizado = makeTema({ id: 3, nome: 'Novo Nome', cor_hex: '#0000ff' })
      const repo = makeRepo({ update: vi.fn(() => atualizado) })
      const uc = new TemaUseCases(repo)

      const result = uc.updateTema({ id: 3, nome: 'Novo Nome', cor_hex: '#0000ff' })

      expect(repo.update).toHaveBeenCalledWith({ id: 3, nome: 'Novo Nome', cor_hex: '#0000ff' })
      expect(result).toBe(atualizado)
    })
  })

  describe('deleteTema', () => {
    it('delega ao repositório com o id correto', () => {
      const repo = makeRepo()
      const uc = new TemaUseCases(repo)

      uc.deleteTema(5)

      expect(repo.delete).toHaveBeenCalledWith(5)
      expect(repo.delete).toHaveBeenCalledOnce()
    })

    it('não retorna nada', () => {
      const repo = makeRepo()
      const uc = new TemaUseCases(repo)

      const result = uc.deleteTema(1)

      expect(result).toBeUndefined()
    })
  })
})
