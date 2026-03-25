import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

function roleToPath(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "/admin-dashboard";
  if (r === "manager") return "/manager-dashboard";
  return "/employee-dashboard";
}

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const e = String(email || "").trim();
      const p = String(password || "");
      if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        setError("Please enter a valid email.");
        return;
      }
      if (!p || p.length < 1) {
        setError("Password is required.");
        return;
      }
      const result = await login(e, p);
      const role = result?.user?.role || "employee";
      navigate(roleToPath(role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Login</h2>
      {authError ? <div style={{ color: "crimson" }}>{String(authError)}</div> : null}
      {error ? <div style={{ color: "crimson", marginTop: 8 }}>{error}</div> : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Submit</button>
      </form>

      <p style={{ marginTop: 14 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

