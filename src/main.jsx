import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ContentProvider } from "./context/ContentContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ContentProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
