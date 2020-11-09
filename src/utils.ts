export function wait(ms: number){
    // Synchronous wait for a number of milliseconds.
	var start = new Date().getTime();
	var end = start;
	while(end < start + ms) {
	  end = new Date().getTime();
   }
 }

export function current_timestamp(query_num: number) {
     // Return a string with the current timestamp.
	return '\n\nQuery '+ String(query_num) + ' run at: '+String(Date.now())
}

export function trim_query(query: string) {
	const query_start_regex = /[Ss][Ee][Ll][Ee][Cc][Tt]/;
	var query_start = query.search(query_start_regex);
	return query.substring(query_start);
}


export function parse_queries(query: string, includeComments=false) {
	// Parses query and returns list of queries to be executed.
	// include comments in the list if includeComments is true
	
	const commands = [
		"select",
		"drop",
		"create",
		"grant",
		"update",
		"alter",
		"insert",
		"copy",
		"with",
		"delete"
	]

	var patterns = []

	// Use lazy quantifier ? to find the query ending as early as possible
	// https://javascript.info/regexp-greedy-and-lazy
	for (let cmd of commands) {
		patterns.push(`(${cmd}.*?;)`)
	}

	if (includeComments) {
		// single line comment
		patterns.push("(--.*?\n)")
		// multiline comment
		patterns.push("(/\\*.*?\\*/)")
	}
	
	// Regex flags: global (g), case insensitive(i), and include spaces/tabs/new lines (s)
	const patternRegExp = new RegExp(patterns.join("|"), "gis")
	const parsed_queries = query.match(patternRegExp)
	// console.log(parsed_queries)
	return parsed_queries
}

export function getNthColumn(table: any, n: number) {
	var col = [];
	for (var i = 0; i < table.length; i++) {
		col.push(table[i][n])
	}

	return col
}