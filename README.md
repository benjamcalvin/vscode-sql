# vscode-sql

This is a plugin to facilitate interactive EDA using SQL.

## Features

### Running a Query
Vscode-sql runs highlighted queries in the background and inserts the results inline. You can do this by hilighting a query (or queries) and using the command pallet `Execute SQL command` or pressing `shift+enter`.

![Running a Query](example_query.gif)

## Installation

### Rebuilding:
1. Navigate into the `vscode-sql` directory.
2. Make sure `vsce` is installed:
```bash
npm install -g vsce
```
3. Package the package:
```bash
vsce package --baseImagesUrl https://github.com/benjamcalvin/vscode-sql/blob/main/
```
4. Install the .vslx file that is generated (`vscode-sql-x.x.x.vslx`) using the `Install from VSLX` option.

For more information, see: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## Known Issues

### Leaving the Tab
If you leave the tab to go to another tab (you *can* switch to a different window), you'll get this error and the query will fail to insert when it's done.

```
rejected promise not handled within 1 second: Error: TextEditor#edit not possible on closed editors
stack trace: Error: TextEditor#edit not possible on closed editors
	at t.ExtHostTextEditor.edit (/home/ubuntu/.vscode-server/bin/93c2f0fbf16c5a4b10e4d5f89737d9c2c25488a3/out/vs/server/remoteExtensionHostProcess.js:672:475)
	at /home/ubuntu/repos/vscode-sql/out/extension.js:46:24
	at Generator.next (<anonymous>)
	at fulfilled (/home/ubuntu/repos/vscode-sql/out/extension.js:5:58)
	at runMicrotasks (<anonymous>)
	at processTicksAndRejections (internal/process/task_queues.js:94:5)
```

## Release Notes

### 0.0.1

Minimum functionality. Uses the AWS Athena Javascript SDK to run queries.

**Enjoy!**