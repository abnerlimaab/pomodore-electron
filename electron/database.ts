import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { DbConnection } from './infrastructure/db/DbConnection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlJsStatic = any;

export async function initDatabase(): Promise<DbConnection> {
  const initSqlJs = require('sql.js') as (config?: object) => Promise<SqlJsStatic>;
  const SQL = await initSqlJs();

  const dbFilePath = path.join(app.getPath('userData'), 'pomodore.db');
  const db = fs.existsSync(dbFilePath)
    ? new SQL.Database(fs.readFileSync(dbFilePath))
    : new SQL.Database();

  const conn = new DbConnection(db, dbFilePath);

  // Pragmas and schema
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

  // Cleanup orphan records
  db.run(`DELETE FROM Vinculo_Sessao_Atividade
          WHERE sessao_id NOT IN (SELECT id FROM Sessoes)`);
  db.run(`DELETE FROM Sessoes
          WHERE fim IS NULL AND duracao_total_segundos IS NULL`);

  conn.persist();
  return conn;
}
