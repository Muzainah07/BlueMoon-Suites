import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | authed | guest

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(data.session ? "authed" : "guest");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authed" : "guest");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="auth-check">
        <Loader2 size={22} className="spin-icon" />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}