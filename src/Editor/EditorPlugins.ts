import { fs } from "@tauri-apps/api";
import Editor from "./Editor";
import EditorImporterMananger from "./EditorImporterManager";
import EditorRenderer from "./EditorRenderer";

const globalPlugin = true;

export default class EditorPlugins {
  list: {
    id: number;
    path: string;
    name?: string;
    actions: { label: string; callback: Function }[];
  }[] = [];

  constructor(
    _Editor: Editor,
    _Renderer: EditorRenderer,
    _Importer: EditorImporterMananger
  ) {
    this.loadPlugins();
  }

  async loadPlugins() {
    fs.readDir("C:\\Projects\\project_nodesnap\\plugins").then(
      async (files) => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          this.list.push({
            id: i,
            path: file.path,
            actions: [],
          });

          try {
            const fileJS = await fs.readTextFile(file.path);
            const f = eval(fileJS);

            const g = f(this, i);
            g.init();
          } catch (error) {
            console.error(error);
          }
        }

        console.log(this.list);
        this.list[0].actions[0].callback();
      }
    );
  }

  private registerPlugin(id: number, name: string) {
    console.log(`registering: ${name}`);

    const plugin = this.list.find((el) => el.id == id);
    if (!plugin) return;

    plugin.name = name;
  }

  private registerAction(id: number, label: string, callback: Function) {
    console.log(`action: ${label}`);

    const plugin = this.list.find((el) => el.id == id);
    if (!plugin) return;

    plugin.actions.push({ label, callback });
  }
}
