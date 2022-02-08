import React, { useEffect, useState } from "react";
import { appWindow } from "@tauri-apps/api/window";
import { emit } from "@tauri-apps/api/event";

export default function AddGrp() {
  const [errorLabel, setErrorLabel] = useState<string>("");

  const [grpTitle, setGrpTitle] = useState<string>("");

  const [grpData, setGrpData] = useState<{
    slotId: number;
    nodeId: number;
    type: string;
  }>({
    slotId: -1,
    nodeId: -1,
    type: "node",
  });

  console.log("hai");

  function cancel() {
    appWindow.hide();
  }

  function apply() {
    setErrorLabel("");

    emit(
      "backData",
      JSON.stringify({
        action: "addGrp",
        payload: {
          grpTitle,
          ...grpData,
        },
      })
    ).then(() => appWindow.hide());
  }

  appWindow.listen("data", (e) => {
    setGrpData(JSON.parse(e.payload as string));
  });

  return (
    <div className="container">
      <div className="my-3">
        <label htmlFor="grpName" className="form-label">
          Group title:
        </label>
        <input
          type="text"
          className="form-control"
          value={grpTitle}
          onChange={(e) => {
            setGrpTitle(e.target.value);
          }}
        />
        <small className="text-danger">{errorLabel}</small>
      </div>
      <hr />
      <p className="my-2" style={{ height: 40 }}>
        You will be adding a new group before
        <b>{` ${grpData.type} ${grpData.nodeId} `}</b>
        and will affect it to all the {grpData.type + `s`} after it.
      </p>
      <div className="float-end">
        <button type="button" className="btn btn-danger" onClick={cancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={apply}
          disabled={grpTitle.length == 0}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
