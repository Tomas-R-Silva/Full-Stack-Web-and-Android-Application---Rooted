import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import App from "./App.tsx";
import SignInPage from "./components/SignIn-Page/SignIn-Page";
import LogInPage from "./components/LogIn-Page/LogIn-Page.tsx";
import ProfilePage from "./components/Profile-Page/Profile-Page.tsx";
import MapsPage from "./components/Maps-Page/Maps-Page.tsx";
import ProtectedRoute from "./components/Protected-Route.tsx";
import { AuthProvider } from "./components/AuthContext.tsx";
import EventsPage from "./components/Events-Page/Events-Page.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/maps" element={<MapsPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
