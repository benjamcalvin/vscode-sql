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
        console.log(connParams);
        console.log(connParams['account']);
        console.log(connParams['user']);

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

        console.log("Here are the results:");
        console.log(results);
        var columns: any;
        values = [];
        for (var row = 0; row < results.length; row++) {
            if (row == 0) {
                console.log(results[row]);
                columns = Object.keys(results[row]);
            }
            // JS Objects not guaranteed to be ordered? May not matter in vscode, but to be safe..
            values.push([]);
            for (var col = 0; col < columns.length; col++) {
                values[row].push(results[row][columns[col]]);
            }
        }
        values = [columns, values];
        console.log(values);

    } catch (e) {
        console.log(e);
        values = (e as Error).message;
    }

    return values;
}

export async function listSchemasSnowflake() {
    var schemas = [];
    // TODO
    return schemas;
}

export async function listTablesSnowflake(schema: string) {
    var tables = [];
    // TODO
    return tables;
}

export async function listColumnsSnowflake(schema: string, table: string) {
    var columns = [];
    // TODO
    return columns
}