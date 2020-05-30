import Vue from "vue";
import TruckEditor from "../../components/Editor/ts/TruckEditor";

export default class EditorComponent extends Vue {
    /**
     * using ts ignore because typescript have no clue what the parent has
     */
    //@ts-ignore
    protected EditorObj: TruckEditor = undefined;

    protected init() {
        this.$root.$on("setEditorObj", (obj: TruckEditor) => {
            this.setEditorObj(obj);
        });
    }

    public setEditorObj(obj: TruckEditor) {
        this.EditorObj = obj;
        console.log("obj set");
    }
}
