import * as fs from 'fs';
import * as path from 'path';

function main() {
    const rm = [];
    for(let file of fs.readdirSync("./build", {recursive: true}) as string[]) {
        if(file.startsWith("icons")) {
            continue;
        }
        file = path.join(".", "build", file);
        if(fs.lstatSync(file).isDirectory() && file.match(/(win|linux|mac)$/) || path.dirname(file) == "build") {
            rm.push(file);
        }
        if(file.includes("Setup") && !file.endsWith(".blockmap")) {
            console.log(`ren ${file} ${path.join(
                    ".",
                    "build",
                    path.basename(file)
                        .replace("ia32", "x86")
                        .replace("x64", "x86_64")
                )}`)
            fs.renameSync(
                file,
                path.join(
                    ".",
                    "build",
                    path.basename(file)
                        .replace("ia32", "x86")
                        .replace("x64", "x86_64")
                )
            );
        }
    }
    for(const file of rm) {
        console.log(`rm ${file}`)
        fs.rmSync(file, {recursive: true});
    }
}

main();
