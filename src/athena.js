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
exports.runAthenaQuery = void 0;
var AWS = require("aws-sdk");
var dataframe_js_1 = require("dataframe-js");
var utils_1 = require("./utils");
function runAthenaQuery(query) {
    return __awaiter(this, void 0, void 0, function () {
        var startQueryExecutionResponse, queryExecutionId, queryNotDone, getQueryResultsResponse, values, resultSet, rows, df;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, startQueryExecution(query)];
                case 1:
                    startQueryExecutionResponse = _a.sent();
                    queryExecutionId = startQueryExecutionResponse['QueryExecutionId'];
                    queryNotDone = true;
                    _a.label = 2;
                case 2:
                    if (!queryNotDone) return [3 /*break*/, 4];
                    utils_1.wait(1000);
                    return [4 /*yield*/, getQueryResults(queryExecutionId)["catch"](function (err) {
                            console.log(err.message);
                            return err.message;
                        })];
                case 3:
                    getQueryResultsResponse = _a.sent();
                    console.log(getQueryResultsResponse);
                    if (getQueryResultsResponse == "Query has not yet finished. Current state: RUNNING") {
                        console.log("Waiting...", err.message);
                    }
                    else {
                        queryNotDone = false;
                    }
                    return [3 /*break*/, 2];
                case 4:
                    console.log(getQueryResultsResponse);
                    if (typeof (getQueryResultsResponse) != 'string') {
                        resultSet = getQueryResultsResponse['ResultSet'];
                        rows = resultSet['Rows'];
                        // console.log(rows)
                        values = unpackRows(rows);
                        df = new dataframe_js_1.DataFrame(values[1], values[0]);
                    }
                    else {
                        values = getQueryResultsResponse;
                    }
                    return [2 /*return*/, values];
            }
        });
    });
}
exports.runAthenaQuery = runAthenaQuery;
function unpackRows(rows) {
    var string = "";
    var values = [];
    var columns = [];
    for (var i = 0; i < rows.length; i++) {
        if (i == 0) {
            columns = unpackRow(rows[i]);
        }
        else {
            string = string + unpackRow(rows[i]) + "\n";
            values.push(unpackRow(rows[i]));
        }
    }
    return [columns, values];
}
;
function unpackRow(row) {
    var row = row['Data'];
    var values = [];
    var string = "";
    for (var j = 0; j < row.length; j++) {
        string = string + row[j]['VarCharValue'] + ", ";
        values.push(row[j]['VarCharValue']);
    }
    ;
    return values;
}
;
function startQueryExecution(query) {
    return __awaiter(this, void 0, void 0, function () {
        var athena, query_params;
        return __generator(this, function (_a) {
            athena = new AWS.Athena();
            query_params = {
                QueryString: query,
                ResultConfiguration: {
                    OutputLocation: 's3://sandbox-ephemeral-data/queries/'
                }
            };
            return [2 /*return*/, athena.startQueryExecution(query_params).promise()];
        });
    });
}
function getQueryResults(queryExecutionId) {
    return __awaiter(this, void 0, void 0, function () {
        var athena, query_params;
        return __generator(this, function (_a) {
            athena = new AWS.Athena();
            query_params = {
                QueryExecutionId: queryExecutionId
            };
            return [2 /*return*/, athena.getQueryResults(query_params).promise()];
        });
    });
}
