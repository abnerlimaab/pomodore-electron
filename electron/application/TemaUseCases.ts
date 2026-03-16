import type { ITemaRepository } from '../repositories/ITemaRepository';
import type { Tema } from '../domain/entities';

export class TemaUseCases {
  constructor(private readonly temaRepo: ITemaRepository) {}

  getTemas(): Tema[] {
    return this.temaRepo.findAll();
  }

  createTema(input: { nome: string; cor_hex?: string }): Tema {
    return this.temaRepo.create(input);
  }

  updateTema(input: { id: number; nome: string; cor_hex: string }): Tema {
    return this.temaRepo.update(input);
  }

  deleteTema(id: number): void {
    this.temaRepo.delete(id);
  }
}
