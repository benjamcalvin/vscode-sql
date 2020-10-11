// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';
import { DataFrame } from 'dataframe-js';
import { runAthenaQuery } from './athena';
import { Query } from './query';
import { parse_queries } from './utils';
import { countReset } from 'console';

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

			results.push(await runAthenaQuery(queries[i].text));
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

	context.subscriptions.push(disposable_table);
	context.subscriptions.push(disposable_histogram);
}

// this method is called when your extension is deactivated
export function deactivate() {}

