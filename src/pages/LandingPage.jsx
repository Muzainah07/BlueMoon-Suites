import React from "react";
import { useNavigate } from "react-router-dom";
import { Moon, CalendarCheck, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero">
        <img src="/images/hotel_welcome.jpg" alt="BlueMoon Suites lobby" className="hero-image" />
        <div className="hero-scrim" />

        <div className="hero-content">
          <div className="hero-brandmark"><Moon size={22} /></div>
          <p className="eyebrow light">BlueMoon Suites</p>
          <h1>Stay with sophistication in every room.</h1>
          <p className="hero-copy">
            Elegant guest rooms, seamless booking, and a premium stay curated for the modern traveler.
          </p>

          <div className="hero-actions">
            <button className="hero-action guest" onClick={() => navigate("/login")}>
              <span className="hero-action-icon"><CalendarCheck size={22} /></span>
              <span className="hero-action-body">
                <span className="hero-action-title">Book a Stay</span>
                <span className="hero-action-sub">Browse rooms & reserve in minutes</span>
              </span>
              <ArrowRight size={18} className="hero-action-arrow" />
            </button>

            <button className="hero-action admin" onClick={() => navigate("/admin")}>
              <span className="hero-action-icon"><ShieldCheck size={22} /></span>
              <span className="hero-action-body">
                <span className="hero-action-title">Admin Login</span>
                <span className="hero-action-sub">Manage rooms, bookings & guests</span>
              </span>
              <ArrowRight size={18} className="hero-action-arrow" />
            </button>
          </div>

          <div className="hero-trust">
            <span><Sparkles size={14} /> Instant confirmation</span>
            <span><ShieldCheck size={14} /> Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
