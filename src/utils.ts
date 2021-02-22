import { window, Disposable } from 'vscode';

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
	return '\n\nQuery ' + String(query_num) + ' run at: ' + new Date().toString()
}

// TODO: remove this function??
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
		"delete",
		"explain",
		"cancel"
	]

	var patterns = []

	// Use lazy quantifier ? to find the query ending as early as possible
	// https://javascript.info/regexp-greedy-and-lazy
	for (let cmd of commands) {
		patterns.push(`(${cmd}\\b.*?;)`)
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

export async function fuzzyQuickPick(selections: string[]) {
	// Extend the default quickPick function to allow fuzzy search when space is used
	// Adapted from https://github.com/microsoft/vscode-extension-samples/blob/master/quickinput-sample/src/quickOpen.ts
	const disposables: Disposable[] = [];
	const allSelections = selections.map(label => ({ label }))
	try {
		return await new Promise<string | undefined>((resolve, reject) => {
			const fuzzyPick = window.createQuickPick()
			fuzzyPick.ignoreFocusOut = true
			fuzzyPick.matchOnDescription = true
			fuzzyPick.items = allSelections
			disposables.push(
				fuzzyPick.onDidChangeValue(value => {
					let alphaNumericList = value.replace(/\W/gi, '').split('')
					let pattern = alphaNumericList.join('.*')
					let regex = new RegExp(pattern)
					var updatedSelections = []
					
					for (let item of allSelections) {
						if (regex.test(item.label)) {
							updatedSelections.push({
								'label': item.label,
								'description': value
							})
						}
					}
					fuzzyPick.items = updatedSelections

				}),
				fuzzyPick.onDidChangeSelection(items => {
					resolve(items[0].label)
					fuzzyPick.hide()
				}),
				fuzzyPick.onDidHide(() => {
					resolve(undefined);
					fuzzyPick.dispose();
				})
			)
			fuzzyPick.show();
		})
	} finally {
		disposables.forEach(d => d.dispose());
	}
}