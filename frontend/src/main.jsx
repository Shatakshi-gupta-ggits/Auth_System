import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { createAuthApi } from "./api/authApi.js";
import { BACKEND_URL } from "./api/backendBase.js";

const api = createAuthApi(BACKEND_URL);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider api={api}>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);

