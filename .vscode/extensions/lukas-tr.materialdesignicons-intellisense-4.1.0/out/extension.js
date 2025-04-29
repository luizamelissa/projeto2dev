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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const Configuration_1 = require("./Configuration");
const tree_1 = require("./tree");
const hover_1 = require("./hover");
const completion_1 = require("./completion");
const lint_1 = require("./lint");
const preview_1 = require("./preview");
const util_1 = require("./util");
const IconManager_1 = require("./IconManager");
const decoration_1 = require("./decoration");
const errors_1 = require("./errors");
function activate(context) {
    const config = new Configuration_1.Configuration(context);
    const iconManager = new IconManager_1.IconManager(config);
    const treeDataProvider = new tree_1.IconTreeDataProvider(config, iconManager);
    const treeView = vscode.window.createTreeView("materialDesignIconsExplorer", {
        treeDataProvider,
    });
    treeView.onDidChangeVisibility((event) => event.visible && treeDataProvider.refresh());
    vscode.commands.registerCommand("materialdesigniconsIntellisense.openIconPreview", (node) => {
        if (!node) {
            return vscode.window.showInformationMessage("Click on an icon in the MDI Explorer view to preview icons");
        }
        (0, preview_1.showPreview)(node, context, config);
    });
    vscode.commands.registerCommand("materialdesigniconsIntellisense.insertIconInActiveEditor", (node) => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (node.type === "icon") {
                const match = config.matchers.find((m) => m.name === config.insertType);
                if (!match) {
                    vscode.window.showInformationMessage(`InsertType ${config.insertType} not found`);
                    return;
                }
                const snippet = match.insert.replace(/\{(\w+)\}/, (group0, group1) => {
                    return (0, util_1.createCompletion)(node.icon.name, group1);
                });
                yield editor.insertSnippet(new vscode.SnippetString(snippet));
            }
        }
        else {
            vscode.window.showInformationMessage(`No active editor`);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.closeSearch", () => __awaiter(this, void 0, void 0, function* () {
        config.lastSearch = "";
        treeDataProvider.refresh();
        treeView.reveal({
            type: "other",
            label: "Search results",
        }, {
            expand: true,
            focus: true,
        });
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.showIconSearch", () => __awaiter(this, void 0, void 0, function* () {
        const search = (yield vscode.window.showInputBox({
            value: config.lastSearch,
            prompt: "Search icons",
            placeHolder: "Search icons",
        })) || "";
        vscode.commands.executeCommand("materialdesigniconsIntellisense.performIconSearch", search);
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeSettings", () => vscode.commands.executeCommand("workbench.action.openSettings", "materialdesigniconsIntellisense")));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeMdiVersion", () => __awaiter(this, void 0, void 0, function* () {
        let items = null;
        let info = null;
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            progress.report({
                message: "Getting versions from registry.npmjs.org",
            });
            try {
                info = yield iconManager.getAvailableVersions();
                yield config.updateLatestMdiVersion(info.latest);
                items = [
                    {
                        label: "latest",
                        description: `currently ${info.latest}` +
                            ("latest" === config.rawMdiVersion ? " - selected" : ""),
                    },
                    ...info.versions.map((v) => ({
                        label: v.version,
                        description: v.time +
                            (v.version === config.rawMdiVersion ? " - selected" : ""),
                    })),
                ];
            }
            catch (error) {
                (0, util_1.log)(error);
                vscode.window.showErrorMessage(error.message);
            }
        }));
        const result = yield vscode.window.showQuickPick(items, {
            canPickMany: false,
            placeHolder: `Current version: ${config.rawMdiVersion}`,
        });
        if (result) {
            const selectedVersion = result.label;
            const versionToDownload = selectedVersion === "latest" ? info.latest : selectedVersion;
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                progress.report({
                    message: `Downloading and extracting version ${versionToDownload}`,
                });
                const versionInfo = info.versions.find((v) => v.version === versionToDownload);
                if (!versionInfo) {
                    throw new Error(`Version ${versionToDownload} not found`);
                }
                iconManager.getIconList(versionToDownload);
            }));
            yield config.updateMdiVersion(selectedVersion);
            treeDataProvider.refresh();
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeInsertStyle", () => __awaiter(this, void 0, void 0, function* () {
        const items = config.matchers.map((m) => ({
            label: m.displayName,
            description: m.name === config.insertType ? "selected" : "",
            name: m.name,
        }));
        const result = yield vscode.window.showQuickPick(items, {
            canPickMany: false,
        });
        if (result) {
            yield config.changeInsertType(result.name);
            treeDataProvider.refresh();
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeLanguages", () => __awaiter(this, void 0, void 0, function* () {
        const languages = yield vscode.languages.getLanguages();
        const selected = config.selector;
        const selectedButNotAvailable = [];
        for (const s of selected) {
            if (!languages.includes(s)) {
                selectedButNotAvailable.push(s);
            }
        }
        const items = languages.map((l) => ({
            label: l,
            picked: selected.includes(l),
        }));
        items.push(...selectedButNotAvailable.map((l) => ({
            label: l,
            picked: true,
            description: "This language is currently not installed",
        })));
        const result = yield vscode.window.showQuickPick(items, {
            canPickMany: true,
            matchOnDescription: true,
            matchOnDetail: true,
        });
        if (result) {
            yield config.updateSelector(result.map((r) => r.label));
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.performIconSearch", (search) => {
        if (!search) {
            return vscode.window.showInformationMessage("Use the MDI explorer view to search icons");
        }
        config.lastSearch = search;
        treeDataProvider.refresh();
        treeView.reveal({
            type: "other",
            label: "Search results",
        }, {
            expand: true,
            focus: true,
        });
    }));
    context.subscriptions.push(vscode.languages.registerHoverProvider(config.selector, new hover_1.HoverProvider(config, iconManager)));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(config.selector, new completion_1.CompletionProvider(config, iconManager), ...completion_1.triggerCharacters));
    const enableLinter = () => {
        const linter = new lint_1.IconLint(config, iconManager);
        if (vscode.window.activeTextEditor) {
            linter.lintDocument(vscode.window.activeTextEditor.document);
        }
        const disposables = vscode.Disposable.from(vscode.workspace.onDidOpenTextDocument(linter.lintDocument.bind(linter), null), vscode.workspace.onDidCloseTextDocument(linter.deleteDiagnostics.bind(linter), null), vscode.workspace.onDidCloseTextDocument(linter.deleteDiagnostics.bind(linter), null), vscode.workspace.onDidSaveTextDocument(linter.lintDocument.bind(linter), null), vscode.languages.registerCodeActionsProvider(config.selector, linter), linter);
        context.subscriptions.push(disposables);
        return disposables;
    };
    let linterDisposables;
    if (config.enableLinter) {
        linterDisposables = enableLinter();
    }
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("materialdesigniconsIntellisense.enableLinter")) {
            if (linterDisposables) {
                linterDisposables.dispose();
                linterDisposables = undefined;
            }
            if (config.enableLinter) {
                linterDisposables = enableLinter();
            }
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => __awaiter(this, void 0, void 0, function* () {
        if (event.affectsConfiguration("materialdesigniconsIntellisense.selector")) {
            vscode.window.showInformationMessage("materialdesigniconsIntellisense.selector change takes affect after the next restart of code");
        }
        if (event.affectsConfiguration("materialdesigniconsIntellisense.mdiVersion")) {
            treeDataProvider.refresh();
        }
        if (event.affectsConfiguration("materialdesigniconsIntellisense.light")) {
            try {
                yield iconManager.getIconList();
            }
            catch (error) {
                if (error instanceof errors_1.VersionNotFoundError) {
                    yield config.updateMdiVersion("latest");
                    yield config.updateLatestMdiVersion(undefined);
                    const versions = yield iconManager.getAvailableVersions();
                    yield config.updateLatestMdiVersion(versions.latest);
                    yield iconManager.getIconList();
                }
            }
            treeDataProvider.refresh();
        }
    })));
    // auto update
    if (config.rawMdiVersion === "latest") {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const versions = yield iconManager.getAvailableVersions();
                if (config.mdiVersion !== versions.latest) {
                    yield config.updateLatestMdiVersion(versions.latest);
                    treeDataProvider.refresh();
                }
            }
            catch (error) {
                (0, util_1.log)(error);
            }
        }))();
    }
    const decorations = new decoration_1.DecorationProvider(config, iconManager);
    context.subscriptions.push(...decorations.register());
    (0, util_1.log)('"materialdesignicons-intellisense" is now active');
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map