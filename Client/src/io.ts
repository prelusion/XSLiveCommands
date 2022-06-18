import fs, {readFileSync} from "fs";
import {Event} from "./interfaces";
import {CycleCounter} from "./cycle_counter";

export async function readCycle(path: string, cycle: number) {
    try {
        const cycleFile = readFileSync(path, { flag: 'a+', encoding: null});
        cycle = Buffer.from(cycleFile).readInt32LE();
        console.log("cycle " + cycle)
        return cycle;
    } catch (err) {
        // console.log(err)
        // File doesn't exist. Ignored because of HUGE ASS ERROR and file doesn't have to exist.
    }
}

export async function writeEvent(path: string, event: Event) {
    // Buffer gets the right amount of bytes allocated to it.

    if (!event.params)
        event.params = [];

    // File layout (all int32):
    // 1:       Execution Cycle Number
    // 2:       CommandId
    // 3:       paramCount
    // 4-13:    10 Parameters
    const int_size = 4;
    const preParamIntCount = 3;
    let offset = 0;

    const buffer = Buffer.alloc(int_size * preParamIntCount + event.params.length * int_size);

    buffer.writeInt32LE(event.executeCycleNumber, offset);
    offset += int_size;
    buffer.writeInt32LE(event.commandId, offset);
    offset += int_size;
    buffer.writeInt32LE(event.params.length, offset);
    offset += int_size;

    for (const param of event.params) {
        buffer.writeInt32LE(param, offset);
        offset += int_size;
    }

    await fs.writeFile(path, buffer, (err) => {
        if (err) throw new Error("Writing to file didn't work")
    });
}

export async function deleteUsedFiles(pathToScenarioFile: string, pathToCommandFile: string) {
    try {
        //Removing the scenario & command file through given paths.
        fs.unlinkSync(pathToScenarioFile);
        fs.unlinkSync(pathToCommandFile);
    } catch (err) {
        // File doesn't exist. Ignored because of HUGE ASS ERROR and file doesn't have to exist.
    }
}
