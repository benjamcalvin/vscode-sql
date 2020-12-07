// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';
import { DataFrame } from 'dataframe-js';
import { Query } from './query';
import { parse_queries, fuzzyQuickPick } from './utils';
import {
	runQuery,
	listDatabases,
	listTables,
	listColumns
} from './db-selection';
import { selectActiveConn, addConn, deleteConn, importConnFromDbfacts } from './connection'


AWS.config.update({
	region: 'us-east-1'
});

async function runSQLTable() {

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
			results.push(await runQuery(queries[i].text));
			
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
			results.push(await runQuery(queries[i].text));

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
	const schema = await fuzzyQuickPick(databases);
	
	const tables = await listTables(schema);
	const table = await fuzzyQuickPick(tables);

	const editor = vscode.window.activeTextEditor;
	const selections = editor.selections;

	if (editor) {
		editor.edit(editBuilder => {
			for (var i = 0; i < selections.length; i++) {
				editBuilder.replace(selections[i], schema+"."+table);
			}
		}).then(success => {
			// Change the selection: start and end position of the new
			// selection is same, so it is not to select replaced text;
			let postion = editor.selection.end;
			editor.selection = new vscode.Selection(postion, postion);
		})
	};
}

async function findColumn() {

	const editor = vscode.window.activeTextEditor;
	const selections = editor.selections;

	if (editor) {
		const databases = await listDatabases();
		console.log(databases);
		const schema = await fuzzyQuickPick(databases);
		
		const tables = await listTables(schema);
		const table = await fuzzyQuickPick(tables);
		const columns = await listColumns(schema, table);

		const column = await fuzzyQuickPick(columns);
		
		if (editor) {
			editor.edit(editBuilder => {
				for (var i = 0; i < selections.length; i++) {
					editBuilder.replace(selections[i], column);
				}
			}).then(success => {
				let postion = editor.selection.end;
				editor.selection = new vscode.Selection(postion, postion);
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
		const schema = await fuzzyQuickPick(databases);
		
		const tables = await listTables(schema);
		const table = await fuzzyQuickPick(tables);
		const columns = await listColumns(schema, table);
		
		if (editor) {
			editor.edit(editBuilder => {
				for (var i = 0; i < selections.length; i++) {
					editBuilder.replace(selections[i], columns.join(',\n'));
				}
			}).then(success => {
				let postion = editor.selection.end;
				editor.selection = new vscode.Selection(postion, postion);
			})
		};
	}
}

async function clearResults() {
	let editor = vscode.window.activeTextEditor;
	let document = editor.document;
	if (editor) {
		const selection = editor.selection
		const selectionText = document.getText(selection);
		// do not remove comments when clearing results
		var clearedResults = parse_queries(selectionText, true);
		clearedResults.push('') // insert an empty line at the end

		if (editor) {
			editor.edit(editBuilder => {
				editBuilder.replace(selection, clearedResults.join('\n\n'));
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
	let disposable_table = vscode.commands.registerCommand('vscode-sql.executeSQLTable', runSQLTable);
	let disposable_histogram = vscode.commands.registerCommand('vscode-sql.executeSQLHistogram', runSQLHistogram);
	let disposable_tables = vscode.commands.registerCommand('vscode-sql.getTables', getTables)
	let disposable_find_column = vscode.commands.registerCommand('vscode-sql.findColumn', findColumn)
	let disposable_get_columns = vscode.commands.registerCommand('vscode-sql.getColumns', getColumns)
	let disposable_clear_results = vscode.commands.registerCommand('vscode-sql.clearResults', clearResults)
	let disposable_select_active_connection = vscode.commands.registerCommand('vscode-sql.selectActiveConnection', selectActiveConn)
	let disposable_add_connection = vscode.commands.registerCommand('vscode-sql.addConnection', addConn)
	let disposable_delete_connection = vscode.commands.registerCommand('vscode-sql.deleteConnection', deleteConn)
	let disposable_import_connection = vscode.commands.registerCommand('vscode-sql.importConnectionFromDbfacts', importConnFromDbfacts)

	context.subscriptions.push(disposable_table);
	context.subscriptions.push(disposable_histogram);
	context.subscriptions.push(disposable_tables);
	context.subscriptions.push(disposable_find_column);
	context.subscriptions.push(disposable_get_columns);
	context.subscriptions.push(disposable_clear_results);
	context.subscriptions.push(disposable_select_active_connection);
	context.subscriptions.push(disposable_add_connection);
	context.subscriptions.push(disposable_delete_connection);
	context.subscriptions.push(disposable_import_connection);

}

// this method is called when your extension is deactivated
export function deactivate() {}

