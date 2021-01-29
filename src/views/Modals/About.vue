<template>
    <div class="container" style="padding-top: 5px;">
        <h3 style="color: white">
            About
        </h3>
        <p>
            nodeSnap is an open source editor for the physics data format used
            by Rigs of rods and BeamNG.
        </p>
        <br />
        <h3 style="color: white">Controls</h3>
        <hr />

        <h4>Interface:</h4>
        <ul>
            <li>Double click on view resizer => reset view resizer</li>
        </ul>
        <h4>Camera:</h4>
        <ul>
            <li>Right click + mouse move => move camera around</li>
            <li>
                Left click + mouse move (Only on perspective view aka 3D view)
                => rotate on axis
            </li>
            <li>Mouse wheel => Zoom</li>
        </ul>
        <h4>Editor:</h4>
        <ul>
            <li>CTRL + N => truck mode</li>
            <li>CTRL + B => blueprint mode</li>
            <br />
            <li>
                Truck Mode:
                <ul>
                    <li>Mouse double left click => new node</li>
                    <li>
                        Mouse double left click + CTRL => new node snapped on
                        grid
                    </li>
                    <li>Mouse click on a node + drag => Move node around</li>
                    <li>
                        Mouse click on a node + drag + CTRL => Move node around
                        with grid snapping to the preset value
                    </li>
                    <li>
                        CTRL + SHIFT + click node1 + click node2 => Creates a
                        beam + shows a temporary blue line before you click on
                        the second node
                    </li>
                </ul>
            </li>
            <br />
            <li>
                Blueprint Mode:
                <ul>
                    <li>Mouse + gizmo => transform</li>
                    <li>Key "S" => scale mode</li>
                    <li>Key "R" => rotate mode</li>
                    <li>Key "T" => translate mode</li>
                </ul>
            </li>
        </ul>

        <br />
        <h3 style="color: white">Credits</h3>
        <hr />
        <p>
            <b style="color:white">Max98</b> (Moncef Slimene): Author, Lead
            developer.
        </p>
        <p>
            <b style="color:white">only-a-ptr</b> (Petr Ohidal): RoR Parser
            structure & inspiration.
        </p>
        <p><b style="color:white">Ben, Tuusita</b>: Orignal rorEditorizer</p>
        <p>
            <b style="color:white">yoavmil</b> (Yoav Miller): original 3D View
            cube
        </p>
        <br />
        <h6>Testers & notable contribution:</h6>
        <ul>
            <li>4x4convoy</li>
            <li>AgentV12</li>
            <li>WillyB1337</li>
            <li>Brett</li>
        </ul>
        <br />
        <h6>Made with:</h6>
        <ul>
            <li>Electron</li>
            <li>Bootstrap</li>
            <li>Vue 3 / Vuex 4</li>
            <li>three.js</li>
            <li>Typescript</li>
            <li>Node.js</li>
        </ul>
        <p>
            Notable:
            <i>
                mime-types, node-watch, xml2js, vue-router, vue-toastification,
                vue-class-component, electron-log, electron-store,
                bootstrap-icons-vue, tween.js</i
            >
        </p>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";
import { ipcRenderer } from "electron";

const remote = require("electron").remote;

export default class Help extends Vue {}
</script>

<style></style>
