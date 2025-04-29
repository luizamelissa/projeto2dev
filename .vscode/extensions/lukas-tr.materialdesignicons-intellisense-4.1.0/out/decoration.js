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
exports.DecorationProvider = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const change_case_1 = require("change-case");
class DecorationProvider {
    constructor(config, manager) {
        this.config = config;
        this.manager = manager;
        this.timeout = undefined;
        this.activeEditor = vscode.window.activeTextEditor;
        this.iconDecoration = vscode.window.createTextEditorDecorationType({
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
            before: {
                margin: this.config.decoration.margin,
                height: this.config.decoration.size,
                width: this.config.decoration.size,
            },
        });
    }
    register() {
        this.activeEditor = vscode.window.activeTextEditor;
        const subscriptions = [];
        if (this.activeEditor) {
            this.triggerUpdateDecorations();
        }
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            this.activeEditor = editor;
            if (editor) {
                this.triggerUpdateDecorations();
            }
        }, null, subscriptions);
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.activeEditor &&
                event.document === this.activeEditor.document) {
                this.triggerUpdateDecorations();
            }
        }, null, subscriptions);
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("materialdesigniconsIntellisense.enableDecorations") ||
                event.affectsConfiguration("materialdesigniconsIntellisense.iconColor")) {
                this.triggerUpdateDecorations();
            }
            if (event.affectsConfiguration("materialdesigniconsIntellisense.decoration.size") ||
                event.affectsConfiguration("materialdesigniconsIntellisense.decoration.margin")) {
                vscode.window.showInformationMessage("materialdesigniconsIntellisense.decoration change takes affect after the next restart of code");
            }
        }, null, subscriptions);
        return subscriptions;
    }
    updateDecorations() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.activeEditor) {
                return;
            }
            if (!this.config.enableDecorations) {
                this.activeEditor.setDecorations(this.iconDecoration, []); // clear existing decorations
                return;
            }
            const decorationsArr = [];
            for (const matcher of this.config.matchers) {
                const regex = (0, util_1.matcherStringToRegex)(matcher.match);
                if (!regex)
                    continue;
                const regEx = regex.fullRegex;
                const text = this.activeEditor.document.getText();
                let match;
                while ((match = regEx.exec(text))) {
                    const paramItemName = (0, change_case_1.paramCase)(((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.icon) || "");
                    const item = yield this.manager.getIcon(paramItemName);
                    if (item) {
                        decorationsArr.push({
                            range: new vscode.Range(this.activeEditor.document.positionAt(match.index), this.activeEditor.document.positionAt(match.index + match[0].length)),
                            renderOptions: {
                                before: {
                                    contentIconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${encodeURI(item.getDecorationIcon(this.config.iconColor))}`),
                                },
                            },
                        });
                    }
                }
            }
            this.activeEditor.setDecorations(this.iconDecoration, decorationsArr);
        });
    }
    triggerUpdateDecorations() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = setTimeout(() => this.updateDecorations(), 500);
    }
}
exports.DecorationProvider = DecorationProvider;
//# sourceMappingURL=decoration.js.map