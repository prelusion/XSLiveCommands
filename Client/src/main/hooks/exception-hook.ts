import {WebContents, app, dialog} from "electron";
import type {
    Details,
    RenderProcessGoneDetails,
    Event,
    BrowserWindow,
} from "electron";

export interface UseProcessExceptionReturn {
    /**
     * Emitted when the renderer process unexpectedly disappears. This is normally because it was crashed or killed.
     * If a listener is not passed in, it will default to following the crash prompt.
     *
     * @see https://www.electronjs.org/docs/latest/api/app#event-render-process-gone
     */
    renderProcessGone: (
        listener?: (
            event: Event,
            webContents: WebContents,
            details: RenderProcessGoneDetails
        ) => void
    ) => void;
    /**
     * Emitted when the child process unexpectedly disappears. This is normally because it was crashed or killed. It does not include renderer processes.
     * If a listener is not passed in, it will default to following the crash prompt.
     *
     * @see https://www.electronjs.org/docs/latest/api/app#event-child-process-gone
     */
    childProcessGone: (
        window: BrowserWindow,
        listener?: (event: Event, details: Details) => void
    ) => void;
}

export const useProcessException = (): UseProcessExceptionReturn => {
    const renderProcessGone = (
        listener?: (
            event: Event,
            webContents: WebContents,
            details: RenderProcessGoneDetails
        ) => void
    ) => {
        app.on("render-process-gone", (event, webContents, details) => {
            if (listener) {
                listener(event, webContents, details);
                return;
            }
            const message = {
                title: "",
                buttons: [] as string[],
                message: "",
            };
            switch (details.reason) {
                case "crashed":
                    message.title = "Warning";
                    message.buttons = ["Ok", "Exit"];
                    message.message = "The renderer process has crashed. Would you like to perform a soft restart?";
                    break;
                case "killed":
                    message.title = "Warning";
                    message.buttons = ["Ok", "Exit"];
                    message.message = "The renderer process was terminated unexpectedly. Would you like to perform a soft restart?";
                    break;
                case "oom":
                    message.title = "Warning";
                    message.buttons = ["Ok", "Exit"];
                    message.message = "Out of memory. Would you like to perform a soft restart to free up memory?";
                    break;
                default:
                    break;
            }
            dialog
                .showMessageBox({
                    type: "warning",
                    title: message.title,
                    buttons: message.buttons,
                    message: message.message,
                    noLink: true,
                })
                .then((res) => {
                    if (res.response === 0) webContents.reload();
                    else webContents.close();
                });
        });
    };
    const childProcessGone = (
        window: BrowserWindow,
        listener?: (event: Event, details: Details) => void
    ) => {
        app.on("child-process-gone", (event, details) => {
            if (listener) {
                listener(event, details);
                return;
            }
            const message = {
                title: "",
                buttons: [] as string[],
                message: "",
            };
            switch (details.type) {
                case "GPU":
                    switch (details.reason) {
                        case "crashed":
                            message.title = "Warning";
                            message.buttons = ["Ok", "Exit"];
                            message.message = "The GPU process has crashed. Would you like to disable hardware acceleration and restart?";
                            break;
                        case "killed":
                            message.title = "Warning";
                            message.buttons = ["Ok", "Exit"];
                            message.message = "The GPU process was terminated unexpectedly. Would you like to disable hardware acceleration and restart?";
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            dialog
                .showMessageBox(window, {
                    type: "warning",
                    title: message.title,
                    buttons: message.buttons,
                    message: message.message,
                    noLink: true,
                })
                .then((res) => {
                    // Use this setting to disable GPU acceleration when a GPU crash occurs.
                    if (res.response === 0) {
                        if (details.type === "GPU") app.disableHardwareAcceleration();
                        window.reload();
                    } else {
                        window.close();
                    }
                });
        });
    };
    return {
        renderProcessGone,
        childProcessGone,
    };
};
