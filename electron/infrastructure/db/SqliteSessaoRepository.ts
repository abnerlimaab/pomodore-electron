import type { ISessaoRepository } from '../../repositories/ISessaoRepository';
import type { Sessao } from '../../domain/entities';
import { DbConnection } from './DbConnection';

export class SqliteSessaoRepository implements ISessaoRepository {
  constructor(private readonly conn: DbConnection) {}

  create(input: { tipo: string; inicio: string }): Pick<Sessao, 'id' | 'tipo' | 'inicio'> {
    this.conn.run(
      'INSERT INTO Sessoes (tipo, inicio) VALUES (?, ?)',
      [input.tipo, input.inicio],
    );
    const id = this.conn.getMaxId('Sessoes') as number;
    return { id, tipo: input.tipo, inicio: input.inicio };
  }

  finalize(input: { id: number; fim: string; duracao_total_segundos: number }): void {
    this.conn.run(
      'UPDATE Sessoes SET fim = ?, duracao_total_segundos = ? WHERE id = ?',
      [input.fim, input.duracao_total_segundos, input.id],
    );
  }

  createVinculo(input: { sessao_id: number; atividade_id: number; prioridade: string }): void {
    this.conn.run(
      'INSERT INTO Vinculo_Sessao_Atividade (sessao_id, atividade_id, prioridade) VALUES (?, ?, ?)',
      [input.sessao_id, input.atividade_id, input.prioridade],
    );
  }

  findByRange(filter: { inicio: string; fim: string }): Sessao[] {
    const sessions = this.conn.queryAll(
      `SELECT * FROM Sessoes WHERE inicio >= ? AND inicio <= ? ORDER BY inicio DESC`,
      [filter.inicio, filter.fim],
    );

    return sessions.map(session => {
      const atividades = this.conn.queryAll(
        `SELECT vsa.prioridade, vsa.atividade_id, a.nome, a.tema_id, t.nome AS tema_nome, t.cor_hex AS tema_cor
         FROM Vinculo_Sessao_Atividade vsa
         LEFT JOIN Atividades a ON vsa.atividade_id = a.id
         LEFT JOIN Temas t ON a.tema_id = t.id
         WHERE vsa.sessao_id = ?`,
        [session.id],
      );
      return { ...session, atividades } as unknown as Sessao;
    });
  }
}
