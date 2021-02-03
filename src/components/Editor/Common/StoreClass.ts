import { EditorTruckData } from "../TruckEditorInterfaces";

export default abstract class StoreClass {
    protected isSaved = true;
    protected filePath = "";

    public abstract reset(): void;
    public abstract create(title: string, slotTitle?: string): void;

    public setFilePath(filePath: string) {
        this.filePath = filePath;
    }

    public getFilePath(): string {
        return this.filePath;
    }

    public getSaveState(): boolean {
        return this.isSaved;
    }

    public setSaveState(state: boolean) {
        this.isSaved = state;
    }
}
