import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgb(var(--color-surface))",
            color: "rgb(var(--color-ink))",
            border: "1px solid rgb(var(--color-rule))",
            borderRadius: "16px",
          },
        }}
      />
    </>
  );
}
