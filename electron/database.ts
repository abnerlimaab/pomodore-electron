import path from 'path';
import fs from 'fs';
import { app } from 'electron';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlJsStatic = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

let db: Database;
let SQL: SqlJsStatic;
let dbFilePath: string;

export async function initDatabase(): Promise<Database> {
  const initSqlJs = require('sql.js') as (config?: object) => Promise<SqlJsStatic>;
  SQL = await initSqlJs();

  dbFilePath = path.join(app.getPath('userData'), 'pomodore.db');

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`PRAGMA foreign_keys = ON;`);

  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_atividades_nome ON Atividades(nome);`);
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_temas_nome ON Temas(nome);`);

  db.run(`
    CREATE TABLE IF NOT EXISTS Temas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cor_hex TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Atividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tema_id INTEGER,
      nome TEXT NOT NULL,
      status TEXT DEFAULT 'ativa',
      FOREIGN KEY (tema_id) REFERENCES Temas(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT,
      inicio DATETIME,
      fim DATETIME,
      duracao_total_segundos INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Vinculo_Sessao_Atividade (
      sessao_id INTEGER,
      atividade_id INTEGER,
      prioridade TEXT,
      FOREIGN KEY (sessao_id) REFERENCES Sessoes(id),
      FOREIGN KEY (atividade_id) REFERENCES Atividades(id)
    );
  `);

  db.run(`DELETE FROM Vinculo_Sessao_Atividade
          WHERE sessao_id NOT IN (SELECT id FROM Sessoes)`);
  db.run(`DELETE FROM Sessoes
          WHERE fim IS NULL AND duracao_total_segundos IS NULL`);

  persistDb();
  return db;
}

function persistDb(): void {
  if (!db || !dbFilePath) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (e) {
    console.error('Failed to persist database:', e);
  }
}

function runAndPersist(sql: string, params: unknown[] = []): void {
  db.run(sql, params);
  persistDb();
}

function queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>);
  }
  stmt.free();
  return rows;
}

function queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | null {
  const rows = queryAll(sql, params);
  return rows[0] ?? null;
}

function getMaxId(table: string): unknown {
  const result = queryOne(`SELECT MAX(id) as id FROM ${table}`);
  return result ? result.id : null;
}

// ─── Temas ────────────────────────────────────────────────────────────────────

export function getTemas(): Record<string, unknown>[] {
  return queryAll('SELECT * FROM Temas ORDER BY nome');
}

export function createTema({ nome, cor_hex }: { nome: string; cor_hex?: string }): object {
  runAndPersist('INSERT INTO Temas (nome, cor_hex) VALUES (?, ?)', [nome, cor_hex || '#6750A4']);
  const id = getMaxId('Temas');
  return { id, nome, cor_hex: cor_hex || '#6750A4' };
}

export function updateTema({ id, nome, cor_hex }: { id: number; nome: string; cor_hex: string }): object {
  runAndPersist('UPDATE Temas SET nome = ?, cor_hex = ? WHERE id = ?', [nome, cor_hex, id]);
  return { id, nome, cor_hex };
}

export function deleteTema(id: number): object {
  runAndPersist('UPDATE Atividades SET tema_id = NULL WHERE tema_id = ?', [id]);
  runAndPersist('DELETE FROM Temas WHERE id = ?', [id]);
  return { success: true };
}

// ─── Atividades ───────────────────────────────────────────────────────────────

export function getAtividades({ tema_id, status }: { tema_id?: number; status?: string } = {}): Record<string, unknown>[] {
  let query = `
    SELECT a.*, t.nome AS tema_nome, t.cor_hex AS tema_cor
    FROM Atividades a
    LEFT JOIN Temas t ON a.tema_id = t.id
  `;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (tema_id !== undefined && tema_id !== null) {
    conditions.push('a.tema_id = ?');
    params.push(tema_id);
  }
  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.nome';
  return queryAll(query, params);
}

export function createAtividade({ tema_id, nome, status }: { tema_id?: number | null; nome: string; status?: string }): object {
  runAndPersist(
    'INSERT INTO Atividades (tema_id, nome, status) VALUES (?, ?, ?)',
    [tema_id || null, nome, status || 'ativa']
  );
  const id = getMaxId('Atividades');
  return { id, tema_id, nome, status: status || 'ativa' };
}

export function updateAtividade({ id, tema_id, nome, status }: { id: number; tema_id?: number | null; nome: string; status: string }): object {
  runAndPersist(
    'UPDATE Atividades SET tema_id = ?, nome = ?, status = ? WHERE id = ?',
    [tema_id || null, nome, status, id]
  );
  return { id, tema_id, nome, status };
}

export function deleteAtividade(id: number): object {
  runAndPersist('DELETE FROM Vinculo_Sessao_Atividade WHERE atividade_id = ?', [id]);
  runAndPersist('DELETE FROM Atividades WHERE id = ?', [id]);
  return { success: true };
}

// ─── Sessoes ──────────────────────────────────────────────────────────────────

export function createSessao({ tipo, inicio }: { tipo: string; inicio: string }): object {
  runAndPersist('INSERT INTO Sessoes (tipo, inicio) VALUES (?, ?)', [tipo, inicio]);
  const id = getMaxId('Sessoes');
  return { id, tipo, inicio };
}

export function finalizeSessao({ id, fim, duracao_total_segundos }: { id: number; fim: string; duracao_total_segundos: number }): object {
  runAndPersist(
    'UPDATE Sessoes SET fim = ?, duracao_total_segundos = ? WHERE id = ?',
    [fim, duracao_total_segundos, id]
  );
  return { id, fim, duracao_total_segundos };
}

// ─── Vinculos ─────────────────────────────────────────────────────────────────

export function createVinculo({ sessao_id, atividade_id, prioridade }: { sessao_id: number; atividade_id: number; prioridade: string }): object {
  runAndPersist(
    'INSERT INTO Vinculo_Sessao_Atividade (sessao_id, atividade_id, prioridade) VALUES (?, ?, ?)',
    [sessao_id, atividade_id, prioridade]
  );
  return { sessao_id, atividade_id, prioridade };
}

export function getSessoesByRange({ inicio, fim }: { inicio: string; fim: string }): Record<string, unknown>[] {
  const sessions = queryAll(
    `SELECT * FROM Sessoes WHERE inicio >= ? AND inicio <= ? ORDER BY inicio DESC`,
    [inicio, fim]
  );

  return sessions.map(session => {
    const atividades = queryAll(
      `SELECT vsa.prioridade, vsa.atividade_id, a.nome, a.tema_id, t.nome AS tema_nome, t.cor_hex AS tema_cor
       FROM Vinculo_Sessao_Atividade vsa
       LEFT JOIN Atividades a ON vsa.atividade_id = a.id
       LEFT JOIN Temas t ON a.tema_id = t.id
       WHERE vsa.sessao_id = ?`,
      [session.id]
    );
    return { ...session, atividades };
  });
}
