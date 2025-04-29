"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
class Configuration {
    constructor(context) {
        this.context = context;
        this.lastSearch = "";
    }
    get storagePath() {
        return this.context.globalStorageUri.fsPath;
    }
    get all() {
        return vscode.workspace.getConfiguration("materialdesigniconsIntellisense");
    }
    get matchers() {
        return (this.all.get("matchers") || []).filter((matcher) => (matcher.light || false) === this.light);
    }
    get iconSize() {
        return this.all.get("iconSize") || 100;
    }
    /**
     * For some reason, vscode doesn't display the icon in tree view if the color contains `#`
     * @returns rgb(r, g, b)
     */
    get iconColor() {
        return (0, util_1.hexToRgbString)(this.all.get("iconColor") || "#bababa");
    }
    get selector() {
        return this.all.get("selector") || [];
    }
    updateSelector(selector) {
        return this.all.update("selector", selector, vscode.ConfigurationTarget.Global);
    }
    get includeAliases() {
        return this.all.get("includeAliases") || false;
    }
    get latestMdiVersion() {
        return this.context.globalState.get("latestMdiVersion");
    }
    updateLatestMdiVersion(version) {
        return this.context.globalState.update("latestMdiVersion", version);
    }
    get rawMdiVersion() {
        vscode.workspace.getConfiguration();
        return this.all.get("mdiVersion") || "latest";
    }
    get mdiVersion() {
        const version = this.rawMdiVersion;
        const fallback = this.light ? "0.2.63" : "6.4.95";
        return (version === "latest" ? this.latestMdiVersion : version) || fallback;
    }
    updateMdiVersion(version) {
        return this.all.update("mdiVersion", version, vscode.ConfigurationTarget.Global);
    }
    get insertType() {
        return this.all.get("insertStyle");
    }
    changeInsertType(newType) {
        return this.all.update("insertStyle", newType, vscode.ConfigurationTarget.Global);
    }
    get enableLinter() {
        return this.all.get("enableLinter");
    }
    get enableDecorations() {
        return this.all.get("enableDecorations");
    }
    get ignoredIcons() {
        return this.all.get("ignoredIcons") || [];
    }
    get decoration() {
        return this.all.get("decoration");
    }
    get linter() {
        return (this.all.get("linter") || { ignorePaths: [] });
    }
    get light() {
        return this.all.get("light") || false;
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=Configuration.js.map