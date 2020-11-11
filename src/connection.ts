// Functions for getting or adding database connection

import * as vscode from 'vscode';
import CryptoTS = require("crypto-ts");

const CONN_TYPE = [
    'athena',
    'bigquery',
    'postgres',
    'redshift'
]

const POSTGRES_PARAMS = [
    "host",
    "port",
    "database",
    "user",
    "password"
]

// Create status bar item showing current active connection
let myStatusBarItem: vscode.StatusBarItem
configureStatusBar()

function getActiveConn() {
    return vscode.workspace.getConfiguration('vscodeSql').get("activeConnection")
}

function getAllConns() {
    return vscode.workspace.getConfiguration('vscodeSql').get("connections")
}

function validateStr(s: string) {
    // Check if string only contains alphanumeric
    let pattern = /^[0-9a-zA-Z_]+$/
    if (s.match(pattern)) {
        return null
    } else {
        return 'Only alphanumeric and underscore allowed'
    }
}

export function getActiveConnType() {
    const activeConn = getActiveConn();
    const activeConnectionType = vscode.workspace.getConfiguration(`vscodeSql.connections.${activeConn}`).get("type");
    return activeConnectionType
}

export function getPostgresParams() {
    const activeConn = getActiveConn();
    var dbConnParams = {};

    for (let key of POSTGRES_PARAMS) {
        dbConnParams[key] = vscode.workspace.getConfiguration(`vscodeSql.connections.${activeConn}`).get(key)
    }
    dbConnParams['password'] = decrypt(dbConnParams['password'])

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

export async function addConn() {
    const connId = await vscode.window.showInputBox({
        placeHolder: 'Enter new connection name (no space or special characters). Or overwrite an existing connection.',
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
            let value = await vscode.window.showInputBox({
                placeHolder: `Enter ${key}`,
                ignoreFocusOut: true,
                password: key == 'password'
            })
            if (key == 'password') {
                connection[key] = encrypt(value)
            } else {
                connection[key] = value
            }
        }
    }

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
    myStatusBarItem.text = `$(pulse) vs-sql: ${activeConn}`
}

function encrypt(s: string) {
    // 4 random words
    return CryptoTS.AES.encrypt(s, 'eachstuffamountproof').toString();
}

function decrypt(s: string) {
    return CryptoTS.AES.decrypt(s, 'eachstuffamountproof').toString(CryptoTS.enc.Utf8)
}