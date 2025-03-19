import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
