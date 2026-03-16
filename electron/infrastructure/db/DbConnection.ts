import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlJsDatabase = any;

export class DbConnection {
  constructor(
    private readonly db: SqlJsDatabase,
    private readonly dbFilePath: string,
  ) {}

  run(sql: string, params: unknown[] = []): void {
    this.db.run(sql, params);
    this.persist();
  }

  queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as Record<string, unknown>);
    }
    stmt.free();
    return rows;
  }

  queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | null {
    return this.queryAll(sql, params)[0] ?? null;
  }

  getMaxId(table: string): number | null {
    const result = this.queryOne(`SELECT MAX(id) as id FROM ${table}`);
    return result ? (result.id as number) : null;
  }

  persist(): void {
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbFilePath, Buffer.from(data));
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }
}
