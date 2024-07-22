import fs from "fs";
import {CommandFileStruct, MapCommands, ParamStruct} from "../../../shared/src/types/commands/structs";
import {Result, err, ok} from "../../../shared/src/types/result";

function areValidParameters(params?: Array<ParamStruct>): boolean {
    if(!params) {
        return false;
    }

    for(let param of params) {
        if(!param.name || !param.type) {
            return false;
        }
        if(!param.type.match(/(int|float|bool|string)/)) {
            return false;
        }
        if(!param.default) {
            continue;
        }

        switch (param.type) {
            case "int":
            case "float":  if (typeof (param.default as unknown) !== "number") return false; break;
            case "bool":   if (typeof (param.default as unknown) !== "boolean") return false; break;
            case "string": if (typeof (param.default as unknown) !== "string") return false; break;
        }
    }
    return true;
}

export async function readCommands(path: string): Promise<Result<MapCommands>> {
    if (!fs.existsSync(path)) {
        return err('no-json');
    }

    try {
        const commandsArray: CommandFileStruct = JSON.parse(fs.readFileSync(path).toString());
        const commands: MapCommands = {};
        for(let command of commandsArray) {
            if(!command.name || !command.function || !areValidParameters(command.params)) {
                return err('invalid-json');
            }
            commands[command.name] = command;
        }

        return ok(commands);
    } catch {
        return err('invalid-json');
    }
}
