"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSteamId = void 0;
const tslib_1 = require("tslib");
const electron_1 = require("electron");
const steamid_1 = tslib_1.__importDefault(require("steamid"));
// Window module doesn't have type definitions. This is simple typing for all that we need.
const Windows = require("windows");
function getSteamId() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const key = "HKCU\\Software\\Valve\\Steam\\ActiveProcess";
        const keySet = Windows.registry(key);
        const accountId = keySet["ActiveUser"]["value"];
        return steamid_1.default.fromIndividualAccountID(accountId).getSteamID64();
    });
}
exports.getSteamId = getSteamId;
// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================
electron_1.ipcMain.handle("regedit:getSteamId", () => {
    return getSteamId();
});
//# sourceMappingURL=regedit.js.map