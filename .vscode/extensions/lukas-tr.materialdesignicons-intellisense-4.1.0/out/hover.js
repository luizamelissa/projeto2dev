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
exports.HoverProvider = void 0;
const util_1 = require("./util");
class HoverProvider {
    constructor(config, manager) {
        this.config = config;
        this.manager = manager;
    }
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, util_1.getMatchAtPosition)(document, position, this.config.matchers);
            if (!result) {
                return;
            }
            const icon = yield this.manager.getIcon(result.iconName);
            if (!icon) {
                const hover = {
                    range: result.range,
                    contents: [`no preview available for mdi-${result.iconName}`],
                };
                return hover;
            }
            const hover = {
                range: result.range,
                contents: [
                    icon.getMarkdownPreviewIcon(this.config.iconColor, this.config.iconSize),
                    icon.tags.join(", "),
                    `aliases: ${icon.aliases.join(", ")}`,
                    icon.docLink,
                ],
            };
            return hover;
        });
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hover.js.map