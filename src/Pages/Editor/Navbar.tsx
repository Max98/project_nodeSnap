import React from "react";

export default function Navbar() {
  function onScale() {
    return null;
  }

  function onMove() {
    return null;
  }

  function onRotate() {
    return null;
  }

  function onAbout() {
    return null;
  }

  function onDuplicateVisible() {
    return null;
  }

  return (
    <div className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid" style={{ padding: 0 }}>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <div className="dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDarkDropdownMenuLink"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Edit
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <h6 className="dropdown-header">Transform</h6>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={onScale}>
                      Scale
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={onMove}>
                      Move
                    </a>
                  </li>

                  <li>
                    <a className="dropdown-item" href="#" onClick={onRotate}>
                      Rotate
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <h6 className="dropdown-header">Functions</h6>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={onDuplicateVisible}
                    >
                      Duplicate visible
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
          <div className="d-flex">
            <div className="dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDarkDropdownMenuLink"
                role="button"
                data-bs-toggle="dropdown"
              >
                File
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="#">
                    Save
                  </a>
                </li>
                <li>
                  <a className="dropdown-item disabled" href="#">
                    Reload file
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    About
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Close
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
