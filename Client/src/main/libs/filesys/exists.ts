import fs from "fs";

export async function exists(absolutePath: string): Promise<boolean> {
    return fs.existsSync(absolutePath);
}
