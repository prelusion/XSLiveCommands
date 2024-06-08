import fs from "fs";
import path from "path";
import {clearInterval} from "timers";
import {PlatformUser} from "../../../shared/src/types/user";
import {addIntToBuff, BufferInfo, profileFolderPath} from "./common";

export function deleteXsDataFiles(platform: PlatformUser, map: string): void {
    const profileFolder = profileFolderPath(platform);

    const cmdsDatFilePath = path.join(profileFolder, "xslc.commands.xsdat");
    const mapDatFilePath = path.join(profileFolder, `${map}.xsdat`);

    if (fs.existsSync(cmdsDatFilePath)) {
        fs.unlinkSync(cmdsDatFilePath);
    }

    if(!fs.existsSync(mapDatFilePath)) {
        return;
    }

    const bufferInfo: BufferInfo = {
        buffer: Buffer.alloc(4),
        offset: 0
    }
    addIntToBuff(bufferInfo, -1, false);

    let interval = setInterval(() => {
        let file: number | null = null;
        try {
            file = fs.openSync(mapDatFilePath, 'w');
            fs.writeSync(file, bufferInfo.buffer, 0, 4, 0);
        } catch {
            return;
        } finally { if(file) {
            fs.closeSync(file);
        }}
        clearInterval(interval);
    });
}
