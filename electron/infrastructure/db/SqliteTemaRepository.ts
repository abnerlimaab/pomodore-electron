import type { ITemaRepository } from '../../repositories/ITemaRepository';
import type { Tema } from '../../domain/entities';
import { DbConnection } from './DbConnection';

export class SqliteTemaRepository implements ITemaRepository {
  constructor(private readonly conn: DbConnection) {}

  findAll(): Tema[] {
    return this.conn.queryAll('SELECT * FROM Temas ORDER BY nome') as unknown as Tema[];
  }

  create(input: { nome: string; cor_hex?: string }): Tema {
    const cor = input.cor_hex || '#6750A4';
    this.conn.run('INSERT INTO Temas (nome, cor_hex) VALUES (?, ?)', [input.nome, cor]);
    const id = this.conn.getMaxId('Temas') as number;
    return { id, nome: input.nome, cor_hex: cor };
  }

  update(input: { id: number; nome: string; cor_hex: string }): Tema {
    this.conn.run(
      'UPDATE Temas SET nome = ?, cor_hex = ? WHERE id = ?',
      [input.nome, input.cor_hex, input.id],
    );
    return { id: input.id, nome: input.nome, cor_hex: input.cor_hex };
  }

  delete(id: number): void {
    this.conn.run('UPDATE Atividades SET tema_id = NULL WHERE tema_id = ?', [id]);
    this.conn.run('DELETE FROM Temas WHERE id = ?', [id]);
  }
}
