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

    constructor() {
        ModalsManager.instance = this;

        console.log("Init modals manager");
        this.winArray = [];

        this.createModal(
            "Settings",
            "http://localhost:8081/#/Modals/Settings",
            { width: 600, height: 300 }
        );

        this.createModal(
            "renameGrp",
            "http://localhost:8081/#/Modals/Groups/Rename",
            { width: 600, height: 180 }
        );

        this.createModal(
            "addGrp",
            "http://localhost:8081/#/Modals/Groups/Add",
            { width: 600, height: 230 }
        );
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
                    enableRemoteModule: true,
                    nodeIntegration: true
                }
            })
        });

        const currWin = this.winArray[this.winArray.length - 1].win;

        currWin.loadURL(url);

        currWin.on("close", event => {
            event.preventDefault();
            currWin.hide();
        });
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
