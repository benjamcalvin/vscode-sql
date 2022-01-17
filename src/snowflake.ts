import { createConnection} from 'snowflake-sdk';
import { getConnParams } from './connection';
import { getNthColumn } from './utils';

export async function runQuerySnowflake(query: string) {
    // Takes in a query and returns a list of [column_names, result].
    // column_names: list of string
    // result: return table as a 2D array
    var results: any;
    var values: any;

    try {
        const connParams = await getConnParams()
        var conn = createConnection(connParams);

        // Try to connect to Snowflake, and check whether the connection was successful.
        conn.connect(
            function (err, conn) {
                if (err) {
                    console.error('Unable to connect: ' + err.message);
                }
                else {
                    console.log('Successfully connected to Snowflake.');
                    // Optional: store the connection ID.
                    var connection_ID = conn.getId();
                }
            }
        );

        results = await new Promise((res: any, rej: any) => {
            conn.execute({
                sqlText: query,
                complete: (err, stmt, rows) => {
                    if (err) {
                        console.error("Failed to execute statement due to the following error: "+err.message);
                        rej(err);
                    } else {
                        console.log("Successfully executed statement: " + stmt.getSqlText());
                        res(rows);
                    }
                }
            });
        });

        // console.log("Here are the results:");
        // console.log(results);
        var columns: any;
        values = [];
        for (var row = 0; row < results.length; row++) {
            if (row == 0) {
                // console.log(results[row]);
                columns = Object.keys(results[row]);
            }
            // JS Objects not guaranteed to be ordered? May not matter in vscode, but to be safe..
            values.push([]);
            for (var col = 0; col < columns.length; col++) {
                values[row].push(results[row][columns[col]]);
            }
        }
        values = [columns, values];
        // console.log(values);

    } catch (e) {
        console.log(e);
        values = (e as Error).message;
    }

    return values;
}

export async function listDatabasesSnowflake() {
    var databases = [];
    const databaseQuery = "SELECT database_name FROM information_schema.databases;";
    const databaseQueryResult = await runQuerySnowflake(databaseQuery);
    databases = getNthColumn(databaseQueryResult[1], 0);
    return databases;
}

export async function listSchemasSnowflake(database: string) {
    var schemas = [];
    const schemaQuery = `SELECT SCHEMA_NAME FROM ${database}.INFORMATION_SCHEMA.SCHEMATA;`;
    const schemaQueryResult = await runQuerySnowflake(schemaQuery);
    schemas = getNthColumn(schemaQueryResult[1], 0);
    return schemas;
}

export async function listTablesSnowflake(database: string, schema: string) {
    var tables = [];
    const tableQuery = `SELECT TABLE_NAME FROM ${database}.INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${schema}';`;
    const tableQueryResult = await runQuerySnowflake(tableQuery);
    tables = getNthColumn(tableQueryResult[1], 0);
    return tables;
}

export async function listColumnsSnowflake(database: string, schema: string, table: string) {
    var columns = [];
    const columnQuery = `SELECT COLUMN_NAME FROM ${database}.INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${schema}' AND TABLE_NAME = '${table}';`;
    const columnQueryResult = await runQuerySnowflake(columnQuery);
    columns = getNthColumn(columnQueryResult[1], 0);
    return columns;
}