import path from "path";
import {ParamType} from "../../../shared/src/types/commands/scheduled";
import {PlatformUser} from "../../../shared/src/types/user";
import {ensure} from "../../../shared/src/util/general";

const USER_HOME_DIR = process.platform === "win32" ? ensure(process.env.USERPROFILE) : "~";

export function profileFolderPath(platform: PlatformUser): string {
    if(platform.type === "steam") {
        return path.join(USER_HOME_DIR, "Games", "Age of Empires 2 DE", platform.userId, "profile");
    } else {
        // todo: MS Store
        return "";
    }
}

export function modsFolderPath(platform: PlatformUser): string {
    if(platform.type === "steam") {
        return path.join(USER_HOME_DIR, "Games", "Age of Empires 2 DE", platform.userId, "mods");
    } else {
        // todo: MS Store
        return "";
    }
}

export type BufferInfo = { buffer: Buffer; offset: 0 };

export function addTypeToBuff(bufferInfo: BufferInfo, type: ParamType): void {
    bufferInfo.buffer.writeInt32LE(type, bufferInfo.offset);
    bufferInfo.offset += 4;
}

export function addIntToBuff(bufferInfo: BufferInfo, int: number, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.INT);
    bufferInfo.buffer.writeInt32LE(int, bufferInfo.offset);
    bufferInfo.offset += 4;
}

export function addBoolToBuff(bufferInfo: BufferInfo, bool: boolean, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.BOOL);
    bufferInfo.buffer.writeInt32LE(bool ? 1 : 0, bufferInfo.offset);
    bufferInfo.offset += 4;
}

export function addFloatToBuff(bufferInfo: BufferInfo, float: number, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.FLOAT);
    bufferInfo.buffer.writeFloatLE(float, bufferInfo.offset);
    bufferInfo.offset += 4;
}

export function addStringToBuff(bufferInfo: BufferInfo, str: string, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.STRING);
    bufferInfo.buffer.writeInt32LE(str.length, bufferInfo.offset);
    bufferInfo.offset += 4;
    bufferInfo.buffer.write(str, bufferInfo.offset, 'utf8');
    bufferInfo.offset += str.length;
}
