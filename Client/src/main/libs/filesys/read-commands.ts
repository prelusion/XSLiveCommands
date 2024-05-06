import fs from "fs";
import {CommandFile, MapCommands, ParamStruct} from "../../../shared/src/types/commands/structs";

function areValidParameters(params?: Array<ParamStruct>): boolean {
    if(!params) {
        return false;
    }

    for(let param of params) {
        if(!param.name) {
            return false;
        }
        if(!param.default) {
            continue;
        }
        switch (param.type) {
            case "int":
            case "float":  if (typeof param.default !== "number") return false; break;
            case "bool":   if (typeof param.default !== "boolean") return false; break;
            case "string": if (typeof param.default !== "string") return false; break;
        }
    }
    return true;
}

export async function readCommands(path: string): Promise<{ commands?: MapCommands; reason?: string }> {
    if (!fs.existsSync(path)) {
        return {reason: 'no-json'};
    }

    try {
        const commandsArray: CommandFile = JSON.parse(fs.readFileSync(path).toString());
        const commands: MapCommands = {};
        for(let command of commandsArray) {
            if(!command.name || !command.function || !areValidParameters(command.params)) {
                return {reason: 'invalid-json'};
            }
            commands[command.name] = command;
        }

        return {commands: commands};
    } catch {
        return {reason: 'invalid-json'};
    }
}