"use strict";
exports.__esModule = true;
exports.parse_queries = exports.trim_query = exports.current_timestamp = exports.wait = void 0;
function wait(ms) {
    // Synchronous wait for a number of milliseconds.
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}
exports.wait = wait;
function current_timestamp(query_num) {
    // Return a string with the current timestamp.
    return '\n\nQuery ' + String(query_num) + ' run at: ' + String(Date.now());
}
exports.current_timestamp = current_timestamp;
function trim_query(query) {
    var query_start_regex = /[Ss][Ee][Ll][Ee][Cc][Tt]/;
    var query_start = query.search(query_start_regex);
    return query.substring(query_start);
}
exports.trim_query = trim_query;
function parse_queries(query) {
    // Parses query and returns list of queries to be executed.
    var queries = query.split(';');
    var parsed_queries = [];
    var query_start_regex = /[Ss][Ee][Ll][Ee][Cc][Tt]/;
    for (var i = 0; i < queries.length; i++) {
        var query_start = queries[i].search(query_start_regex);
        console.log(query_start);
        if (query_start >= 0) {
            parsed_queries.push(queries[i].substring(query_start));
        }
    }
    return parsed_queries;
}
exports.parse_queries = parse_queries;
