// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import SchedulePage from "./pages/SchedulePage.jsx";
import ContactSelectPage from "./pages/ContactSelectPage.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SchedulePage />} />
      <Route path="/contacts" element={<ContactSelectPage />} />
    </Routes>
  </BrowserRouter>
);