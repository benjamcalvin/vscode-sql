// TODO: We should probably use an interface here
// instead of using a bunch of if statements

import { getActiveConnType } from './connection';
import { listColumnsAthena, listTablesAthena, listDatabasesAthena, runQueryAthena } from './athena';
import { listColumnsPostgres, listTablesPostgres, listSchemasPostgres, runQueryPostgres } from './postgres';
import { listColumnsBigquery, listTablesBigquery, listDatasetsBigquery, runQueryBigquery } from './bigquery';
import { listColumnsSnowflake, listTablesSnowflake, listSchemasSnowflake, runQuerySnowflake, listDatabasesSnowflake} from './snowflake';

export function runQuery(query: string) {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return runQueryPostgres(query);
    } else if (activeConnType == 'snowflake') {
        return runQuerySnowflake(query);
    } else if (activeConnType == 'bigquery') {
        return runQueryBigquery(query);
    } else {
        return runQueryAthena(query);
    }
}

export function listColumns(schema: string, table: string, database:string = undefined) {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return listColumnsPostgres(schema, table);
    } else if (activeConnType == 'snowflake') {
        return listColumnsSnowflake(database, schema, table);
    } else if (activeConnType == 'bigquery') {
        return listColumnsBigquery(schema, table);
    } else {
        return listColumnsAthena(schema, table);
    }
}

export function listTables(schema: string, database:string = undefined) {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return listTablesPostgres(schema);
    } else if (activeConnType == 'snowflake') {
        return listTablesSnowflake(database, schema);
    } else if (activeConnType == 'bigquery') {
        return listTablesBigquery(schema);
    } else {
        return listTablesAthena(schema);
    }
}

export function listSchemas(database:string = undefined) {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return listSchemasPostgres();
    } else if (activeConnType == 'snowflake') {
        return listSchemasSnowflake(database);
    } else if (activeConnType == 'bigquery') {
        return listDatasetsBigquery();
    } else {
        return listDatabasesAthena();
    }
}

export function listDatabases() {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        // return listSchemasPostgres();
    } else if (activeConnType == 'snowflake') {
        return listDatabasesSnowflake();
    } else if (activeConnType == 'bigquery') {
        // return listDatasetsBigquery();
    } else {
        // return listDatabasesAthena();
    }
}