"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletion = exports.getMatchAtPosition = exports.matcherStringToRegex = exports.hexToRgbString = exports.log = void 0;
const vscode = require("vscode");
const changeCase = require("change-case");
let outputChannel = null;
const log = (x, show = false) => {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel("Material Design Icons Intellisense");
    }
    if (show) {
        outputChannel.show();
    }
    outputChannel.appendLine(x);
};
exports.log = log;
const hexToRgbString = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return null;
    }
    const rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};
exports.hexToRgbString = hexToRgbString;
const matcherStringToRegex = (str) => {
    const result = /\{(\w+)\}/.exec(str);
    if (!result) {
        (0, exports.log)("Type not found in matcher");
        return null;
    }
    const replacements = {
        camel: "A-Za-z",
        param: "-a-z",
        pascal: "A-Za-z",
        constant: "_A-Z",
        dot: ".a-z",
        header: "-A-Za-z",
        no: " a-z",
        path: "/a-z",
        snake: "_a-z",
    };
    const type = result[1];
    const replacement = replacements[type];
    if (!replacement) {
        (0, exports.log)("invalid matcher syntax");
        return null;
    }
    const createIconRegex = (count) => `(?<icon>[${replacement}0-9]${count})`;
    const prefix = result.input.slice(0, result.index);
    return {
        fullRegex: new RegExp(str.replace(/\{\w+\}/i, createIconRegex("+")), "ig"),
        type,
        suggestionPrefixAndIconRegex: new RegExp(`(?<prefix>${prefix})${createIconRegex("*")}$`),
    };
};
exports.matcherStringToRegex = matcherStringToRegex;
const getMatchAtPosition = (document, position, matchers) => {
    for (const matcher of matchers) {
        const regex = (0, exports.matcherStringToRegex)(matcher.match);
        if (!regex)
            continue;
        const range = document.getWordRangeAtPosition(position, regex.fullRegex);
        if (!range) {
            continue;
        }
        const text = document.getText(range);
        const match = regex.fullRegex.exec(text);
        if (!match || !match.groups) {
            continue;
        }
        const iconName = changeCase.paramCase(match.groups.icon);
        return {
            match,
            iconName,
            range,
        };
    }
};
exports.getMatchAtPosition = getMatchAtPosition;
const createCompletion = (iconName, type) => {
    const transformers = {
        camel: changeCase.camelCase,
        param: changeCase.paramCase,
        pascal: changeCase.pascalCase,
        constant: changeCase.constantCase,
        dot: changeCase.dotCase,
        header: changeCase.headerCase,
        no: changeCase.noCase,
        path: changeCase.pathCase,
        snake: changeCase.snakeCase,
    };
    return transformers[type](iconName);
};
exports.createCompletion = createCompletion;
//# sourceMappingURL=util.js.map