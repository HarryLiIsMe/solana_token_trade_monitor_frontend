import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ListFollowedUsers from "./ListFollowedUsers"; // 导入新的页面组件
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* 根路径 */}
        <Route
          path="/list_followed_users"
          element={<ListFollowedUsers />}
        />{" "}
        {/* 子URL */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
