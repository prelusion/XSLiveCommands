import config from "@config/index";
import {BrowserWindow, shell} from "electron";
import {winURL, getPreloadFile} from "../config/static-path";
import {useProcessException} from "@main/hooks/exception-hook";
import {useApplicationFunctions} from "@main/libs/manager";


class MainInit {
    public winURL: string = "";
    public mainWindow: BrowserWindow|null = null;
    private readonly childProcessGone;
    private readonly applicationIpc;

    constructor() {
        const {childProcessGone} = useProcessException();
        const {applicationIpc} = useApplicationFunctions();

        this.winURL = winURL;
        this.childProcessGone = childProcessGone;
        this.applicationIpc = applicationIpc;
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            title: 'XS Live Commands is starting...',
            titleBarOverlay: {
                color: "#fff",
            },
            titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
            width: 900,
            height: 600,
            useContentSize: true,
            minWidth: 1366,
            show: false,
            frame: config.IsUseSysTitle,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
                webSecurity: false,
                devTools: process.env.NODE_ENV === "development",
                scrollBounce: process.platform === "darwin",
                preload: getPreloadFile("preload"),
            },
        });

        this.mainWindow.loadURL(this.winURL);
        this.mainWindow.once("ready-to-show", () => {
            if (!this.mainWindow) {
                return;
            }
            this.mainWindow.show();
        });

        if (process.env.NODE_ENV === "development") {
            this.mainWindow.webContents.openDevTools({
                mode: "undocked",
                activate: true,
            });
        }

        this.applicationIpc(this.mainWindow);
        this.childProcessGone(this.mainWindow);

        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
        });


        /* Make all links open with the browser, not with the application */
        this.mainWindow.webContents.setWindowOpenHandler(({url}) => {
            if (url.startsWith('https:')) {
                shell.openExternal(url)
            }
            return {action: 'deny'}
        });
    }

    initWindow() {
        return this.createMainWindow();
    }
}

export default MainInit;
