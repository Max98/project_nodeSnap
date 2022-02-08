import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";

import "./App.css";
import AddGrp from "./Modals/AddGrp";
import Editor from "./Pages/Editor";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/addGrp" element={<AddGrp />} />
      </Routes>
    </div>
  );
}

export default App;
