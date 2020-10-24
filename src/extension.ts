// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';
import { DataFrame } from 'dataframe-js';
import { listColumns, listDatabases, listTables, runAthenaQuery } from './athena';
import { runSnowflakeQuery,  createConnection } from './snowflake'
import { Query } from './query';
import { parse_queries } from './utils';
import { countReset } from 'console';

AWS.config.update({
	region: 'us-east-1'
});

const process = require('process');
let account = process.env.SNOWFLAKE_ACCOUNT
let user = process.env.SNOWFLAKE_USER
let password = process.env.SNOWFLAKE_PASSWORD

let connection = createConnection(account, user, password)

async function runSQLTable(database) {

	// Get active text editor
	let editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;
		const selection = editor.selection;
		const selectionText = document.getText(selection);
		const queryList = parse_queries(selectionText);
		const n_queries = queryList.length;
		var queries: Query[] = [];

		for (var i = 0; i < n_queries; i++) {
			queries.push(new Query(queryList[i], editor, i+1));
		}

		editor.edit(editBuilder => {
			for (var i=0; i < n_queries; i++) {
				editBuilder.insert(queries[i].endPosition, queries[i].timestamp);
			}
		})

		var results: DataFrame[] = [];
		for (var i = 0; i < n_queries; i++) {
			// This expects a tuple of results [columns, values] where columns is
			// a 1-dimensional array of column names and values is a 2-dimensional
            // array of rows, and columns respectively.
            if (database === 'Athena'){
                results.push(await runAthenaQuery(queries[i].text));
            }else if (database === 'Snowflake'){
                results.push(await runSnowflakeQuery(connection, queries[i].text));
            }else{
                console.log("error")
            }
			results.push(await runSnowflakeQuery(connection, queries[i].text));
			editor.edit(editBuilder => {
				editBuilder.replace(
					queries[i].getTimestampSelection(),
					queries[i].format_table(results[i])
				)
			})
		}
	}

}

async function runSQLHistogram() {
	// Get active text editor
	let editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;
		const selection = editor.selection;
		const selectionText = document.getText(selection);
		const queryList = parse_queries(selectionText);
		const n_queries = queryList.length;
		var queries: Query[] = [];

		for (var i = 0; i < n_queries; i++) {
			queries.push(new Query(queryList[i], editor, i+1));
		}

		editor.edit(editBuilder => {
			for (var i=0; i < n_queries; i++) {
				editBuilder.insert(queries[i].endPosition, queries[i].timestamp);
			}
		})

		var results: DataFrame[] = [];
		for (var i = 0; i < n_queries; i++) {
			// This expects a tuple of results [columns, values] where columns is
			// a 1-dimensional array of column names and values is a 2-dimensional
			// array of rows, and columns respectively.
			results.push(await runAthenaQuery(queries[i].text));

			editor.edit(editBuilder => {
				editBuilder.replace(
					queries[i].getTimestampSelection(),
					queries[i].format_histogram(results[i])
				)
			})
		}
	}

}

async function getTables() {

	const databases = await listDatabases();
	console.log(databases);
	const schema = await vscode.window.showQuickPick(databases);

	const tables = await listTables(schema);
	const table = await vscode.window.showQuickPick(tables);

	const editor = vscode.window.activeTextEditor;
	const selections = editor.selections;

	if (editor) {
		editor.edit(editBuilder => {
			for (var i = 0; i < selections.length; i++) {
				editBuilder.replace(selections[i], schema+"."+table);
			}
		})
	};
}

async function findColumn() {

	const editor = vscode.window.activeTextEditor;
	const selections = editor.selections;

	if (editor) {
		const databases = await listDatabases();
		console.log(databases);
		const schema = await vscode.window.showQuickPick(databases);

		const tables = await listTables(schema);
		const table = await vscode.window.showQuickPick(tables);
		const columns = await listColumns(schema, table);

		const column = await vscode.window.showQuickPick(columns);

		if (editor) {
			editor.edit(editBuilder => {
				for (var i = 0; i < selections.length; i++) {
					editBuilder.replace(selections[i], column);
				}
			})
		};
	}
}

async function getColumns() {

	const editor = vscode.window.activeTextEditor;
	const selections = editor.selections;

	if (editor) {

		const databases = await listDatabases();
		console.log(databases);
		const schema = await vscode.window.showQuickPick(databases);

		const tables = await listTables(schema);
		const table = await vscode.window.showQuickPick(tables);
		const columns = await listColumns(schema, table);

		if (editor) {
			editor.edit(editBuilder => {
				for (var i = 0; i < selections.length; i++) {
					editBuilder.replace(selections[i], columns.join(',\n'));
				}
			})
		};
	}
}





// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-sql" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
    let disposable_table = vscode.commands.registerCommand('vscode-sql.executeSQLTable', runSQLTable, 'Athena');
    let disposable_table_snowflake = vscode.commands.registerCommand('vscode-sql.executeSnowflake', runSQLTable, 'Snowflake');
	let disposable_histogram = vscode.commands.registerCommand('vscode-sql.executeSQLHistogram', runSQLHistogram);
	let disposable_tables = vscode.commands.registerCommand('vscode-sql.getTables', getTables)
	let disposable_find_column = vscode.commands.registerCommand('vscode-sql.findColumn', findColumn)
	let disposable_get_columns = vscode.commands.registerCommand('vscode-sql.getColumns', getColumns)


    context.subscriptions.push(disposable_table);
    context.subscriptions.push(disposable_table_snowflake)
	context.subscriptions.push(disposable_histogram);
	context.subscriptions.push(disposable_tables);
	context.subscriptions.push(disposable_find_column);
	context.subscriptions.push(disposable_get_columns);
}

// this method is called when your extension is deactivated
export function deactivate() {}

