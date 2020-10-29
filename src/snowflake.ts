import { rejects } from 'assert';
import { DataFrame } from 'dataframe-js';
import { resolve } from 'dns';

export async function runSnowflakeQuery(connection, query: string) {
    // Takes in a query and returns a DataFrame with the results.
    var getQueryResultsResponse = await getQueryResults(connection, query)
    // console.log(getQueryResultsResponse)

    return getQueryResultsResponse
}


export function createConnection(account, user, password) {
    var snowflake = require('snowflake-sdk');
    // Create a Connection object that we can use later to connect.
    var connection = snowflake.createConnection({
        account: account,
        username: user,
        password: password
    }
    );

    // Try to connect to Snowflake, and check whether the connection was successful.
    connection.connect(
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

    return connection
}


async function getQueryResults(connection, query: string) {
    return await new Promise((res: any, rej: any) => {
        connection.execute({
            sqlText: query,
            complete: (err, stmt, rows) => {
            if (err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
                rej(err)
            } else {
                console.log('Successfully executed statement: ' + stmt.getSqlText());
                res(rows)
            }
            }
        });
    })
}


function terminateConnection(connection) {
    connection.destroy(function (err, conn) {
        if (err) {
            console.error('Unable to disconnect: ' + err.message);
        } else {
            console.log('Disconnected connection with id: ' + connection.getId());
        }
    });
}
