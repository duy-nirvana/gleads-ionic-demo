import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import axios from 'axios';
import { setupAxios } from "./setupAxios";

const container = document.getElementById("root");
const root = createRoot(container!);

setupAxios(axios);

root.render(<App />);
