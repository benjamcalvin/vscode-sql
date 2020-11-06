// TODO: We should probably use an interface here
// instead of using a bunch of if statements

import { getActiveConnType } from './connection';
import { listColumnsAthena, listTablesAthena, listDatabasesAthena, runQueryAthena } from './athena';
import { listColumnsPostgres, listTablesPostgres, listSchemasPostgres, runQueryPostgres } from './postgres';
import { listColumnsBigquery, listTablesBigquery, listDatasetsBigquery, runQueryBigquery } from './bigquery';

export function getRunQueryFunction() {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return runQueryPostgres;
    } else if (activeConnType == 'bigquery') {
        return runQueryBigquery;
    } else {
        return runQueryAthena;
    }
}

export function getListColumnsFunction() {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return listColumnsPostgres;
    } else if (activeConnType == 'bigquery') {
        return listColumnsBigquery;
    } else {
        return listColumnsAthena;
    }
}

export function getListTablesFunction() {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return listTablesPostgres;
    } else if (activeConnType == 'bigquery') {
        return listTablesBigquery;
    } else {
        return listTablesAthena;
    }
}

export function getListDatabasesFunction() {
    const activeConnType = getActiveConnType()
    if ((activeConnType == 'postgres') || (activeConnType == 'redshift')) {
        return listSchemasPostgres;
    } else if (activeConnType == 'bigquery') {
        return listDatasetsBigquery;
    } else {
        return listDatabasesAthena;
    }
}