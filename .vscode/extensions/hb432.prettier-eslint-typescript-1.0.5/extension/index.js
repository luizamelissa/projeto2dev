const eslint = require('eslint');
const prettier = require('prettier');
const vscode = require('vscode');

const min = new vscode.Position(0, 0);
const output = vscode.window.createOutputChannel('Prettier ESLint Typescript Formatter');

vscode.languages.registerDocumentFormattingEditProvider([ 'typescript', 'javascript' ], {
   async provideDocumentFormattingEdits (document) {
      output.hide();
      output.clear();
      const config = vscode.workspace.getConfiguration('prettier-eslint-typescript');
      try {
         const text = prettier.format(
            document.getText(),
            Object.assign({ parser: 'typescript' }, config.get('prettierOptions') || {})
         );
         const [ result ] = await new eslint.ESLint({
            fix: true,
            baseConfig: Object.assign(
               {
                  parser: `${__dirname}/node_modules/@typescript-eslint/parser`
               },
               config.get('eslintConfig') || {}
            )
         }).lintText(text);
         if (result.errorCount > result.fixableErrorCount) {
            throw { message: JSON.stringify(result) };
         } else {
            return [
               vscode.TextEdit.replace(
                  new vscode.Range(
                     min,
                     new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).text.length)
                  ),
                  result.output || text
               )
            ];
         }
      } catch (error) {
         output.append(error.message);
         output.show();
      }
   }
});
