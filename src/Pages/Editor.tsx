import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import gVars from "../Editor/Bridge";
import EditorData, { EditorSlot } from "../Editor/EditorDataInterfaces";
import EditorManager from "../Editor/EditorManager";
import BeamsTab from "./Editor/BeamsTab";
import Main from "./Editor/Main";
import Navbar from "./Editor/Navbar";
import NodesTab from "./Editor/NodesTab";
import { dialog } from "@tauri-apps/api";

export default function Editor() {
  let updateData;

  const [editorData, setEditorData] = useState<EditorData>({
    title: "Untitled",
    slots: [] as EditorSlot[],
  });

  useEffect(() => {
    // dialog.open().then((path) => {
    //   EditorManager.getInstance().loadData(path.toString());
    //   console.log(path);
    // });

    gVars.updateUI = (data: EditorData) => {
      setEditorData({ ...data });
    };

    return () => {
      gVars.updateUI = null;
    };
  }, []);

  useEffect(() => {
    console.log(editorData);
    return () => {};
  }, [editorData]);

  return (
    <div>
      <div className="row">
        <div className="col side_bar_col">
          <div className="card sidebar_menu_card">
            <div className="sidebar_header">
              <p>nodeSnap</p>
            </div>
            <ul className="nav nav-tabs nav-fill" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="nodes-tab"
                  data-bs-toggle="tab"
                  role="tab"
                  href="#nodes"
                >
                  Nodes
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="beams-tab"
                  data-bs-toggle="tab"
                  role="tab"
                  href="#beams"
                >
                  Beams
                </a>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="nodes"
                role="tabpanel"
              >
                <NodesTab editorData={editorData} />
              </div>

              <div className="tab-pane fade" id="beams" role="tabpanel">
                {/* <EditorBeamsTab /> */}
                <BeamsTab editorData={editorData} />
              </div>
            </div>
          </div>
        </div>
        <div className="col body_col">
          <Navbar />
          <Main />
        </div>
      </div>
    </div>
  );
}
