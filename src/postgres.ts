import { Client } from 'pg';
import { getNthColumn } from './utils';
import { getConnParams } from './connection'

export async function runQueryPostgres(query: string) {
    // Takes in a query and returns a list of [column_names, result].
    // column_names: list of string
    // result: return table as a 2D array

    var values: any;
    try {
        const connParams = await getConnParams()
        const client = new Client(connParams)
        await client.connect();

        var result = await client.query({
            'text': query,
            'values': [],
            'rowMode': 'array',
        })

        // For some reason when running CREATE TABLE statements,
        // an array of results is returned with no obvious information added
        // This is a way to bypass that weird behavior
        if (Array.isArray(result)) {
            result = result[0]
        }

        const columnNames = result.fields.map((field: { name: string }) => field.name)
        values = [columnNames, result.rows]

        await client.end()
    } catch(e) {
        console.log(e)
        values = (e as Error).message
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