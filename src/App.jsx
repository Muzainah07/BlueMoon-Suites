import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Loginpage";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import AdminDashboard from "./pages/AdminDashboard";
import BookingList from "./pages/BookingList";
import "./App.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideNavbar = isLanding || isAdminRoute;
  const flush = isLanding || isAdminRoute;

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <main className={flush ? "app-content flush" : "app-content"}>
        <Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />

  <Route
    path="/forgot-password"
    element={<ForgotPassword />}
  />

  <Route
    path="/reset-password"
    element={<ResetPassword />}
  />

  <Route
    path="/home"
    element={
      <RequireAuth>
        <Home />
      </RequireAuth>
    }
  />

  <Route
    path="/bookings"
    element={
      <RequireAuth>
        <Bookings />
      </RequireAuth>
    }
  />

  <Route
    path="/my-bookings"
    element={
      <RequireAuth>
        <BookingList />
      </RequireAuth>
    }
  />

  <Route path="/admin" element={<AdminDashboard />} />
</Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
