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
exports.IconManager = void 0;
const IconSet_1 = require("./IconSet");
class IconManager {
    constructor(config) {
        this.config = config;
        this.regular = new IconSet_1.RegularIconSet(config.storagePath);
        this.light = new IconSet_1.LightIconSet(config.storagePath);
    }
    activeSet() {
        return this.config.light ? this.light : this.regular;
    }
    getIconList(version) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeSet().getIconList(version || this.config.mdiVersion);
        });
    }
    getIcon(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeSet().getIcon(this.config.mdiVersion, name);
        });
    }
    getAvailableVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeSet().getAvailableVersions();
        });
    }
}
exports.IconManager = IconManager;
//# sourceMappingURL=IconManager.js.map