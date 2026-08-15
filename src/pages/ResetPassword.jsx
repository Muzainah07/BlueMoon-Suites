import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Moon,
} from "lucide-react";
import "./Login.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
      } else {
        setMessage({
          type: "error",
          text: "This password reset link is invalid or has expired.",
        });
      }
    }

    checkSession();
  }, []);

  async function handlePasswordUpdate(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password,
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
      text: "Your password has been updated successfully.",
    });

    setTimeout(() => {
      navigate("/login");
    }, 1500);
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

        <h2>Reset your password</h2>

        <p className="login-sub">
          Create a new password for your BlueMoon Suites account.
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

        {ready && (
          <form onSubmit={handlePasswordUpdate}>

            <div className="form-group">
              <label>New Password</label>

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

            <div className="form-group">
              <label>Confirm New Password</label>

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

            <button
              type="submit"
              className="button accent block"
              disabled={loading}
            >
              {loading && <span className="spinner" />}
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}