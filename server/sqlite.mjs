import { DatabaseSync } from 'node:sqlite';
export function sqliteAdapter(path = ':memory:') {
    const connection = new DatabaseSync(path);
    const prepare = sql => { let values = []; const stmt = { bind(...v) { values = v; return stmt; }, async first() { return connection.prepare(sql).get(...values) || null; }, async all() { return { results: connection.prepare(sql).all(...values) }; }, async run() { const result = connection.prepare(sql).run(...values); return { success: true, meta: { changes: Number(result.changes) } }; } }; return stmt; };
    return { connection, prepare, async batch(statements) { connection.exec('BEGIN IMMEDIATE'); try {
            const results = [];
            for (const s of statements)
                results.push(await s.run());
            connection.exec('COMMIT');
            return results;
        }
        catch (e) {
            connection.exec('ROLLBACK');
            throw e;
        } }, close() { connection.close(); } };
}
