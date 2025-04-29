## Description
This formatter runs your TypeScript (or JavaScript) code through Prettier, then through ESLint. Settings for both formatters can be updated in `settings.json` (global) or `.vscode/settings.json` (per-workspace).

## Settings
### `prettier-eslint-typescript.eslintConfig` *`(object)`*
The options to use with ESLint.

### `prettier-eslint-typescript.prettierOptions` *`(object)`*
The options to use with Prettier.

## Example
`.vscode/settings.json`
```json
{
   "typescript.tsdk": "node_modules/typescript/lib",
   "prettier-eslint-typescript.eslintConfig": {
      "rules": {
         "curly": "error",
         "dot-notation": "error",
         "no-undef-init": "error",
         "no-useless-rename": "error",
         "no-useless-return": "error",
         "no-var": "error",
         "object-shorthand": "error",
         "one-var": [ "error", { "initialized": "never", "uninitialized": "always" } ],
         "prefer-const": "error",
         "prefer-template": "error",
         "array-bracket-spacing": [ "error", "always" ],
         "generator-star-spacing": [ "error", "both" ],
         "space-before-function-paren": [ "error", "always" ],
         "yield-star-spacing": [ "error", "both" ]
      }
   },
   "prettier-eslint-typescript.prettierOptions": {
      "arrowParens": "avoid",
      "bracketSpacing": true,
      "printWidth": 120,
      "quoteProps": "as-needed",
      "singleQuote": true,
      "tabWidth": 3,
      "trailingComma": "none",
      "useTabs": false
   }
}
```
