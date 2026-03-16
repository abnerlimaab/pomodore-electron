import type { Sessao } from '../domain/entities';

export interface ISessaoRepository {
  create(input: { tipo: string; inicio: string }): Pick<Sessao, 'id' | 'tipo' | 'inicio'>;
  finalize(input: { id: number; fim: string; duracao_total_segundos: number }): void;
  createVinculo(input: { sessao_id: number; atividade_id: number; prioridade: string }): void;
  findByRange(filter: { inicio: string; fim: string }): Sessao[];
}
