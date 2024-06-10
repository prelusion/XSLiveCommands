import {dialog, Menu, shell} from 'electron';
import type {MenuItemConstructorOptions, MenuItem} from 'electron'
import {type, arch, release} from 'os';
import {version} from '../../../package.json';
import {AgeOfEmpiresHelpMenu, createOpenLinkCallback} from "@main/hooks/menu-aoe2-help";

/**
 * https://electronjs.org/docs/api/menu
 */
const menu: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
    {
        label: 'Settings',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl + R',
                role: 'reload',
            },
            {
                /* https://github.com/electron/electron/issues/5256#issuecomment-692068367 */
                label: 'Additional Reload (Hidden)',
                accelerator: 'F5',
                role: 'reload',
                visible: false,
            },
            {
                label: 'Force reload',
                accelerator: 'CmdOrCtrl + SHIFT + R',
                role: 'forceReload',
            },
            {
                label: 'Exit',
                accelerator: 'CmdOrCtrl + F4',
                role: 'close',
            },
        ],
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: function () {
                    dialog.showMessageBox({
                        title: 'About',
                        type: 'question',
                        message: 'XSLiveCommands',
                        detail: `Version: ${version}\nEngine Version: ${process.versions.v8}\nCurrent System: ${type()} ${arch()} ${release()}`,
                        noLink: true,
                        buttons: ['Go back', 'View on GitHub'],
                    }).then(
                        createOpenLinkCallback('https://github.com/prelusion/XSLiveCommands', 1)
                    );
                },
            },
            /* Insert AoE2 help menu */
            AgeOfEmpiresHelpMenu,
        ],
    },
]

export const useMenu = () => {
    const createMenu = () => {
        if (process.env.NODE_ENV === 'development') {
            menu.push({
                label: 'Developer',
                submenu: [
                    {
                        label: 'Toggle Developer Console',
                        accelerator: 'Ctrl + SHIFT + I',
                        role: 'toggleDevTools',
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
