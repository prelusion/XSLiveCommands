import {promisified as regedit} from "regedit";
import SteamID from "steamid";

export class Paths {
    private userProfile = process.env.USERPROFILE;
    private afterProfileFolder = "Games\\Age of Empires 2 DE";
    private steamProfile = "profile";
    private steamID = "";

    public PATH_WRITE_TO = "";
    public PATH_READ_FROM = "";

    private _commandFile = "command.xsdat";
    private _scenarioFile = "TESTTESTTTESTTEST.xsdat";

    public async initPaths() {
        const key = 'HKCU\\Software\\Valve\\Steam\\ActiveProcess';
        const listResult = await regedit.list([key])
        const accountId = listResult[key]["values"]["ActiveUser"]["value"]
        this.steamID = SteamID.fromIndividualAccountID(accountId).getSteamID64();

        this.PATH_WRITE_TO = `${this.userProfile}\\${this.afterProfileFolder}\\${this.steamID}\\${this.steamProfile}\\${this.commandFile}`
        this.PATH_READ_FROM = `${this.userProfile}\\${this.afterProfileFolder}\\${this.steamID}\\${this.steamProfile}\\${this.scenarioFile}`
        console.log(this.PATH_WRITE_TO)
    }


    get commandFile(): string {
        return this._commandFile;
    }

    set commandFile(value: string) {
        this._commandFile = value;
        this.PATH_WRITE_TO = `${this.userProfile}\\${this.afterProfileFolder}\\${this.steamID}\\${this.steamProfile}\\${this.commandFile}`
    }

    get scenarioFile(): string {
        return this._scenarioFile;
    }

    set scenarioFile(value: string) {
        this._scenarioFile = value;
        this.PATH_READ_FROM = `${this.userProfile}\\${this.afterProfileFolder}\\${this.steamID}\\${this.steamProfile}\\${this.scenarioFile}`
    }
}
