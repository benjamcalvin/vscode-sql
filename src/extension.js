"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
var AWS = require("aws-sdk");
var athena_1 = require("./athena");
var query_1 = require("./query");
var utils_1 = require("./utils");
AWS.config.update({
    region: 'us-east-1'
});
function runSQLTable() {
    return __awaiter(this, void 0, void 0, function () {
        var editor, document_1, selection, selectionText, queryList, n_queries_1, queries, i, results, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    editor = vscode.window.activeTextEditor;
                    if (!editor) return [3 /*break*/, 4];
                    document_1 = editor.document;
                    selection = editor.selection;
                    selectionText = document_1.getText(selection);
                    queryList = utils_1.parse_queries(selectionText);
                    n_queries_1 = queryList.length;
                    queries = [];
                    for (i = 0; i < n_queries_1; i++) {
                        queries.push(new query_1.Query(queryList[i], editor, i + 1));
                    }
                    editor.edit(function (editBuilder) {
                        for (var i = 0; i < n_queries_1; i++) {
                            editBuilder.insert(queries[i].endPosition, queries[i].timestamp);
                        }
                    });
                    results = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < n_queries_1)) return [3 /*break*/, 4];
                    // This expects a tuple of results [columns, values] where columns is
                    // a 1-dimensional array of column names and values is a 2-dimensional
                    // array of rows, and columns respectively.
                    _b = (_a = results).push;
                    return [4 /*yield*/, athena_1.runAthenaQuery(queries[i].text)];
                case 2:
                    // This expects a tuple of results [columns, values] where columns is
                    // a 1-dimensional array of column names and values is a 2-dimensional
                    // array of rows, and columns respectively.
                    _b.apply(_a, [_c.sent()]);
                    editor.edit(function (editBuilder) {
                        editBuilder.replace(queries[i].getTimestampSelection(), queries[i].format_table(results[i]));
                    });
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function runSQLHistogram() {
    return __awaiter(this, void 0, void 0, function () {
        var editor, document_2, selection, selectionText, queryList, n_queries_2, queries, i, results, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    editor = vscode.window.activeTextEditor;
                    if (!editor) return [3 /*break*/, 4];
                    document_2 = editor.document;
                    selection = editor.selection;
                    selectionText = document_2.getText(selection);
                    queryList = utils_1.parse_queries(selectionText);
                    n_queries_2 = queryList.length;
                    queries = [];
                    for (i = 0; i < n_queries_2; i++) {
                        queries.push(new query_1.Query(queryList[i], editor, i + 1));
                    }
                    editor.edit(function (editBuilder) {
                        for (var i = 0; i < n_queries_2; i++) {
                            editBuilder.insert(queries[i].endPosition, queries[i].timestamp);
                        }
                    });
                    results = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < n_queries_2)) return [3 /*break*/, 4];
                    // This expects a tuple of results [columns, values] where columns is
                    // a 1-dimensional array of column names and values is a 2-dimensional
                    // array of rows, and columns respectively.
                    _b = (_a = results).push;
                    return [4 /*yield*/, athena_1.runAthenaQuery(queries[i].text)];
                case 2:
                    // This expects a tuple of results [columns, values] where columns is
                    // a 1-dimensional array of column names and values is a 2-dimensional
                    // array of rows, and columns respectively.
                    _b.apply(_a, [_c.sent()]);
                    editor.edit(function (editBuilder) {
                        editBuilder.replace(queries[i].getTimestampSelection(), queries[i].format_histogram(results[i]));
                    });
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function () {
        var disposable_table, disposable_histogram;
        return __generator(this, function (_a) {
            // Use the console to output diagnostic information (console.log) and errors (console.error)
            // This line of code will only be executed once when your extension is activated
            console.log('Congratulations, your extension "vscode-sql" is now active!');
            disposable_table = vscode.commands.registerCommand('vscode-sql.executeSQLTable', runSQLTable);
            disposable_histogram = vscode.commands.registerCommand('vscode-sql.executeSQLHistogram', runSQLHistogram);
            context.subscriptions.push(disposable_table);
            context.subscriptions.push(disposable_histogram);
            return [2 /*return*/];
        });
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
