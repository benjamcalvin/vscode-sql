import { Client } from 'ts-postgres';
import { getDbJson } from './utils';

export async function runQueryPostgres(query: string) {
    // Takes in a query and returns a list of [column_names, result].
    // column_names: list of string
    // result: return table as a 2D array

    const dbJson = getDbJson()
    const currentDb = dbJson['current_db']
    const dbConfig = dbJson['dbs'][currentDb]

    const client = new Client({
        "host": dbConfig['host'],
        "port": dbConfig['port'],
        "database": dbConfig['database'],
        "user": dbConfig['user'],
        "password": dbConfig['password'],
    });
    await client.connect();

    var values: any;
    try {
        const result = await client.query(query);
        values = [result.names, result.rows]
    } catch(e) {
        values = (e as Error).message
    } finally {
        await client.end();
    }

    return values
}

export async function listSchemasPostgres() {
    const query = "SELECT nspname FROM pg_namespace ORDER BY 1;"
    const results = await runQueryPostgres(query);
    return getNthColumn(results[1], 0)
}

export async function listTablesPostgres(schema: string) {
    const query = `SELECT table_name FROM information_schema.tables
        WHERE table_schema = '${schema}'
        ORDER BY 1;`
    const results = await runQueryPostgres(query);
    return getNthColumn(results[1], 0)
}

export async function listColumnsPostgres(schema: string, table: string) {
    const query = `SELECT column_name FROM information_schema.columns
        WHERE table_schema = '${schema}'
        AND table_name = '${table}'
        ORDER BY 1;`
    const results = await runQueryPostgres(query);
    return getNthColumn(results[1], 0)
}

function getNthColumn(table: any, n: number) {
    var col = [];
    for (var i = 0; i < table.length; i++) {
        col.push(table[i][n])
    }

    return col
}