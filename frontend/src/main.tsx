import React from "react";
import ReactDOM from "react-dom/client";
import RootRouter from "./routes";
import "./styles/index.css";
import "./styles/transitions.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>,
);
