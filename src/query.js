"use strict";
exports.__esModule = true;
exports.Query = void 0;
var vscode = require("vscode");
var utils_1 = require("./utils");
var AsciiTable = require('ascii-table');
var bars = require('bars');
var Query = /** @class */ (function () {
    function Query(query_text, editor, query_num) {
        // Clean up Query Text (remove stuff before the query)
        this.text = utils_1.trim_query(query_text);
        // Store query number:
        this.query_num = query_num;
        // Save Document
        this.document = editor.document;
        // Get start and end character of query.
        var documentText = this.document.getText();
        this.startCharacterNumber = documentText.indexOf(this.text);
        this.endCharacterNumber = this.startCharacterNumber + this.text.length;
        // Get vscode "Position" (line number, character number), 0-indexed
        var truncated_document = documentText.substring(0, this.endCharacterNumber);
        var lines = truncated_document.split('\n');
        var n_lines = lines.length;
        var n_chars = lines[n_lines - 1].length;
        this.endPosition = new vscode.Position(n_lines - 1, n_chars + 1);
        // Get timestamp: 
        this.timestamp = utils_1.current_timestamp(this.query_num);
    }
    Query.prototype.getTimestampSelection = function () {
        var documentText = this.document.getText();
        // Find Start and End Character:
        var startCharacterNumber = documentText.indexOf(this.timestamp);
        var endCharacterNumber = startCharacterNumber + this.timestamp.length;
        // Get vscode "Position" (line number, character number), 0-indexed
        var truncated_document = documentText.substring(0, endCharacterNumber);
        var lines = truncated_document.split('\n');
        var n_lines = lines.length;
        var n_chars = lines[n_lines - 1].length;
        var startPosition = new vscode.Position(n_lines - 1, n_chars - (this.timestamp.length - 2)); // -2 is to remove the two newlines in the timestamp...
        var endPosition = new vscode.Position(n_lines - 1, n_chars + 1);
        return new vscode.Selection(startPosition, endPosition);
    };
    Query.prototype.format_table = function (values) {
        if (typeof (values) == 'string') {
            return values;
        }
        var table = new AsciiTable.factory({
            heading: values[0],
            rows: values[1]
        });
        table.setBorder('|', '-', ' ', ' ');
        table = table.toString();
        table = table.split('\n');
        var cleaned_table = [];
        for (var i = 1; i < table.length - 1; i++) {
            if (i != 2) {
                cleaned_table.push(table[i].substring(1, table[i].length - 2));
            }
        }
        return cleaned_table.join("\n");
    };
    Query.prototype.format_histogram = function (values) {
        if (typeof (values) == 'string') {
            return values;
        }
        var columns = values[0];
        var contents = values[1];
        console.log(contents);
        var n_cols = contents[0].length;
        console.log(n_cols);
        var bar_contents = {};
        for (var i = 0; i < contents.length; i++) {
            bar_contents[contents[i].slice(0, n_cols - 1).join(' ')] = contents[i][n_cols - 1];
        }
        console.log(bar_contents);
        console.log(bars(bar_contents));
        return bars(bar_contents);
    };
    return Query;
}());
exports.Query = Query;
