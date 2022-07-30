"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.buildResponse = void 0;
const tslib_1 = require("tslib");
const electron_1 = require("electron");
// windows specific:
const userProfile = process.env.USERPROFILE;
function buildResponse({ filepath, reason } = { filepath: "", reason: "" }) {
    return { filepath, reason };
}
exports.buildResponse = buildResponse;
function select(steamId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const scenarioFolder = `${userProfile}\\Games\\Age of Empires 2 DE\\${steamId}\\resources\\_common\\scenario\\`;
        try {
            const response = yield electron_1.dialog.showOpenDialog({
                properties: [
                    "openFile",
                    "dontAddToRecent"
                ],
                filters: [
                    { name: 'Scenario Files', extensions: ['aoe2scenario'] }
                ],
                defaultPath: scenarioFolder,
            });
            if (response.filePaths.length === 1) {
                return buildResponse({ filepath: response.filePaths[0] });
            }
            else {
                return buildResponse({ reason: response.canceled ? "cancelled" : "unknown" });
            }
        }
        catch (_a) {
            return buildResponse({ reason: "unknown" });
        }
    });
}
exports.select = select;
// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================
electron_1.ipcMain.handle("dialog:select", (_, steamId) => {
    return select(steamId);
});
//# sourceMappingURL=dialog.js.map