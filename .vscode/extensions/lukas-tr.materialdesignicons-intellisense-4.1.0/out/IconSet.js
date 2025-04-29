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
exports.LightIconSet = exports.RegularIconSet = exports.IconSet = void 0;
const axios_1 = require("axios");
const semver_1 = require("semver");
const tar = require("tar");
const path = require("path");
const fs = require("fs");
const util_1 = require("./util");
const Icon_1 = require("./Icon");
const errors_1 = require("./errors");
class IconSet {
    constructor(storagePath) {
        this.storagePath = storagePath;
        this.SVG_NAME_REGEX = /\/([^/]*?).svg/;
        this.icons = {};
    }
    getAvailableVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.versionInfo)
                return this.versionInfo;
            this.versionInfo = yield this.downloadVersionInfoFromNpm();
            return this.versionInfo;
        });
    }
    getIconList(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getIconData(version);
            if (!data)
                throw new Error(`icon data for version ${version} not found`);
            return data.all;
        });
    }
    getIcon(version, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getIconData(version);
            if (!data)
                throw new Error(`icon data for version ${version} not found`);
            return data.byName[name] || null;
        });
    }
    getIconData(version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.icons[version]) {
                return this.icons[version];
            }
            const dataFromFs = yield this.readDataFromFs(version);
            if (dataFromFs) {
                const data = this.convertIconData(dataFromFs);
                this.icons[version] = data;
                return data;
            }
            const versionInfo = yield this.getAvailableVersions();
            const downloadInfo = versionInfo.versions.find((v) => v.version === version);
            if (!downloadInfo)
                throw new errors_1.VersionNotFoundError(`version ${version} not found`);
            const downloadResult = yield this.downloadDataFromNpm(downloadInfo.downloadUrl, version);
            const icons = this.convertIconData(downloadResult);
            this.icons[version] = icons;
            return icons;
        });
    }
    convertIconData(data) {
        const all = data.meta.map((meta) => new Icon_1.Icon(meta, data.paths[meta.name]));
        const byName = {};
        for (const icon of all) {
            byName[icon.name] = icon;
        }
        const d = {
            all,
            byName,
        };
        return d;
    }
    downloadVersionInfoFromNpm() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(this.getRegistryUrl());
            const packageInfo = response.data;
            return {
                latest: packageInfo["dist-tags"].latest,
                // versions sorted with semver
                versions: (0, semver_1.sort)(Object.keys(packageInfo.versions))
                    .reverse()
                    .map((version) => ({
                    version: version,
                    time: packageInfo.time[version],
                    downloadUrl: packageInfo.versions[version].dist.tarball,
                })),
            };
        });
    }
    readDataFromFs(version) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs.promises.readFile(this.getPath(version));
                const d = JSON.parse(data.toString("utf8"));
                return d;
            }
            catch (error) {
                (0, util_1.log)(error);
                return null;
            }
        });
    }
    downloadDataFromNpm(url, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(url, {
                responseType: "stream",
            });
            const data = {
                version,
                meta: [],
                paths: {},
            };
            return new Promise((resolve, reject) => {
                response.data
                    .pipe(tar.t())
                    .on("entry", (entry) => {
                    const nameMatch = this.SVG_NAME_REGEX.exec(entry.path);
                    let content = "";
                    entry.on("data", (chunk) => {
                        content += chunk.toString();
                    });
                    entry.on("end", () => {
                        if (nameMatch) {
                            const path = this.extractPathFromSvg(content);
                            data.paths[nameMatch[1]] = path;
                        }
                        else if (entry.path.includes("package.json")) {
                            data.version = JSON.parse(content).version;
                        }
                        else if (entry.path.includes("meta.json")) {
                            data.meta = JSON.parse(content);
                        }
                    });
                })
                    .on("finish", () => __awaiter(this, void 0, void 0, function* () {
                    const destination = this.getPath(version);
                    try {
                        yield fs.promises.mkdir(path.dirname(destination), {
                            recursive: true,
                        });
                        yield fs.promises.writeFile(destination, JSON.stringify(data), "utf8");
                    }
                    catch (error) {
                        (0, util_1.log)(error);
                        return reject(error);
                    }
                    resolve(data);
                }))
                    .on("error", (error) => {
                    (0, util_1.log)(error);
                    reject(error);
                });
            });
        });
    }
    extractPathFromSvg(svg) {
        const reg = /\bd="(.*?)"/g;
        const match = reg.exec(svg);
        if (!match) {
            return "";
        }
        return match[1];
    }
}
exports.IconSet = IconSet;
class RegularIconSet extends IconSet {
    constructor() {
        super(...arguments);
        this.REGISTRY_URL = "https://registry.npmjs.org/@mdi/svg";
    }
    getRegistryUrl() {
        return this.REGISTRY_URL;
    }
    getPath(version) {
        return path.join(this.storagePath, "regular", version, "meta.json");
    }
}
exports.RegularIconSet = RegularIconSet;
class LightIconSet extends IconSet {
    constructor() {
        super(...arguments);
        this.REGISTRY_URL = "https://registry.npmjs.org/@mdi/light-svg";
    }
    getRegistryUrl() {
        return this.REGISTRY_URL;
    }
    getPath(version) {
        return path.join(this.storagePath, "light", version, "meta.json");
    }
}
exports.LightIconSet = LightIconSet;
//# sourceMappingURL=IconSet.js.map