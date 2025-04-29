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
exports.CompletionProvider = exports.triggerCharacters = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
exports.triggerCharacters = [":", "-", "i", "'", '"', "."];
class CompletionProvider {
    constructor(config, manager) {
        this.config = config;
        this.manager = manager;
    }
    provideCompletionItems(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            let linePrefix = document
                .lineAt(position)
                .text.substr(0, position.character);
            for (const matcher of this.config.matchers) {
                const regex = (0, util_1.matcherStringToRegex)(matcher.match);
                if (!regex)
                    continue;
                const match = linePrefix.match(regex.suggestionPrefixAndIconRegex);
                if (!match || !match.groups) {
                    continue;
                }
                const meta = yield this.manager.getIconList();
                const range = new vscode.Range(position.line, position.character - match.groups.icon.length, position.line, position.character);
                const edits = [];
                if (matcher.insertPrefix) {
                    edits.push(vscode.TextEdit.insert(position.translate(0, -match.length - 1), matcher.insertPrefix));
                }
                const items = meta.flatMap((icon) => (this.config.includeAliases ? icon.aliases : [icon.name]).map((name) => ({
                    _icon: icon,
                    label: (0, util_1.createCompletion)(name, regex.type),
                    kind: vscode.CompletionItemKind.Text,
                    sortText: name,
                    range,
                    insertText: `${(0, util_1.createCompletion)(icon.name, regex.type)}${matcher.insertSuffix || ""}`,
                    additionalTextEdits: edits,
                })));
                return {
                    incomplete: true,
                    items,
                };
            }
            return [];
        });
    }
    resolveCompletionItem(item) {
        return Object.assign(Object.assign({}, item), { documentation: item._icon.getMarkdownPreviewIcon(this.config.iconColor, this.config.iconSize).appendMarkdown(`
- link: ${item._icon.docLink.value}
- aliases: ${item._icon.aliases.join(", ")}
- codepoint: ${item._icon.codepoint}
- author: ${item._icon.author}
- version: ${item._icon.version}`), detail: item._icon.tags.join(", ") });
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completion.js.map