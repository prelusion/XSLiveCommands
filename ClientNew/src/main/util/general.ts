import fs from "fs";
import path from "path";

/**
 * Finds the names of all the files inside a given directory and its subdirectories.
 *
 * @param dirPath The directory to scan for files.
 * @param fullPath if true, the full path of all files are included instead of just their filenames. Default: false
 *
 * @returns A list of file names inside the directory and subdirectories in that directory.
 */
export function recursiveReaddir(dirPath: string, fullPath = false): Array<string> {
    const fileNames: Array<string> = [];
    const names = fs.readdirSync(dirPath);

    for(const name of names) {
        const fullName = path.join(dirPath, name)

        if (fs.lstatSync(fullName).isFile()) {
            fileNames.push(fullPath ? fullName : name);
        } else {
            fileNames.push(...recursiveReaddir(fullName, fullPath));
        }
    }
    return fileNames;
}