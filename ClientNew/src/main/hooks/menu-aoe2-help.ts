import {dialog, shell} from "electron";

const showItDepends = async () => {
    await dialog.showMessageBox({
        title: 'It depends!',
        type: 'warning',
        message: 'It depends!',
        noLink: true,
        buttons: ['It ALWAYS depends!'],
    });
}

export const createOpenLinkCallback = (url: string, button: number | null = null) => {
    return async (messageBoxResult: Electron.MessageBoxReturnValue) => {
        if (button !== null && messageBoxResult.response !== button) {
            return;
        }

        await shell.openExternal(url)
    }
}

export const AgeOfEmpiresHelpMenu = {
    label: 'Age of Empires II',
    submenu: [
        {
            label: 'What to do against 40 elephant archers?',
            click: showItDepends
        },
        {
            label: 'When should I get wheelbarrow?',
            click: showItDepends
        },
        {
            label: 'Should we auto micro, auto macro?',
            click: async () => {
                await dialog.showMessageBox({
                    title: 'Should we 🚘🚘 EVERYTHING?',
                    type: 'info',
                    message: 'MBL knows!',
                    noLink: true,
                    buttons: ['Go back', '🎵'],
                }).then(
                    createOpenLinkCallback('https://www.youtube.com/watch?v=q879j3ydfw8', 1)
                );
            }
        },
        {
            label: 'How to deal with conqs on nomad?',
            click: showItDepends
        },
        {
            label: 'How to counter Turk fast IMP on arena?',
            click: showItDepends
        },
        {
            label: 'What to do against eagalos?',
            click: async () => {
                dialog.showMessageBox({
                    title: 'What to do against HOOOVEERRINNG EAGALOS???????????',
                    type: 'info',
                    message: 'The eagalos are...',
                    buttons: ['HOOVERING', 'IN MY ECONOMY'],
                }).then(
                    createOpenLinkCallback('https://www.twitch.tv/diviumfuror/clip/ShortAliveSeahorseHotPokket-61l8_LhDyQY4G6Ne')
                );
            },
        },
        {
            label: 'Should I go knights with Franks?',
            click: showItDepends
        },
        {
            label: 'Why do pros never do murder holes?',
            click: showItDepends
        },
        {
            label: 'Should Burgundians be making cavalier?',
            click: async () => {
                dialog.showMessageBox({
                    title: 'NOT THAT SIMPLE!',
                    type: 'info',
                    message: 'Burgundians must be making cavaliers, so camels... no! Burgundians can also make crossbows, maybe pikeman. They can also make... not cavalier... maybe monks!',
                    noLink: true,
                    buttons: ['Go back', '🎵'],
                }).then(
                    createOpenLinkCallback('https://www.youtube.com/watch?v=E2mMu2Xvohg', 1)
                );
            }
        },
        {
            label: 'How to kill full arb bbc from Ethiopians?',
            click: showItDepends
        },
        {
            label: 'What to do against monks converting my Feitoria?',
            click: async () => {
                dialog.showMessageBox({
                    title: 'Feitoria Wololo!',
                    type: 'info',
                    message: '"And he\'s like wait a second... Wolololololololo"',
                    noLink: true,
                    buttons: ['Go back', '🎵'],
                }).then(
                    createOpenLinkCallback('https://www.youtube.com/watch?v=suXZqC3VrUw', 1)
                );
            }
        },
        {
            label: 'How to counter Cuman double TC boom?',
            click: async () => {
                dialog.showMessageBox({
                    title: 'How to counter Cuman double TC boom?',
                    type: 'warning',
                    message: 'You don\'t.',
                    noLink: true,
                    buttons: ['...'],
                }).then(() => {
                    dialog.showMessageBoxSync({
                        title: 'How to counter Cuman double TC boom?',
                        type: 'warning',
                        message: 'You resign.',
                        noLink: true,
                        buttons: ['...'],
                    })
                });
            }
        },
    ],
}
