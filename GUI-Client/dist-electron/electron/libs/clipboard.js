"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.write = void 0;
const electron_1 = require("electron");
function write(text) {
    electron_1.clipboard.writeText(text);
}
exports.write = write;
// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================
electron_1.ipcMain.handle('clipboard:write', (_, text) => {
    write(text);
});
//# sourceMappingURL=clipboard.js.map