import type { IAtividadeRepository } from '../../repositories/IAtividadeRepository';
import type { Atividade } from '../../domain/entities';
import { DbConnection } from './DbConnection';

export class SqliteAtividadeRepository implements IAtividadeRepository {
  constructor(private readonly conn: DbConnection) {}

  findAll(filter: { tema_id?: number; status?: string } = {}): Atividade[] {
    let query = `
      SELECT a.*, t.nome AS tema_nome, t.cor_hex AS tema_cor
      FROM Atividades a
      LEFT JOIN Temas t ON a.tema_id = t.id
    `;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (filter.tema_id !== undefined && filter.tema_id !== null) {
      conditions.push('a.tema_id = ?');
      params.push(filter.tema_id);
    }
    if (filter.status) {
      conditions.push('a.status = ?');
      params.push(filter.status);
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY a.nome';

    return this.conn.queryAll(query, params) as unknown as Atividade[];
  }

  create(input: { tema_id?: number | null; nome: string; status?: string }): Atividade {
    const status = input.status || 'ativa';
    this.conn.run(
      'INSERT INTO Atividades (tema_id, nome, status) VALUES (?, ?, ?)',
      [input.tema_id ?? null, input.nome, status],
    );
    const id = this.conn.getMaxId('Atividades') as number;
    return { id, tema_id: input.tema_id ?? null, nome: input.nome, status: status as 'ativa' | 'inativa' };
  }

  update(input: { id: number; tema_id?: number | null; nome: string; status: string }): Atividade {
    this.conn.run(
      'UPDATE Atividades SET tema_id = ?, nome = ?, status = ? WHERE id = ?',
      [input.tema_id ?? null, input.nome, input.status, input.id],
    );
    return { id: input.id, tema_id: input.tema_id ?? null, nome: input.nome, status: input.status as 'ativa' | 'inativa' };
  }

  delete(id: number): void {
    this.conn.run('DELETE FROM Vinculo_Sessao_Atividade WHERE atividade_id = ?', [id]);
    this.conn.run('DELETE FROM Atividades WHERE id = ?', [id]);
  }
}
