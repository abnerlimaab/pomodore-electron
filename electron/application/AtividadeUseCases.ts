import type { IAtividadeRepository } from '../repositories/IAtividadeRepository';
import type { Atividade } from '../domain/entities';

export class AtividadeUseCases {
  constructor(private readonly atividadeRepo: IAtividadeRepository) {}

  getAtividades(filter?: { tema_id?: number; status?: string }): Atividade[] {
    return this.atividadeRepo.findAll(filter);
  }

  createAtividade(input: { tema_id?: number | null; nome: string; status?: string }): Atividade {
    return this.atividadeRepo.create(input);
  }

  updateAtividade(input: { id: number; tema_id?: number | null; nome: string; status: string }): Atividade {
    return this.atividadeRepo.update(input);
  }

  deleteAtividade(id: number): void {
    this.atividadeRepo.delete(id);
  }
}
