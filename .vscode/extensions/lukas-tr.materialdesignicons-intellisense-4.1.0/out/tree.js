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
exports.IconTreeDataProvider = void 0;
const vscode = require("vscode");
const __fuse = require("fuse.js");
const types_1 = require("./types");
const util_1 = require("./util");
// `import Fuse from "fuse.js";` doesn't work, even with allowSyntheticDefaultImports
const Fuse = __fuse;
class IconTreeDataProvider {
    constructor(config, manager) {
        this.config = config;
        this.manager = manager;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.getChildrenCalled = 0;
    }
    refresh() {
        this._onDidChangeTreeData.fire(null);
    }
    getTreeItem(element) {
        switch (element.type) {
            case "icon":
                let tooltip = `Aliases: ${element.icon.aliases.join(", ")}\nTags: ${element.icon.tags.join(", ")}`;
                if (element.search && element.search.score) {
                    tooltip += `\n\nMatch score: ${Math.floor((1 - element.search.score) * 100)}%\nMatches: ${element.search.matches}`;
                }
                return {
                    contextValue: "mdiIcon",
                    label: (0, util_1.createCompletion)(element.icon.name, types_1.CompletionType.no),
                    description: element.search
                        ? element.icon.tags.join(", ")
                        : undefined,
                    iconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${element.icon.getRawSvgIcon(this.config.iconColor)}`),
                    command: {
                        command: "materialdesigniconsIntellisense.openIconPreview",
                        arguments: [element],
                        title: "Open icon preview",
                    },
                    tooltip,
                };
            case "tag":
                return {
                    contextValue: "mdiTag",
                    label: element.tag,
                    description: `${element.childCount} icons`,
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                };
            default:
                // search
                return {
                    contextValue: "mdiSearch",
                    label: element.label,
                    description: this.config.lastSearch,
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    command: element.command,
                };
        }
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.manager.getIconList();
            if (element) {
                let filtered = [];
                let children = [];
                if (element.type === "tag") {
                    filtered = [...list].filter((a) => (a.tags.length === 0 && element.tag === "Other") ||
                        a.tags.indexOf(element.tag) !== -1);
                    children = filtered.map((child) => ({
                        type: "icon",
                        icon: child,
                    }));
                }
                if (element.type === "other") {
                    const fuse = new Fuse(list, {
                        isCaseSensitive: false,
                        shouldSort: true,
                        includeMatches: true,
                        includeScore: true,
                        threshold: 0.3,
                        location: 0,
                        distance: 10000,
                        keys: [
                            { name: "name", weight: 0.9 },
                            { name: "aliases", weight: 0.6 },
                            { name: "tags", weight: 0.3 },
                            { name: "codepoint", weight: 0.2 },
                        ],
                        // useExtendedSearch: true, // https://fusejs.io/examples.html#extended-search
                    });
                    const result = fuse.search(this.config.lastSearch);
                    filtered = result.map((r) => r.item);
                    if (!filtered.length) {
                        vscode.window.showWarningMessage(`No icons found matching "${this.config.lastSearch}"`);
                    }
                    children = result.map((child) => {
                        var _a;
                        return ({
                            type: "icon",
                            icon: child.item,
                            search: {
                                score: child.score,
                                matches: (_a = child.matches) === null || _a === void 0 ? void 0 : _a.map((m) => m.value || ""),
                            },
                        });
                    });
                }
                if (element.type === "other") {
                    // dont sort fuse output
                    return children;
                }
                children.sort((a, b) => (a.type === "icon" &&
                    b.type === "icon" &&
                    a.icon.name.localeCompare(b.icon.name)) ||
                    0);
                return children;
            }
            // root
            const tags = {};
            for (const icon of list) {
                if (icon.tags.length) {
                    for (const tag of icon.tags) {
                        if (tags[tag]) {
                            tags[tag]++;
                        }
                        else {
                            tags[tag] = 1;
                        }
                    }
                }
                else {
                    // use tag `Other` if icon has no tags
                    if (!tags["Other"]) {
                        tags["Other"] = 0;
                    }
                    tags["Other"]++;
                }
            }
            const children = Object.entries(tags)
                .map((tag) => ({ type: "tag", tag: tag[0], childCount: tag[1] }))
                .sort((a, b) => a.tag.localeCompare(b.tag));
            const searchResult = {
                type: "other",
                label: "Search results",
            };
            if (this.config.lastSearch) {
                children.unshift(searchResult);
            }
            if (!this.getChildrenCalled) {
                // the view doesn't seem to update the first time `getChildren` gets called; might be a bug in vscode or a change in the api
                this.refresh();
            }
            this.getChildrenCalled++;
            return children;
        });
    }
    getParent(element) {
        return element.type === "tag" || element.type === "other"
            ? null
            : {
                type: "tag",
                tag: element.icon.tags[0],
            };
    }
    provideTextDocumentContent(uri, token) {
        return Promise.resolve("text");
    }
}
exports.IconTreeDataProvider = IconTreeDataProvider;
//# sourceMappingURL=tree.js.map