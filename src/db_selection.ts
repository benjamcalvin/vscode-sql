// TODO: We should probably use an interface here
// instead of using a bunch of if statements

import { getCurrentDbType } from './utils';
import { listColumnsAthena, listTablesAthena, listDatabasesAthena, runQueryAthena } from './athena';
import { listColumnsPostgres, listTablesPostgres, listSchemasPostgres, runQueryPostgres } from './postgres';

export function getRunQueryFunction() {
    const currentDbType = getCurrentDbType()
    if ((currentDbType == 'postgres') || (currentDbType == 'redshift')) {
        return runQueryPostgres;
    } else {
        return runQueryAthena;
    }
}

export function getListColumnsFunction() {
    const currentDbType = getCurrentDbType()
    if ((currentDbType == 'postgres') || (currentDbType == 'redshift')) {
        return listColumnsPostgres;
    } else {
        return listColumnsAthena;
    }
}

export function getListTablesFunction() {
    const currentDbType = getCurrentDbType()
    if ((currentDbType == 'postgres') || (currentDbType == 'redshift')) {
        return listTablesPostgres;
    } else {
        return listTablesAthena;
    }
}

export function getListDatabasesFunction() {
    const currentDbType = getCurrentDbType()
    if ((currentDbType == 'postgres') || (currentDbType == 'redshift')) {
        return listSchemasPostgres;
    } else {
        return listDatabasesAthena;
    }
}