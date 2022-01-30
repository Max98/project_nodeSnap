import React, { Fragment } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Vector3 } from "three";
import EditorData, {
  EditorGrp,
  EditorNode,
  EditorSlot,
} from "../../Editor/EditorDataInterfaces";

export default function NodesTab(props: { editorData: EditorData }) {
  const [editorData, setEditorData] = useState(props.editorData);

  const [selectedNode, setSelectedNode] = useState<EditorNode>({
    info: {
      id: -1,
      name: "",
      grpId: -1,
    },

    position: new Vector3(0, 0, 0),
    isVisible: true,
  });

  useEffect(() => {
    setEditorData(props.editorData);
  }, [props.editorData]);

  //

  function toggleNodeVisiblity(node: EditorNode) {
    console.log(node);
  }

  function toggleSlotVisiblity(slot: EditorSlot) {
    console.log(slot);
  }

  function toggleGrpVisiblity(grp: EditorGrp) {
    console.log(grp);
  }

  //
  function generateNodeRow(node: EditorNode) {
    return (
      <div key={node.info.id}>
        <div
          onMouseDown={() => {
            setSelectedNode(node);
          }}
          className={
            "row " + (selectedNode.info.id == node.info.id ? "active" : "")
          }
        >
          <div className="col checkbox-col">
            <input
              type="checkbox"
              name=""
              id=""
              className="form-check-input"
              checked={node.isVisible}
              onChange={() => toggleNodeVisiblity(node)}
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
      <div className="node-table">
        {/*  */}
        {editorData.slots.map((slot) => {
          return (
            <div className="accordion-item" key={slot.id}>
              <div className="row">
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
                  .filter((el) => el.info.grpId == -1)
                  .map((el) => {
                    return generateNodeRow(el);
                  })}

                {slot.grps
                  .filter((el) => el.type == "node")
                  .map((el) => {
                    return (
                      <div key={el.id}>
                        <div className="accordion-item">
                          <div className="row grp-row">
                            {el.id != -1 && (
                              <Fragment>
                                <div className="col checkbox-col">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={el.isVisible}
                                    onChange={() => toggleGrpVisiblity(el)}
                                  />
                                </div>
                                <div className="col">
                                  <h2 className="accordion-header">
                                    <button
                                      className="accordion-button groups-button collapsed"
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#groupN` + el.id}
                                      aria-expanded="true"
                                      aria-controls={`groupN` + el.id}
                                    >
                                      <div
                                        className="acc-title"
                                        title={el.title}
                                      >
                                        grp: {el.title}
                                      </div>
                                    </button>
                                  </h2>
                                </div>
                              </Fragment>
                            )}
                          </div>
                          <div
                            id={`groupN` + el.id}
                            data-bs-parent={`#groupN` + el.id}
                            className="accordion-collapse collapse"
                          >
                            {slot.nodes
                              .filter((nodes) => nodes.info.grpId == el.id)
                              ?.map((node) => {
                                return generateNodeRow(node);
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
      <div className="card bg-secondary sidebar-editor">
        <div className="card-body">
          <div style={{ minHeight: 105 }}>
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
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3">
                <label>Option:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedNode.info.name}
                  disabled={selectedNode.info.id == -1}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="d-grid gap-2 mx-auto">
                <button
                  type="button"
                  className="btn btn-primary btn-sm me-0"
                  disabled={selectedNode.info.id == -1}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
