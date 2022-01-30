import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";


import "./App.css";
import Editor from "./Pages/Editor";

function App() {
  return (
    <div className="App">
      
      <Routes>
        <Route path="/" element={<Editor />} />
      </Routes>
      {/* <canvas
        id="myRender"
        className="renderer"
        style={{ width: "100%", height: "100vh" }}
      ></canvas> */}
    </div>
  );
}

export default App;
