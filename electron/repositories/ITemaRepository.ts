import type { Tema } from '../domain/entities';

export interface ITemaRepository {
  findAll(): Tema[];
  create(input: { nome: string; cor_hex?: string }): Tema;
  update(input: { id: number; nome: string; cor_hex: string }): Tema;
  delete(id: number): void;
}
