import {dialog, Menu} from "electron";
import type {MenuItemConstructorOptions, MenuItem} from "electron"
import {type, arch, release} from "os";
import {version} from "../../../package.json";

/**
 * https://electronjs.org/docs/api/menu
 */
const menu: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
    {
        label: "Settings",
        submenu: [
            {
                label: "Quick Restart",
                accelerator: "F5",
                role: "reload",
            },
            {
                label: "Exit",
                accelerator: "Ctrl+F4",
                role: "close",
            },
        ],
    },
    {
        label: "Help",
        submenu: [
            {
                label: "About",
                click: function () {
                    dialog.showMessageBox({
                        title: "About",
                        type: "info",
                        message: "electron-Vue framework",
                        detail: `Version: ${version}\nEngine Version: ${process.versions.v8}\nCurrent System: ${type()} ${arch()} ${release()}`,
                        noLink: true,
                        buttons: ["View on GitHub", "OK"],
                    });
                },
            },
        ],
    },
];

export const useMenu = () => {
    const createMenu = () => {
        if (process.env.NODE_ENV === "development") {
            menu.push({
                label: "Developer",
                submenu: [
                    {
                        label: "Toggle Developer Console",
                        accelerator: "Ctrl + SHIFT + I",
                        role: "toggleDevTools",
                    },
                ],
            });
        }
        const menuTemplate = Menu.buildFromTemplate(menu);
        Menu.setApplicationMenu(menuTemplate);
    }
    return {
        createMenu
    }
}
