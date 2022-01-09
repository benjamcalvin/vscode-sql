import * as AWS from 'aws-sdk';
import { DataFrame } from 'dataframe-js';
import { wait } from "./utils";

const ATHENA_DATA_CATALOG = "AwsDataCatalog";

export async function runQueryAthena(query: string) {
	console.log("RunQueryAthena")
    // Takes in a query and returns a DataFrame with the results.
	var startQueryExecutionResponse = await startQueryExecution(query)
	console.log(startQueryExecutionResponse)
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
			console.log(getQueryResultsResponse)
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
	console.log("startQueryExecution");
	const athena = new AWS.Athena({region:'us-east-2'});
	console.log("Athena")
	console.log(athena)
	const query_params = {
		QueryString: query,
		WorkGroup: 'techco'
		// ,
		// ResultConfiguration: {
		// 	OutputLocation: 's3://sandbox-ephemeral-data/queries/'
		// }
	}
	return athena.startQueryExecution(query_params).promise()
}

async function getQueryResults(queryExecutionId: string) {
	console.log("getQueryResponse");
	const athena = new AWS.Athena({region:'us-east-2'});
	const query_params = {
		QueryExecutionId: queryExecutionId,
	}
	return athena.getQueryResults(query_params).promise()
}

export async function listDatabasesAthena() {
	const athena = new AWS.Athena({region:'us-east-2'});
	const params = {
		CatalogName: ATHENA_DATA_CATALOG,
	}

	const results = await athena.listDatabases(params).promise();
	const databasesObject = results['DatabaseList']
	var databases = [];

	for (var i = 0; i < databasesObject.length; i++) {
		databases.push(databasesObject[i].Name);
	}

	return databases;
}

export async function listTablesAthena(databaseName: string) {
	const athena = new AWS.Athena({region:'us-east-2'});
	const params = {
		CatalogName: ATHENA_DATA_CATALOG,
		DatabaseName: databaseName,
	};

	const results = await athena.listTableMetadata(params).promise();
	const tableMetadataList = results['TableMetadataList'];
	var tables = [];

	for (var i = 0; i < tableMetadataList.length; i++) {
		tables.push(tableMetadataList[i].Name)
	}
	console.log(tables);
	return tables;
}

export async function listColumnsAthena(database: string, table: string) {
	const athena = new AWS.Athena({region:'us-east-2'});
	const params = {
		CatalogName: ATHENA_DATA_CATALOG,
		DatabaseName: database,
		TableName: table
	};

	const results = await athena.getTableMetadata(params).promise();
	const tableMetadata = results['TableMetadata'];
	const columnMetadata = tableMetadata['Columns'];
	var columns = [];
	for (var i = 0; i < columnMetadata.length; i++) {
		columns.push(columnMetadata[i].Name);
	}

	return columns;
}
