import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import App from "./App.tsx";
import SignInPage from "./components/SignIn-Page/SignIn-Page";
import LogInPage from "./components/LogIn-Page/LogIn-Page.tsx";
import MapsPage from "./components/Maps-Page/Maps-Page.tsx";
import ProtectedRoute from "./components/Protected-Route.tsx";
import { AuthProvider } from "./components/AuthContext.tsx";
import EventsPage from "./components/Events-Page/Events-Page.tsx";
import EventElements from "./components/Events-Page/Event-Elements.tsx";
import FaqPage from "./components/Faq-Page/Faq-Page.tsx";
import SDGelements from "./components/SDG-elements/SDG-elements.tsx";
import SDGoverall from "./components/SDG-elements/SDG-overall.tsx";
import AccountSettings from "./components/Account-Page/Account-Settings.tsx";
import DashboardADM from "./components/Dashboard-Page/Dashboard-Admin.tsx";
import DashboardBO from "./components/Dashboard-Page/Dashboard-Backoffice.tsx";
import PublicPage from "./components/Account-Page/Public-Page.tsx";
import EventUpdater from "./components/Events-Page/Event-Updater.tsx";
import EventJoins from "./components/Events-Page/Event-Joins.tsx";
import AboutUsPage from "./components/AboutUs-Page/AboutUs-page.tsx";
import SocialPage from "./components/Social-Page/Social-Page.tsx";
import { NotificationProvider } from "./components/NotificationContext.tsx";
import NotFound from "./components/NotFound.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <PublicPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard/admin" element={<DashboardADM />} />
            <Route path="/dashboard/backofficer" element={<DashboardBO />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventElements />} />
            <Route
              path="/events/:id/edit"
              element={
                <ProtectedRoute>
                  <EventUpdater />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/joins"
              element={
                <ProtectedRoute>
                  <EventJoins />
                </ProtectedRoute>
              }
            />
            <Route path="/maps" element={<MapsPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/aboutus" element={<AboutUsPage />} />
            <Route path="/sdg" element={<SDGoverall />} />
            <Route path="/sdg/:id" element={<SDGelements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
