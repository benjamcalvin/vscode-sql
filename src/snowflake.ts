import { DataFrame } from 'dataframe-js';

export function runSnowflakeQuery(query: string) {
    // Takes in a query and returns a DataFrame with the results.
    let account = process.env.SNOWFLAKE_ACCOUNT
    let user = process.env.SNOWFLAKE_USER
    let password = process.env.SNOWFLAKE_PASSWORD

    let connection = createConnection(account, user, password)
    let startQueryExecutionResponse = getQueryResults(connection, query)
    const queryExecutionId = startQueryExecutionResponse['QueryExecutionId']

    var getQueryResultsResponse;
    getQueryResultsResponse =  getQueryResults(connection, queryExecutionId).catch(function (err) {
        console.log(err.message);
        return err.message
    });
    console.log(getQueryResultsResponse);

    let values: any;
    if (typeof (getQueryResultsResponse) != 'string') {
        const resultSet = getQueryResultsResponse['ResultSet'];
        // console.log(resultSet)
        const rows = resultSet['Rows'];
        // console.log(rows)
        values = unpackRows(rows);
        // console.log(values)
        var df = new DataFrame(values[1], values[0]);
    } else {
        values = getQueryResultsResponse;
    }

    return values

}


function createConnection(account, user, password) {
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
                connection_ID = conn.getId();
            }
        }
    );

}

function getQueryResults(connection, query: string) {
    var statement = connection.execute({
        sqlText: query,
        complete: function (err, stmt, rows) {
            if (err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
            } else {
                console.log('Successfully executed statement')
                return stmt.getSqlText().promise();
            }
        }
    });
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


function unpackRows(rows: any) {
    var string = "";
    let values: any[] = [];
    let columns: any[] = [];
    for (var i = 0; i < rows.length; i++) {
        if (i == 0) {
            columns = unpackRow(rows[i]);
        } else {
            string = string + unpackRow(rows[i]) + "\n";
            values.push(unpackRow(rows[i]));
        }
    }

    return [columns, values]
};


function unpackRow(row: any) {
    var row = row['Data']
    var values = []
    var string = "";
    for (var j = 0; j < row.length; j++) {
        string = string + row[j]['VarCharValue'] + ", ";
        values.push(row[j]['VarCharValue']);
    };
    return values
};