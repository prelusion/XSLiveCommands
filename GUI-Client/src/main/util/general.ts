import fs from "fs";
import path from "path";

/**
 * Finds the names of all the files inside a given directory and its subdirectories.
 *
 * @param dirpath The directory to scan for files.
 * @param fullPath if true, the full path of all files are included instead of just their filenames. Default: false
 *
 * @returns A list of file names inside the directory and subdirectories in that directory.
 */
export function recursiveReaddir(dirpath: string, fullPath = false): Array<string> {
    const fileNames: Array<string> = [];
    const names = fs.readdirSync(dirpath);
    names.forEach((name) => {
        if (fs.lstatSync(path.join(dirpath, name)).isFile())
            fileNames.push(fullPath ? dirpath + "\\" + name : name);
        else
            fileNames.push(...recursiveReaddir(path.join(dirpath, name), fullPath));
    });
    return fileNames;
}