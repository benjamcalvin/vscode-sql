import { BigQuery } from '@google-cloud/bigquery';
import { getNthColumn } from './utils';


export async function runQueryBigquery(query: string) {
    const bigquery = new BigQuery();
    const options = {
        query: query,
        // Location must match that of the dataset(s) referenced in the query.
        location: 'US',
        dryRun: false,
    };

    var results: any;
    
    try {
        const [job] = await bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();
        var values = []

        if ((rows != null) && (rows.length > 0))  {
            console.log(job.metadata.statistics)
            const columns = Object.keys(rows[0])
            
            for (var i = 0; i < rows.length; i++) {
                const row = Object.values(rows[i])
                values.push(row)
            }
            results = [columns, values]
        } else {
            // Result is empty
            results = ''
        }
    } catch (e) {
        results = (e as Error).message
    }
    return results
}

export async function listDatasetsBigquery() {
    const bigquery = new BigQuery();
    const [datasets] = await bigquery.getDatasets();

    var datasetIds = []
    for (var i = 0; i < datasets.length; i++) {
        datasetIds.push(datasets[i].id)
    }

    return datasetIds;
}

export async function listTablesBigquery(schema: string) {
    const bigquery = new BigQuery();
    const [tables] = await bigquery.dataset(schema).getTables();

    var tableIds = []
    for (var i = 0; i < tables.length; i++) {
        tableIds.push(tables[i].id)
    }

    return tableIds;
}

export async function listColumnsBigquery(schema: string, table: string) {
    const query = `SELECT column_name FROM ${schema}.INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${schema}' AND TABLE_NAME = '${table}'
        ORDER BY 1;`
    const results = await runQueryBigquery(query)

    if (typeof (results) == 'string') {
        // If the query fails or returns empty
        return [results]
    } else {
        return getNthColumn(results[1], 0)
    }
}