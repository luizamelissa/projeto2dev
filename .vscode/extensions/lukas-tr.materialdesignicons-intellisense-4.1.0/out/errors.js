"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionNotFoundError = void 0;
class VersionNotFoundError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, VersionNotFoundError.prototype);
    }
}
exports.VersionNotFoundError = VersionNotFoundError;
//# sourceMappingURL=errors.js.map