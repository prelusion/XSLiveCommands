import fs, {readFileSync} from "fs";
import {Event} from "./interfaces";

export async function readCycle(path: string, cycle: number) {
    try {
        const cycleFile = readFileSync(path, {encoding: "binary"});
        cycle = new Buffer(cycleFile, 'binary').readInt32LE(0);
        return cycle;
    } catch (err) {
        // File doesn't exist. Ignored because of HUGE ASS ERROR and file doesn't have to exist.
    }
}

export async function writeEvent(path: string, event: Event) {
    // Buffer gets the right amount of bytes allocated to it.
    const buffer = Buffer.alloc(event.params.length * 4 + 8);
    buffer.writeInt32LE(event.executeCycleNumber, 0)
    buffer.writeInt32LE(event.commandId, 4)
    let offset = 8;
    for (const param of event.params) {
        buffer.writeInt32LE(param, offset)
        offset += 4;
    }

    console.log(event.executeCycleNumber)
    await fs.writeFile(path, buffer, (err) => {
        if (err) throw new Error("Writing to file didn't work")
    });
}
