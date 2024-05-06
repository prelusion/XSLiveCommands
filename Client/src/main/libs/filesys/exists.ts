import fs from "fs";

export function exists(absolutePath: string): boolean {
    return fs.existsSync(absolutePath);
}