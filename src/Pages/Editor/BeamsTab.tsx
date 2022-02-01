import React, { Fragment, useState } from "react";
import { useEffect } from "react";
import { Vector3 } from "three";
import EditorData, {
  EditorBeam,
  EditorNode,
  EditorSlot,
} from "../../Editor/EditorDataInterfaces";
import EditorManager from "../../Editor/EditorManager";

export default function BeamsTab(props: { editorData: EditorData }) {
  const [editorData, setEditorData] = useState(props.editorData);

  const [selectedBeam, setSelectedBeam] = useState<EditorBeam>({
    info: {
      id: -1,
      grpId: -1,
    },
    node1: -1,
    node2: -1,
  });

  useEffect(() => {
    setEditorData(props.editorData);
  }, [props.editorData]);

  function toggleSlotVisiblity(slot: EditorSlot) {
    EditorManager.getInstance()
      .getEditorObj()
      .setSlotVisibility(slot.id, !slot.isVisible);
  }

  function generateBeamRow(beam: EditorBeam) {
    return (
      <div key={beam.info.id}>
        <div
          onMouseDown={() => {
            setSelectedBeam(beam);
          }}
          className={
            "row " + (selectedBeam.info.id == beam.info.id ? "active" : "")
          }
        >
          <div className="col">{beam.node1}</div>
          <div className="col">{beam.node2}</div>
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
                      data-bs-target={`#SlotB` + slot.id}
                      aria-expanded="false"
                      aria-controls={`SlotB` + slot.id}
                    >
                      <div className="acc-title">slot: {slot.title}</div>
                    </button>
                  </h2>
                </div>
              </div>
              {/*  */}
              <div
                id={`SlotB` + slot.id}
                data-bs-parent={`#SlotB` + slot.id}
                className="accordion-collapse collapse"
              >
                {slot.nodes.length == 0 && (
                  <div>
                    <div className="row">
                      <div className="col">Empty</div>
                    </div>
                  </div>
                )}

                {slot.beams
                  .filter((beam) => beam.info.grpId == -1)
                  .map((beam) => {
                    return generateBeamRow(beam);
                  })}

                {slot.grps
                  .filter((el) => el.type == "beam")
                  .map((el) => {
                    return (
                      <div key={el.id}>
                        <div className="accordion-item">
                          <div className="row grp-row">
                            {el.id != -1 && (
                              <Fragment>
                                {/* <div className="col checkbox-col">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={el.isVisible}
                                  />
                                </div> */}
                                <div className="col">
                                  <h2 className="accordion-header">
                                    <button
                                      className="accordion-button groups-button collapsed"
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#groupB` + el.id}
                                      aria-expanded="true"
                                      aria-controls={`groupB` + el.id}
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
                            id={`groupB` + el.id}
                            data-bs-parent={`#groupB` + el.id}
                            className="accordion-collapse collapse"
                          >
                            {slot.beams
                              .filter((beam) => beam.info.grpId == el.id)
                              ?.map((beam) => {
                                return generateBeamRow(beam);
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
                <label>Node1:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedBeam.node1}
                  disabled={selectedBeam.info.id == -1}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3">
                <label>Node2:</label>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedBeam.node2}
                  disabled={selectedBeam.info.id == -1}
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
                  disabled={selectedBeam.info.id == -1}
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
