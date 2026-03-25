import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RegisterPage() {
  const { register, error: authError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function validateForm() {
    const n = String(name || "").trim();
    const e = String(email || "").trim();
    const p = String(password || "");

    if (!n) return "Name is required.";
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Please enter a valid email.";

    const ok =
      p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);
    if (!ok) return "Password must be 8+ chars and include upper, lower, and a number.";

    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const msg = validateForm();
      if (msg) {
        setError(msg);
        return;
      }
      await register({ name, email, password, dob: dob || null, profilePic });
      // Backend forces role=employee and salary=0
      navigate("/employee-dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h2>Register</h2>
      {authError ? <div style={{ color: "crimson" }}>{String(authError)}</div> : null}
      {error ? <div style={{ color: "crimson", marginTop: 8 }}>{error}</div> : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <label>
          DOB (optional)
          <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
        </label>
        <label>
          Profile Pic (optional)
          <input
            onChange={(e) => setProfilePic(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            type="file"
            accept="image/*"
          />
        </label>
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: 14 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

