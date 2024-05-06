import fs from "fs";
import path from "path";
import {ParamType, ScheduledCommand} from "../../../shared/src/types/commands/scheduled";
import {PlatformUser} from "../../../shared/src/types/user";
import {addBoolToBuff, addFloatToBuff, addIntToBuff, addStringToBuff, BufferInfo, profileFolderPath} from "./common";

/**
 * File layout:
 *
 *      |                  | SIZE | CmlB   | TYPE   | DESCRIPTION                 | ASSIGNMENT |
 *      |                  | ---- | ------ | ------ | --------------------------- | ---------- |
 *      | START            | >    |        |        |                             |            |
 *      |                  | 4    | 4      | int32  | Execution Tick              |            |
 *      |                  | 4    | 8      | int32  | Length of <function> string | = F        |
 *      |                  | F    | 8+F    | string | Name of the function        |            |
 *      |                  | 4    | 12+F   | int32  | Parameter Count             | = N        |
 *      | REPEAT <N>       | >    |        |        |                             |            |
 *      |                  | 4    | 4      | int32  | Length of <name> param      | = X        |
 *      |                  | X    | 4+X    | string | Name of the param           |            |
 *      |                  | 4    | 8+X    | int32  | Variable Type               | = T        |
 *      | IF (T == string) | >    |        |        |                             |            |
 *      |                  | 4    | 12+X   | int32  | Length of <name> string     | = L        |
 *      |                  | L    | 12+X+L | string | Data                        |            |
 *      | ELSE             | >    |        |        |                             |            |
 *      |                  | 4    | 12+X   | I,B,F  | Data                        |            |
 *      | ENDIF            | >    |        |        |                             |            |
 *      | END REPEAT       | >    |        |        |                             |            |
 */
export function writeCommand(platform: PlatformUser, _: string, scheduledCommand: ScheduledCommand): void {
    const commandFilePath = path.join(profileFolderPath(platform), "xslc.commands.xsdat");

    if (!scheduledCommand.params)
        scheduledCommand.params = [];

    let bufferSize = 12 + scheduledCommand.function.length;
    for (const param of scheduledCommand.params) {
        // Type & Value (or pre-string val if string)
        bufferSize += 8;
        // Param name (pre-string val + string)
        bufferSize += 4 + param.name.length;

        if (param.type === ParamType.STRING) {
            bufferSize += (param.value as string).length;
        }
    }

    const bufferInfo: BufferInfo = {
        buffer: Buffer.alloc(bufferSize),
        offset: 0
    }

    addIntToBuff(bufferInfo, scheduledCommand.execTick, false);
    addStringToBuff(bufferInfo, scheduledCommand.function, false);
    addIntToBuff(bufferInfo, scheduledCommand.params.length, false);

    for (const param of scheduledCommand.params) {
        addStringToBuff(bufferInfo, param.name, false);

        switch (param.type) {
            case ParamType.INT:    addIntToBuff(bufferInfo, param.value); break;
            case ParamType.FLOAT:  addFloatToBuff(bufferInfo, param.value); break;
            case ParamType.BOOL:   addBoolToBuff(bufferInfo, param.value); break;
            case ParamType.STRING: addStringToBuff(bufferInfo, param.value); break;
        }
    }

    let interval = setInterval(() => {
        try {
            fs.writeFileSync(commandFilePath, bufferInfo.buffer);
        } catch {
            return;
        }
        clearInterval(interval);
    });
}