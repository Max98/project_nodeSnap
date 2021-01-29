import { dialog, BrowserWindow } from "electron";

/**
 * We register all modals here so they get inited
 * then we show them when we need them for better performance
 */

interface WinInfo {
    win: BrowserWindow;
    name: string;
}

export default class ModalsManager {
    private winArray: WinInfo[];
    private static instance: ModalsManager;
    private canDispose = false;

    constructor() {
        ModalsManager.instance = this;

        console.log("Init modals manager");
        this.winArray = [];

        this.createModal("Settings", "/#/Modals/Settings", {
            width: 600,
            height: 300
        });

        this.createModal("renameGrp", "/#/Modals/Groups/Rename", {
            width: 600,
            height: 180
        });

        this.createModal("addGrp", "/#/Modals/Groups/Add", {
            width: 600,
            height: 230
        });

        this.createModal("duplicateGrp", "/#/Modals/Groups/Duplicate", {
            width: 600,
            height: 350
        });

        this.createModal("Blueprint", "/#/Modals/Blueprint", {
            width: 600,
            height: 300
        });

        this.createModal(
            "transformRotation",
            "/#/Modals/Transformation/Rotation",
            {
                width: 600,
                height: 250
            }
        );

        this.createModal(
            "transformTranslation",
            "/#/Modals/Transformation/Translation",
            {
                width: 600,
                height: 380
            }
        );

        this.createModal("transformScale", "/#/Modals/Transformation/Scale", {
            width: 600,
            height: 250
        });
    }

    public dispose() {
        this.canDispose = true;

        this.winArray.forEach(el => {
            el.win.close();
        });
    }

    /**
     * Returns the instance after it has been created
     */
    public static getInstance(): ModalsManager {
        if (!ModalsManager.instance) {
            ModalsManager.instance = new ModalsManager();
        }

        return ModalsManager.instance;
    }

    /**
     * register a new modal
     * @param name
     * @param url
     * @param param
     */
    private createModal(
        name: string,
        url: string,
        param: { width: number; height: number }
    ) {
        this.winArray.push({
            name,
            win: new BrowserWindow({
                width: param.width,
                height: param.height,
                show: false,
                resizable: false,
                maximizable: false,
                webPreferences: {
                    webSecurity: true,
                    allowRunningInsecureContent: true,
                    enableRemoteModule: true,
                    nodeIntegration: (process.env
                        .ELECTRON_NODE_INTEGRATION as unknown) as boolean
                }
            })
        });

        const currWin = this.winArray[this.winArray.length - 1].win;

        //currWin.webContents.openDevTools();
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            currWin.loadURL(
                (process.env.WEBPACK_DEV_SERVER_URL as string) + url
            );
        } else {
            currWin.loadURL("app://./index.html" + url);
        }

        currWin.webContents.on("did-finish-load", () => {
            currWin.webContents.send("setId", { id: "Modal" });
        });

        currWin.on("close", event => this.preventClose(currWin, event));
    }

    private preventClose(currWin: BrowserWindow, event: Electron.Event) {
        if (!this.canDispose) {
            event.preventDefault();
            currWin.hide();
        }
    }

    /**
     * change modal state
     * @param name modal name
     * @param state visibility state
     * @param data option data to send
     */
    public setModalVisibility(name: string, state: boolean, data?: any) {
        const currBWin = this.winArray.filter(el => el.name == name)[0].win;

        if (data != undefined) {
            currBWin.webContents.send("data", data);
        }

        if (state) currBWin.show();
        else currBWin.hide();
    }

    /**
     * Hide all shown modals
     * TODO: hide specific group of modals
     */
    public hideAllModals() {
        this.winArray.forEach(el => {
            el.win.hide();
        });
    }
}
