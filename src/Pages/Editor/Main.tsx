import React from "react";
import { useEffect } from "react";
import {
  RendererViewData,
  rendererViewType,
  viewCameraType,
} from "../../Editor/EditorDataInterfaces";
import EditorManager from "../../Editor/EditorManager";

export default function Main() {
  const canvasArray: RendererViewData[] = [];

  useEffect(() => {
    const editorRenderer = EditorManager.getInstance().getRenderer();

    if (!editorRenderer) return;

    canvasArray.push({
      canvas: document.getElementById("myRender") as HTMLCanvasElement,
      type: rendererViewType.VIEW_TOP,
      cameraType: viewCameraType.ORTHOGRAPHIC,
    });
    canvasArray.push({
      canvas: document.getElementById("myRender2") as HTMLCanvasElement,
      type: rendererViewType.VIEW_SIDE,
      cameraType: viewCameraType.ORTHOGRAPHIC,
    });
    canvasArray.push({
      canvas: document.getElementById("myRender3") as HTMLCanvasElement,
      type: rendererViewType.VIEW_FRONT,
      cameraType: viewCameraType.ORTHOGRAPHIC,
    });
    canvasArray.push({
      canvas: document.getElementById("myRender4") as HTMLCanvasElement,
      type: rendererViewType.VIEW_MAIN,
      cameraType: viewCameraType.PERSPECTIVE,
    });

    editorRenderer.createViews(canvasArray);
  }, []);

  function onResizeViews(e: React.MouseEvent<HTMLLabelElement, MouseEvent>) {
    e.preventDefault();
    console.log("OnResizeViews");

    document
      .getElementById("editorViews")!
      .addEventListener("mousemove", resize);
    document
      .getElementById("editorViews")!
      .addEventListener("mouseup", stopResize);
  }

  function resize(e: MouseEvent) {
    const ratio = (e.clientX - 225) / (window.innerWidth - 225);
    const calc1 = e.clientX - 225;

    const calc2 = window.innerWidth - e.clientX;

    if (ratio < 0.5) {
      document.getElementById("1")!.style.maxWidth = "100%";
      document.getElementById("3")!.style.maxWidth = "100%";

      document.getElementById("0")!.style.maxWidth = calc1.toString() + "px";
      document.getElementById("2")!.style.maxWidth = calc1.toString() + "px";
    } else {
      document.getElementById("0")!.style.maxWidth = calc1.toString() + "px";
      document.getElementById("2")!.style.maxWidth = calc1.toString() + "px";

      document.getElementById("1")!.style.maxWidth = calc2.toString() + "px";
      document.getElementById("3")!.style.maxWidth = calc2.toString() + "px";
    }

    /** vertical resizing */
    const ratioV =
      (e.clientY - 40) / (window.innerHeight - 40) + 24 / window.innerHeight;
    document.getElementById("topViewsRow")!.style.height = ratioV * 100 + "%";

    document.getElementById("bottomViewsRow")!.style.height =
      (1 - ratioV) * 100 + "%";

    const editorRenderer = EditorManager.getInstance().getRenderer();

    if (!editorRenderer) return;
    editorRenderer.onViewsResize();
  }

  function stopResize(e: MouseEvent) {
    document
      .getElementById("editorViews")!
      .removeEventListener("mousemove", resize);
  }

  function resetViews(e: React.MouseEvent<HTMLLabelElement, MouseEvent>) {
    document.getElementById("0")!.style.maxWidth = "100%";
    document.getElementById("1")!.style.maxWidth = "100%";
    document.getElementById("2")!.style.maxWidth = "100%";
    document.getElementById("3")!.style.maxWidth = "100%";
    document.getElementById("topViewsRow")!.style.height = "50%";
    document.getElementById("bottomViewsRow")!.style.height = "50%";

    const editorRenderer = EditorManager.getInstance().getRenderer();

    if (!editorRenderer) return;
    editorRenderer.onViewsResize();
  }

  return (
    <div className="editor">
      <div className="container editor-container" id="editorViews">
        <div className="row row-editor" id="topViewsRow">
          <div className="col" id="0">
            <canvas id="myRender" className="renderer"></canvas>

            <label
              onMouseDown={onResizeViews}
              onDoubleClick={resetViews}
              style={{
                position: "absolute",
                bottom: 10,
                right: 0,
                width: 30,
              }}
            >
              <i className="fas fa-arrows-alt"></i>
            </label>
          </div>
          <div className="col" id="1">
            <canvas id="myRender2" className="renderer"></canvas>
          </div>
        </div>
        <div
          className="row row-editor"
          id="bottomViewsRow"
          style={{ marginTop: 1 }}
        >
          <div className="col" id="2">
            <canvas id="myRender3" className="renderer"></canvas>
          </div>
          <div className="col" id="3">
            <canvas id="myRender4" className="renderer"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
