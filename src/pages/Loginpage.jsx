import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, Moon } from "lucide-react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/home";
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Login successful! Redirecting…" });
      setTimeout(() => navigate(redirectTo), 500);
    }
  }

 async function handleRegister(e) {
  e.preventDefault();

  if (password !== confirmPassword) {
    setMessage({
      type: "error",
      text: "Passwords do not match.",
    });
    return;
  }

  setLoading(true);
  setMessage(null);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: window.location.origin + "/home",
    },
  });

  setLoading(false);

  if (error) {
    setMessage({
      type: "error",
      text: error.message,
    });
    return;
  }

  // Supabase can return a successful response for an email
  // that already has an account when email confirmation is enabled.
  if (data?.user && data.user.identities?.length === 0) {
    setMessage({
      type: "error",
      text: "An account with this email already exists. Please sign in instead.",
    });
    return;
  }

  setMessage({
    type: "success",
    text: "Account created! Please check your email to confirm your account.",
  });

  setIsRegister(false);
  setEmail("");
  setPassword("");
  setConfirmPassword("");
}

  return (
    <div className="login-page">
      <div className="login-card card">
        <button type="button" className="login-back" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="login-brandmark"><Moon size={20} /></div>
        <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
        <p className="login-sub">
          {isRegister
            ? "Sign up to book and manage your stays."
            : "Sign in to book a room or view your reservations."}
        </p>

        <div className="login-tabs">
          <button
            type="button"
            className={!isRegister ? "login-tab active" : "login-tab"}
            onClick={() => { setIsRegister(false); setMessage(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={isRegister ? "login-tab active" : "login-tab"}
            onClick={() => { setIsRegister(true); setMessage(null); }}
          >
            Create Account
          </button>
        </div>

        {message && (
          <div className={message.type === "error" ? "form-error" : "form-success"}>
            {message.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <div className="field-wrap">
              <Mail size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="field-wrap">
              <Lock size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="field-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!isRegister && (
            <button type="button" className="forgot-link" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </button>
          )}

          <button type="submit" className="button accent block" disabled={loading}>
            {loading && <span className="spinner" />}
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => { setIsRegister(!isRegister); setMessage(null); }}>
            {isRegister ? "Sign in" : "Create one"}
          </span>
        </p>
      </div>
    </div>
  );
}
