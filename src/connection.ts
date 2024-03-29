// Functions for getting or adding database connection

import * as vscode from 'vscode';
import CryptoTS = require("crypto-ts");
import crypto = require("crypto");
import keytar = require('keytar');
import cp = require('child_process');

const CONN_TYPE = [
    'athena',
    'bigquery',
    'postgres',
    'redshift',
    'snowflake',
]

const POSTGRES_PARAMS = [
    "host",
    "port",
    "database",
    "user",
    "password",
    "ssl"
]

const SNOWFLAKE_PARAMS = [
    "account",
    "username",
    "password"
]

// Store dbfacts connections
var dbfactsConn = {};
// Create status bar item showing current active connection
let myStatusBarItem: vscode.StatusBarItem


export function setupConnection() {
    configureStatusBar()
}

function getActiveConn() {
    return vscode.workspace.getConfiguration('vscodeSql').get("activeConnection") as string
}

function getAllConns() {
    return vscode.workspace.getConfiguration('vscodeSql').get("connections")
}

function validateStr(s: string) {
    // Check if string only contains alphanumeric
    let pattern = /^[0-9a-zA-Z_-]+$/
    if (s.match(pattern)) {
        return null
    } else {
        return 'Only alphanumeric, underscore and dash allowed'
    }
}

export function getActiveConnType() {
    const activeConn = getActiveConn();
    const activeConnectionType = vscode.workspace.getConfiguration(`vscodeSql.connections.${activeConn}`).get("type");
    return activeConnectionType
}

function parseDbFactsConnection(connId: string) {
    let regex = new RegExp('^\\(dbfacts\\)', 'i')
    let trimmedConnId = connId.replace(regex, '')
    let cmd = `db-facts json ${trimmedConnId}`

    let dbfactsPath = vscode.workspace.getConfiguration('vscodeSql').get("dbfactsPath")
    var env = process.env
    if (dbfactsPath != null) {
        env.PATH = `${dbfactsPath}:${env.PATH}`
    }
    let cpOptions = {
        'env': env,
    }

    const stdout = cp.execSync(cmd, cpOptions).toString()
    const params = JSON.parse(stdout)
    return params
}

export async function getConnParams() {
    const activeConn = getActiveConn();
    const connType = getActiveConnType();
    var CONN_PARAMS = [];

    if ((connType == 'postgres') || (connType == 'redshift')) {
        CONN_PARAMS = POSTGRES_PARAMS;
    } else if ((connType == 'snowflake')) {
        CONN_PARAMS = SNOWFLAKE_PARAMS;
    }

    var dbConnParams = {};
    
    if (activeConn.startsWith('(dbfacts)')) {
        let params = dbfactsConn[activeConn]
        // check for both null and undefined
        if (params == null) {
            // reload
            params = parseDbFactsConnection(activeConn)
            dbfactsConn[activeConn] = params
        }
        // load ssl param from config since dbfacts doesn't have ssl
        params['ssl'] = vscode.workspace.getConfiguration(`vscodeSql.connections.${activeConn}`).get('ssl')

        for (let key of CONN_PARAMS) {
            dbConnParams[key] = params[key]
        }
    } else {
        for (let key of CONN_PARAMS) {
            dbConnParams[key] = vscode.workspace.getConfiguration(`vscodeSql.connections.${activeConn}`).get(key)
        }
        dbConnParams['password'] = await keytar.getPassword('vscode.vscode-sql', activeConn)
    }
    
    // console.log('conn params', dbConnParams)
    return dbConnParams
}


export function getConnections() {
    const connections = getAllConns();
    const connIds = Object.keys(connections);

    return connIds
}

export async function selectActiveConn() {
    const connIds = getConnections()
    const selectedConnId = await vscode.window.showQuickPick(
        connIds,
        {
            placeHolder: 'Select active connection.',
            ignoreFocusOut: true
        }
    )

    await vscode.workspace.getConfiguration('vscodeSql').update(
        'activeConnection',
        selectedConnId,
        vscode.ConfigurationTarget.Global
    )

    updateStatusBar()
}



export async function importConnFromDbfacts() {
    var connId = await vscode.window.showInputBox({
        placeHolder: 'Enter db-facts connection name',
        validateInput: validateStr
    })
    
    connId = '(dbfacts)' + connId
    const params = parseDbFactsConnection(connId)
    var connection = {
        'type': params['type'],
    }

    if ((params['type'] == 'postgres') || (params['type'] == 'redshift')) {
        connection['ssl'] = await sslPicker()
    }    
    
    await saveConn(connId, connection)
}

export async function addConn() {
    var connId = await vscode.window.showInputBox({
        placeHolder: 'Enter new connection name (or existing connection to overwrite)',
        validateInput: validateStr
    })

    const connType = await vscode.window.showQuickPick(
        CONN_TYPE,
        {
            placeHolder: 'Select connection type',
            ignoreFocusOut: true
        }
    )

    var connection = {
        "type": connType
    }

    if ((connType == 'postgres') || (connType == 'redshift')) {
        for (let key of POSTGRES_PARAMS) {
            if (key == 'ssl') {
                connection['ssl'] = await sslPicker()
            } else {
                let value = await vscode.window.showInputBox({
                    placeHolder: `Enter ${key}`,
                    ignoreFocusOut: true,
                    password: key == 'password'
                })
                if (key == 'password') {
                    await keytar.setPassword('vscode.vscode-sql', connId, value)
                } else {
                    connection[key] = value
                }
            }
        }        
    } else if ((connType == 'snowflake')) {
        for (let key of SNOWFLAKE_PARAMS) {
            let value = await vscode.window.showInputBox({
                placeHolder: `Enter ${key}`,
                ignoreFocusOut: true,
                password: key == 'password'
            });
            if (key == 'password') {
                await keytar.setPassword('vscode.vscode-sql', connId, value);
            } else {
                connection[key] = value;
            }
        }
    }

    await saveConn(connId, connection)
}

async function sslPicker(){
    // Show picker for enabling SSL in pg client
    let sslSelection = await vscode.window.showQuickPick(
        [
            'Yes (recommended)',
            'No'
        ],
        {
            placeHolder: `Enable SSL?`,
            ignoreFocusOut: true,
        }
    )
    let sslFlag = true
    if (sslSelection == 'No') {
        sslFlag = false
    }
    // Ref: https://github.com/brianc/node-postgres/issues/2009
    let sslConfig = {
        "require": sslFlag,
        "rejectUnauthorized": false,
    }

    return sslConfig
}

async function saveConn(connId: string, connection: any) {
    var allConnections = getAllConns()
    allConnections[connId] = connection

    await vscode.workspace.getConfiguration('vscodeSql').update(
        'connections',
        allConnections,
        vscode.ConfigurationTarget.Global
    )

    await selectActiveConn()
}

export async function deleteConn() {
    const connIds = getConnections()
    const selectedConnId = await vscode.window.showQuickPick(
        connIds,
        {
            placeHolder: 'Select connection to delete.',
            ignoreFocusOut: true
        }
    )
    
    const curConnections = getAllConns();
    
    // VSCode configuration object property cannot be deleted so
    // we can't just use delete curConnections[selectedConnId]
    
    var updatedConnections = {}
    for (let connId of Object.keys(curConnections)) {
        if (connId != selectedConnId) {
            updatedConnections[connId] = curConnections[connId]
        }
    }
    console.log(curConnections)
    console.log(updatedConnections)

    await vscode.workspace.getConfiguration('vscodeSql').update(
        'connections',
        updatedConnections,
        vscode.ConfigurationTarget.Global
    )

    await keytar.deletePassword('vscode.vscode-sql', selectedConnId)

    await selectActiveConn()
}

function configureStatusBar() {
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    myStatusBarItem.tooltip = 'Select active vscode-sql connection'
    myStatusBarItem.command = 'vscode-sql.selectActiveConnection'
    updateStatusBar()
    myStatusBarItem.show()
}

function updateStatusBar() {
    const activeConn = getActiveConn()
    myStatusBarItem.text = `$(database) ${activeConn}`
}
