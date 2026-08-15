import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Moon } from "lucide-react";
import "./Login.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e) {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://bluemoon-suites.netlify.app/reset-password",
    });

    setLoading(false);

    if (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Password reset instructions have been sent to your email.",
    });
  }

  return (
    <div className="login-page">
      <div className="login-card card">

        <button
          type="button"
          className="login-back"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <div className="login-brandmark">
          <Moon size={20} />
        </div>

        <h2>Forgot your password?</h2>

        <p className="login-sub">
          Enter the email address associated with your BlueMoon Suites
          account and we'll send you a link to reset your password.
        </p>

        {message && (
          <div
            className={
              message.type === "error"
                ? "form-error"
                : "form-success"
            }
          >
            {message.type === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}

            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleResetRequest}>

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

          <button
            type="submit"
            className="button accent block"
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <p className="login-switch">
          Remember your password?{" "}
          <span onClick={() => navigate("/login")}>
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}