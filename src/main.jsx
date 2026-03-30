import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import { AuthProvider } from "./state/AuthContext.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <ToastContainer
        autoClose={2500}
        newestOnTop
        pauseOnFocusLoss={false}
        position="top-right"
      />
    </AuthProvider>
  </BrowserRouter>,
);
