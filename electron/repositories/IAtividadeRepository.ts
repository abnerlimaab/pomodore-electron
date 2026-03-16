import type { Atividade } from '../domain/entities';

export interface IAtividadeRepository {
  findAll(filter?: { tema_id?: number; status?: string }): Atividade[];
  create(input: { tema_id?: number | null; nome: string; status?: string }): Atividade;
  update(input: { id: number; tema_id?: number | null; nome: string; status: string }): Atividade;
  delete(id: number): void;
}
