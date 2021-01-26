<template>
    <div class="editor">
        <div class="container editor-container" id="editorViews">
            <div class="row row-editor" id="topViewsRow">
                <div
                    class="col"
                    style="padding-right: 1px; padding-left: 0px; border-right-style: solid; border-bottom-style: solid; border-width: 1px;"
                    id="0"
                >
                    <canvas id="myRender" class="renderer"></canvas>
                    <canvas
                        id="viewCube"
                        class="nav-cube"
                        style="top: 5px; right: 5px"
                    ></canvas>
                    <label
                        @mousedown="OnResizeViews"
                        @dblclick="resetViews"
                        style="position: absolute; bottom: 10px; right:0px; width: 30px;"
                    >
                        <BIconArrowsMove
                            style="font-size: 1.2rem; color: white;"
                    /></label>
                </div>
                <div
                    class="col"
                    style="padding-right: 1px; padding-left: 0px; border-right-style: solid; border-bottom-style: solid; border-width: 1px;"
                    id="1"
                >
                    <canvas id="myRender2" class="renderer"></canvas>
                    <canvas
                        id="viewCube"
                        class="nav-cube"
                        style="top: 5px; right: 5px"
                    ></canvas>
                </div>
            </div>
            <div
                class="row row-editor"
                id="bottomViewsRow"
                style="margin-top: 1px;"
            >
                <div
                    class="col"
                    style="padding-right: 1px; padding-left: 0px; border-right-style: solid; border-bottom-style: solid; border-width: 1px;"
                    id="2"
                >
                    <canvas id="myRender3" class="renderer"></canvas>
                    <canvas
                        id="viewCube"
                        class="nav-cube"
                        style="top: 5px; right: 5px"
                    ></canvas>
                </div>
                <div
                    class="col"
                    style="padding-right: 1px; padding-left: 0px; border-right-style: solid; border-bottom-style: solid; border-width: 1px;"
                    id="3"
                >
                    <canvas id="myRender4" class="renderer"></canvas>
                    <canvas
                        id="viewCube"
                        class="nav-cube"
                        style="top: 5px; right: 5px"
                    ></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";

import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";
import {
    RendererViewData,
    rendererViewType,
    viewCameraType
} from "@/components/Editor/ts/TruckEditorInterfaces";

@Options({
    components: {}
})
export default class EditorMain extends Vue {
    /**
     *
     * We define our renders here
     *
     */
    private canvasArray: RendererViewData[] = [];

    mounted() {
        const editorRenderer = TruckEditorManager.getInstance().getRendererObj();
        if (!editorRenderer) return;

        this.canvasArray.push({
            canvas: document.getElementById("myRender") as HTMLCanvasElement,
            type: rendererViewType.VIEW_TOP,
            cameraType: viewCameraType.ORTHOGRAPHIC
        });
        this.canvasArray.push({
            canvas: document.getElementById("myRender2") as HTMLCanvasElement,
            type: rendererViewType.VIEW_SIDE,
            cameraType: viewCameraType.ORTHOGRAPHIC
        });
        this.canvasArray.push({
            canvas: document.getElementById("myRender3") as HTMLCanvasElement,
            type: rendererViewType.VIEW_FRONT,
            cameraType: viewCameraType.ORTHOGRAPHIC
        });
        this.canvasArray.push({
            canvas: document.getElementById("myRender4") as HTMLCanvasElement,
            type: rendererViewType.VIEW_MAIN,
            cameraType: viewCameraType.PERSPECTIVE
        });

        editorRenderer.createViews(this.canvasArray);

        TruckEditorManager.getInstance().onLoaded();
    }

    beforeUnmount() {
        TruckEditorManager.getInstance().onLeave();
    }

    /**
     * resizable views
     */

    OnResizeViews(e: MouseEvent) {
        e.preventDefault();

        document
            .getElementById("editorViews")!
            .addEventListener("mousemove", this.resize);
        document
            .getElementById("editorViews")!
            .addEventListener("mouseup", this.stopResize);
    }

    /**
     * To be honnest
     * I have no idea how I did this but it "works"
     */
    resize(e: MouseEvent) {
        /**horizental resizing */

        const ratio = (e.clientX - 225) / (window.innerWidth - 225);
        const calc1 = e.clientX - 225;

        const calc2 = window.innerWidth - e.clientX;

        if (ratio < 0.5) {
            document.getElementById("1")!.style.maxWidth = "100%";
            document.getElementById("3")!.style.maxWidth = "100%";

            document.getElementById("0")!.style.maxWidth =
                calc1.toString() + "px";
            document.getElementById("2")!.style.maxWidth =
                calc1.toString() + "px";
        } else {
            document.getElementById("0")!.style.maxWidth =
                calc1.toString() + "px";
            document.getElementById("2")!.style.maxWidth =
                calc1.toString() + "px";

            document.getElementById("1")!.style.maxWidth =
                calc2.toString() + "px";
            document.getElementById("3")!.style.maxWidth =
                calc2.toString() + "px";
        }

        /** vertical resizing */
        const ratioV =
            (e.clientY - 40) / (window.innerHeight - 40) +
            24 / window.innerHeight;
        document.getElementById("topViewsRow")!.style.height =
            ratioV * 100 + "%";

        document.getElementById("bottomViewsRow")!.style.height =
            (1 - ratioV) * 100 + "%";

        const editorRenderer = TruckEditorManager.getInstance()?.getRendererObj();
        if (!editorRenderer) return;

        editorRenderer.onViewsResize();
    }

    stopResize(e: MouseEvent) {
        document
            .getElementById("editorViews")!
            .removeEventListener("mousemove", this.resize);
    }

    resetViews(e: MouseEvent) {
        document.getElementById("0")!.style.maxWidth = "100%";
        document.getElementById("1")!.style.maxWidth = "100%";
        document.getElementById("2")!.style.maxWidth = "100%";
        document.getElementById("3")!.style.maxWidth = "100%";
        document.getElementById("topViewsRow")!.style.height = "50%";
        document.getElementById("bottomViewsRow")!.style.height = "50%";

        const editorRenderer = TruckEditorManager.getInstance()?.getRendererObj();
        if (!editorRenderer) return;

        editorRenderer.onViewsResize();
    }
}
</script>

<style lang="scss">
.editor {
    //100% - 40px navbar
    //margin-top: -8px;
    height: calc(100vh - 40px);
    overflow: hidden;
    //height: 100vh ;
}

.editor-container {
    height: 100%;
    padding-right: 11px !important; //12px - 1px border
    padding-left: 12px !important;
    //margin-top: 10px;
    .row {
        height: 50%;

        //margin-bottom: 10px;
    }
    .col {
        //height: 100%;
        position: relative;

        height: 100%;
        .renderer {
            //border: 1px $secondary solid;
            height: 100%;
            width: 100%;
            display: block;
        }

        canvas:focus {
            outline: none;
        }
    }
}

.nav-cube {
    /* background-color: aliceblue; */
    position: absolute;
    z-index: 9;
    height: 50px;
    width: 50px;
}
</style>
