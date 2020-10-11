import * as AWS from 'aws-sdk';
import { DataFrame } from 'dataframe-js';
import { wait } from "./utils";


export async function runAthenaQuery(query: string) {
    // Takes in a query and returns a DataFrame with the results.
	var startQueryExecutionResponse = await startQueryExecution(query)
	const queryExecutionId = startQueryExecutionResponse['QueryExecutionId']
	var queryNotDone = true;
	var getQueryResultsResponse;
	while(queryNotDone) {
		wait(1000);
		getQueryResultsResponse = await getQueryResults(queryExecutionId).catch(function(err) {
            console.log(err.message);
            return err.message
        });
        console.log(getQueryResultsResponse);
		if (getQueryResultsResponse == "Query has not yet finished. Current state: RUNNING") {
			console.log("Waiting...", getQueryResultsResponse);
        } else {
            queryNotDone = false;
        }
    }

    console.log(getQueryResultsResponse);
    var values:any;
    if (typeof(getQueryResultsResponse) != 'string') {
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


async function startQueryExecution(query: string) {
	const athena = new AWS.Athena();
	const query_params = {
		QueryString: query,
		ResultConfiguration: {
			OutputLocation: 's3://sandbox-ephemeral-data/queries/'
		}
	}
	return athena.startQueryExecution(query_params).promise()
}

async function getQueryResults(queryExecutionId: string) {
	const athena = new AWS.Athena();
	const query_params = {
		QueryExecutionId: queryExecutionId
	}
	return athena.getQueryResults(query_params).promise()
}
