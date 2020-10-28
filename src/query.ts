import * as vscode from 'vscode';
import { current_timestamp, trim_query, wait } from "./utils";
var AsciiTable = require('ascii-table');
var bars = require('bars');


export class Query {
	query_num: number;
	text: string;
	document: vscode.TextDocument;
	startCharacterNumber: number;
	endCharacterNumber: number;
	endPosition: vscode.Position;
	timestamp: string;

	constructor(query_text: string, editor: vscode.TextEditor, query_num: number) {
		// Clean up Query Text (remove stuff before the query)
		this.text = trim_query(query_text);
		// Store query number:
		this.query_num = query_num;
		// Save Document
		this.document = editor.document;

		// Get start and end character of query.
		const documentText = this.document.getText();
		this.startCharacterNumber = documentText.indexOf(this.text);
		this.endCharacterNumber = this.startCharacterNumber + this.text.length;

		// Get vscode "Position" (line number, character number), 0-indexed
		const truncated_document = documentText.substring(0, this.endCharacterNumber);
		const lines = truncated_document.split('\n');
		const n_lines = lines.length;
		const n_chars = lines[n_lines - 1].length;
		this.endPosition = new vscode.Position(n_lines - 1, n_chars + 1);

		// Get timestamp:
		this.timestamp = current_timestamp(this.query_num);

	}

	getTimestampSelection() {
		const documentText = this.document.getText();

		// Find Start and End Character:
		const startCharacterNumber = documentText.indexOf(this.timestamp);
		const endCharacterNumber = startCharacterNumber + this.timestamp.length;

		// Get vscode "Position" (line number, character number), 0-indexed
		const truncated_document = documentText.substring(0, endCharacterNumber);
		const lines = truncated_document.split('\n');
		const n_lines = lines.length;
		const n_chars = lines[n_lines - 1].length;
		const startPosition = new vscode.Position(n_lines - 1, n_chars - ( this.timestamp.length - 2) ); // -2 is to remove the two newlines in the timestamp...
		const endPosition = new vscode.Position(n_lines - 1, n_chars + 1);
		return new vscode.Selection(startPosition, endPosition)
    }

    format_table(values: any) {
        console.log(values)
        if (typeof(values) == 'string') {
            return values;
        }

        var arr = values.map(function(inp) {
            return Object.keys(inp).map(function(key) {
              return inp[key];
            })
        });

        const keys = Object.keys(values[0]);
        // var table = new AsciiTable.factory({
        //     heading: values[0],
        //     rows: values[1]
        // });
        console.log(arr)
        var table = new AsciiTable()
        table.addRowMatrix(arr)
        table.setHeading(keys)
        table.setBorder('|', '-', ' ', ' ');

        return table.render()

        // table = table.toString();
        // table = table.split('\n');
        // var cleaned_table = [];
        // for (var i = 1; i < table.length - 1; i++) {
        //     if (i != 2) {
        //         cleaned_table.push(table[i].substring(1, table[i].length - 2));
        //     }
        // }
        // return cleaned_table.join("\n")
    }

    format_histogram(values: any) {

        if (typeof(values) == 'string') {
            return values;
        }

        try {
            const columns: any[] = values[0];
            const contents: any[] = values[1];
            console.log(contents);
            const n_cols: number = contents[0].length;
            console.log("N cols", n_cols);
            console.log("N rows", contents.length);

            var bar_contents: any = {};

            for (var i = 0; i < contents.length; i++ ) {
                console.log(i)
                console.log(contents[i])
                console.log(contents[i].slice(0, n_cols-1).join (' '))
                bar_contents[contents[i].slice(0, n_cols-1).join (' ')] = contents[i][n_cols-1]
            }
            console.log(bar_contents);
            console.log(bars(bar_contents));

            return bars(bar_contents)
        } catch (err) {
            return err.stack
        }
    }




}
