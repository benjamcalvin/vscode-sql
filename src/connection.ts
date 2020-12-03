// Functions for getting or adding database connection

import * as vscode from 'vscode';
import CryptoTS = require("crypto-ts");
import crypto = require("crypto");
import keytar = require('keytar');
import cp = require('child_process');
import os = require('os');

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
    let homedir = os.homedir();

    const stdout = cp.execSync(cmd, { 'cwd': homedir}).toString()
    const params = JSON.parse(stdout) 
    return params
}

export async function getPostgresParams() {
    const activeConn = getActiveConn();
    var dbConnParams = {};
    if (activeConn.startsWith('(dbfacts)')) {
        let dbfactsParams = parseDbFactsConnection(activeConn)
        for (let key of POSTGRES_PARAMS) {
            dbConnParams[key] = dbfactsParams[key]
        }
        
    } else {
        for (let key of POSTGRES_PARAMS) {
            dbConnParams[key] = vscode.workspace.getConfiguration(`vscodeSql.connections.${activeConn}`).get(key)
        }
        dbConnParams['password'] = await decrypt(dbConnParams['password'])
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

export async function addConn() {
    const dbfactsFlag = await vscode.window.showQuickPick([
        'Import connection from dbfacts',
        'Create new connection'
    ])

    var connId = await vscode.window.showInputBox({
        placeHolder: 'Enter connection name (or overwrite an existing connection)',
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
    
    if (dbfactsFlag == 'Import connection from dbfacts') {
        connId = '(dbfacts)' + connId
        try {
            // Test if connId is a valid dbfacts name
            parseDbFactsConnection(connId)
        } catch(e) {
            console.log(e)
            throw new Error('Invalid connection. ' + e)
        }
    } else {
        if ((connType == 'postgres') || (connType == 'redshift')) {
            for (let key of POSTGRES_PARAMS) {
                let value = await vscode.window.showInputBox({
                    placeHolder: `Enter ${key}`,
                    ignoreFocusOut: true,
                    password: key == 'password'
                })
                if (key == 'password') {
                    connection[key] = await encrypt(value)
                } else {
                    connection[key] = value
                }
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
    myStatusBarItem.text = `$(database) ${activeConn}`
}


async function getKey() {
    var randKey = await keytar.getPassword('vscode.vscode-sql', 'vscode-sql')
    if (randKey === null) {
        // create new key on the first run
        randKey = crypto.randomBytes(20).toString('hex');
        await keytar.setPassword('vscode.vscode-sql', 'vscode-sql', randKey)
    }
    return randKey
}

async function encrypt(s: string) {
    const key = await getKey()
    return CryptoTS.AES.encrypt(s, key).toString()
}

async function decrypt(s: string) {
    const key = await getKey()
    return CryptoTS.AES.decrypt(s, key).toString(CryptoTS.enc.Utf8)
}