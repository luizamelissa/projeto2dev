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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconLint = void 0;
const vscode = require("vscode");
const pm = require("picomatch");
const searchCodeActionCode = 1;
class IconLint {
    constructor(config, manager) {
        this.config = config;
        this.manager = manager;
        this.lintDocument = this.lintDocument.bind(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    }
    getRegex() {
        return this.config.light ? IconLint.LINT_LIGHT_REGEX : IconLint.LINT_REGULAR_REGEX;
    }
    dispose() {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.dispose();
        }
    }
    deleteDiagnostics(document) {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.delete(document.uri);
        }
    }
    lintDocument(document) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.selector.indexOf(document.languageId) === -1) {
                return;
            }
            const ignore = pm(this.config.linter.ignorePaths);
            const curPath = vscode.workspace.asRelativePath(document.fileName);
            if (ignore(curPath)) {
                this.diagnosticCollection.set(document.uri, []);
                return;
            }
            const diagnostics = [];
            let match = null;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                while ((match = this.getRegex().exec(line.text))) {
                    const index = match.index;
                    const length = match[0].length;
                    const iconName = match[2];
                    if (this.config.ignoredIcons.includes(match[0])) {
                        continue;
                    }
                    if (yield this.manager.getIcon(iconName)) {
                        // icon exists, nothing to complain about
                        continue;
                    }
                    const range = new vscode.Range(line.lineNumber, index, line.lineNumber, index + length);
                    const diagnostic = new vscode.Diagnostic(range, `MDI: Icon mdi-${iconName} not found`, vscode.DiagnosticSeverity.Information);
                    diagnostic.code = searchCodeActionCode;
                    diagnostics.push(diagnostic);
                }
            }
            if (this.diagnosticCollection) {
                this.diagnosticCollection.set(document.uri, diagnostics);
            }
        });
    }
    provideCodeActions(document, range, context, token) {
        const diagnostics = context.diagnostics;
        return diagnostics
            .filter(d => d.code === searchCodeActionCode)
            .map((d) => {
            const match = this.getRegex().exec(d.message);
            const iconName = (match && match[2]) || "";
            return {
                title: "Search icon",
                command: "materialdesigniconsIntellisense.performIconSearch",
                arguments: [iconName]
            };
        });
    }
}
exports.IconLint = IconLint;
IconLint.LINT_REGULAR_REGEX = /\bmdi(-|:)((\w|\-)+)\b/gi;
IconLint.LINT_LIGHT_REGEX = /\bmdil(-|:)((\w|\-)+)\b/gi;
//# sourceMappingURL=lint.js.map