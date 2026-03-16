import type { ISessaoRepository } from '../repositories/ISessaoRepository';
import type { Sessao } from '../domain/entities';

export class SessaoUseCases {
  constructor(private readonly sessaoRepo: ISessaoRepository) {}

  createSessao(input: { tipo: string; inicio: string }): Pick<Sessao, 'id' | 'tipo' | 'inicio'> {
    return this.sessaoRepo.create(input);
  }

  finalizeSessao(input: { id: number; fim: string; duracao_total_segundos: number }): void {
    this.sessaoRepo.finalize(input);
  }

  createVinculo(input: { sessao_id: number; atividade_id: number; prioridade: string }): void {
    this.sessaoRepo.createVinculo(input);
  }

  getSessoesByRange(filter: { inicio: string; fim: string }): Sessao[] {
    return this.sessaoRepo.findByRange(filter);
  }
}
