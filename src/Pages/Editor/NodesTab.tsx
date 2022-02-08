import React, { Fragment } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Vector3 } from "three";
import ContextMenu from "../../Components/vanilla-context-menu";
import EditorData, {
  EditorGrp,
  EditorNode,
  EditorSlot,
} from "../../Editor/EditorDataInterfaces";
import EditorManager from "../../Editor/EditorManager";

export default function NodesTab(props: { editorData: EditorData }) {
  const [editorData, setEditorData] = useState(props.editorData);

  const [currSlotId, setCurrSlotId] = useState<number>(0);

  const [selectedNode, setSelectedNode] = useState<EditorNode>({
    info: {
      id: -1,
      name: "Undefined",
      grpId: -1,
    },

    position: new Vector3(0, 0, 0),
    isVisible: true,
  });

  useEffect(() => {
    setEditorData(props.editorData);
  }, [props.editorData]);

  //

  function toggleNodeVisiblity(slotId: number, node: EditorNode) {
    EditorManager.getInstance()
      .getEditorObj()
      .setNodeVisibility(slotId, node.info.id, !node.isVisible);
  }

  function toggleSlotVisiblity(slot: EditorSlot) {
    EditorManager.getInstance()
      .getEditorObj()
      .setSlotVisibility(slot.id, !slot.isVisible);
  }

  function toggleGrpVisiblity(slotId: number, grp: EditorGrp) {
    EditorManager.getInstance()
      .getEditorObj()
      .setGrpVisibility(slotId, grp.id, !grp.isVisible);
  }

  function setSelectedNodeData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    EditorManager.getInstance()
      .getEditorObj()
      .setNodeData(selectedNode.slotId!, selectedNode);
  }

  //
  function generateNodeRow(slot: EditorSlot, node: EditorNode) {
    return (
      <div key={node.info.id}>
        <div
          onMouseDown={() => {
            node.slotId = slot.id;
            setSelectedNode(JSON.parse(JSON.stringify(node)));
          }}
          onContextMenuCapture={(e) => {
            new ContextMenu(e, [
              {
                label: "Add new group before node",
                callback: () => {
                  EditorManager.getInstance()
                    .getWinManager()
                    .showGrpNodesWindow(slot.id, node.info.id);
                },
              },
              "hr",
              {
                label: "Delete node",
                callback: () => {
                  EditorManager.getInstance()
                    .getEditorObj()
                    .removeNode(node.info.id, slot.id);
                },
              },
            ]);
          }}
          className={
            "row  " + (selectedNode.info.id == node.info.id ? "active" : "")
          }
        >
          <div className="col checkbox-col">
            <input
              type="checkbox"
              name=""
              id=""
              className="form-check-input"
              checked={node.isVisible}
              onChange={() => toggleNodeVisiblity(slot.id, node)}
            />
          </div>
          <div className="col nodename-col">{node.info.name}</div>
          <div className="col">{Math.trunc(node.position.x * 100) / 100}</div>
          <div className="col">{Math.trunc(node.position.y * 100) / 100}</div>
          <div className="col">{Math.trunc(node.position.z * 100) / 100}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="node-table"
        onContextMenuCapture={(e) => {
          e.preventDefault();
          new ContextMenu(e, [{ label: "New slot" }]);
        }}
      >
        {/*  */}
        {editorData.slots.map((slot) => {
          return (
            <div className="accordion-item" key={slot.id}>
              <div
                className={
                  "row  " + (currSlotId == slot.id ? "active-slot" : "")
                }
                onMouseDown={() => {}}
                onContextMenuCapture={(e) => {
                  e.preventDefault();
                  new ContextMenu(e, [
                    {
                      label: "Select slot",
                      callback: () => {
                        setCurrSlotId(slot.id);
                        EditorManager.getInstance()
                          .getEditorObj()
                          .setSelectedSlotId(slot.id);
                      },
                    },
                    "hr",
                    { label: "Show only this" },
                    { label: "Show all" },
                  ]);
                }}
              >
                <div className="col checkbox-col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={slot.isVisible}
                    onChange={() => toggleSlotVisiblity(slot)}
                  />
                </div>
                <div className="col">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#SlotN` + slot.id}
                      aria-expanded="false"
                      aria-controls={`#SlotN` + slot.id}
                    >
                      <div className="acc-title">slot: {slot.title}</div>
                    </button>
                  </h2>
                </div>
              </div>
              {/*  */}
              <div
                id={`SlotN` + slot.id}
                data-bs-parent={`#SlotN` + slot.id}
                className="accordion-collapse collapse"
              >
                {slot.nodes.length == 0 && (
                  <div>
                    <div className="row">
                      <div className="col">Empty</div>
                    </div>
                  </div>
                )}

                {slot.nodes
                  .filter((node) => node.info.grpId == -1)
                  .map((node) => {
                    return generateNodeRow(slot, node);
                  })}

                {slot.grps
                  .filter((grp) => grp.type == "node")
                  .map((grp) => {
                    return (
                      <div key={grp.id}>
                        <div
                          className="accordion-item"
                          onContextMenuCapture={(e) => {
                            new ContextMenu(e, [
                              { label: "Rename group" },
                              "hr",
                              { label: "Duplicate" },
                              { label: "Delete" },
                              "hr",
                              { label: "Show only this" },
                              { label: "Show all" },
                            ]);
                          }}
                        >
                          <div className="row grp-row">
                            {grp.id != -1 && (
                              <Fragment>
                                <div className="col checkbox-col">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={grp.isVisible}
                                    onChange={() =>
                                      toggleGrpVisiblity(slot.id, grp)
                                    }
                                  />
                                </div>
                                <div className="col">
                                  <h2 className="accordion-header">
                                    <button
                                      className="accordion-button groups-button collapsed"
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#groupN` + grp.id}
                                      aria-expanded="true"
                                      aria-controls={`groupN` + grp.id}
                                    >
                                      <div
                                        className="acc-title"
                                        title={grp.title}
                                      >
                                        grp: {grp.title}
                                      </div>
                                    </button>
                                  </h2>
                                </div>
                              </Fragment>
                            )}
                          </div>
                          <div
                            id={`groupN` + grp.id}
                            data-bs-parent={`#groupN` + grp.id}
                            className="accordion-collapse collapse"
                          >
                            {slot.nodes
                              .filter((nodes) => nodes.info.grpId == grp.id)
                              ?.map((node) => {
                                return generateNodeRow(slot, node);
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {/*  */}
            </div>
          );
        })}

        {/*  */}
      </div>
      <form
        className="card bg-secondary sidebar-editor"
        onSubmit={setSelectedNodeData}
      >
        <div className="card-body">
          <div style={{ minHeight: 105 }}>
            <div className="row">
              <div className="col-3">
                <label>Name:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedNode.info.name}
                  disabled={selectedNode.info.id == -1}
                  onChange={(e) => {
                    const data = Object.assign({}, selectedNode);
                    data.info.name = e.target.value;
                    setSelectedNode(data);
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3">
                <label>x:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedNode.position.x}
                  disabled={selectedNode.info.id == -1}
                  onChange={(e) => {
                    const data = Object.assign({}, selectedNode);
                    data.position.x = Number(e.target.value);
                    setSelectedNode(data);
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3">
                <label>y:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedNode.position.y}
                  disabled={selectedNode.info.id == -1}
                  onChange={(e) => {
                    const data = Object.assign({}, selectedNode);
                    data.position.y = Number(e.target.value);
                    setSelectedNode(data);
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3">
                <label>z:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedNode.position.z}
                  disabled={selectedNode.info.id == -1}
                  onChange={(e) => {
                    const data = Object.assign({}, selectedNode);
                    data.position.z = Number(e.target.value);
                    setSelectedNode(data);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="d-grid gap-2 mx-auto">
                <button
                  className="btn btn-primary btn-sm me-0"
                  disabled={selectedNode.info.id == -1}
                  type="submit"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
