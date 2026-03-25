import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../api/backendBase.js";

function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
}

export default function ManagerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePic: null,
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    setProfileForm((p) => ({ ...p, name: user?.name || "", email: user?.email || "" }));
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function loadTeam() {
      setLoadingTeam(true);
      setTeamError(null);
      try {
        const res = await fetch(`${BACKEND_URL}/api/manager/team`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!mounted) return;
        if (!res.ok) throw new Error(data?.message || "Failed to load team.");
        setTeam(data?.items || []);
      } catch (e) {
        if (!mounted) return;
        setTeamError(e.message || "Failed to load team.");
      } finally {
        if (!mounted) return;
        setLoadingTeam(false);
      }
    }
    loadTeam();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    const email = String(profileForm.email || "").trim();
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    const fd = new FormData();
    fd.append("name", String(profileForm.name || "").trim());
    fd.append("email", email);
    if (profileForm.profilePic) fd.append("profilePic", profileForm.profilePic);

    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      alert(data?.message || "Profile update failed.");
      return;
    }
    alert("Profile updated successfully.");
    // Refresh user info in UI by calling /api/auth/me through AuthProvider on next mount.
    window.location.reload();
  }

  async function onChangePassword(e) {
    e.preventDefault();
    if (String(pwForm.newPassword || "").length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/api/user/change-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      alert(data?.message || "Password change failed.");
      return;
    }
    alert("Password changed successfully.");
    setPwForm({ currentPassword: "", newPassword: "" });
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Welcome, {user?.name}</h2>
        <button className="secondary" onClick={onLogout} type="button">
          Logout
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 14 }}>
        <h3>Team Members</h3>
        {teamError ? <div style={{ color: "crimson" }}>{teamError}</div> : null}
        {loadingTeam ? <p>Loading...</p> : null}
        {!loadingTeam && !teamError ? (
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>Profile</th>
                  <th style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>Name</th>
                  <th style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>Email</th>
                  <th style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>DOB</th>
                </tr>
              </thead>
              <tbody>
                {team.map((e) => (
                  <tr key={e.id}>
                    <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>
                      {e.profilePic ? (
                        <img
                          src={e.profilePic}
                          alt="profile"
                          style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1px solid #ddd" }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>{e.name}</td>
                    <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>{e.email}</td>
                    <td style={{ borderBottom: "1px solid #f5f5f5", padding: 8 }}>{formatDate(e.dob)}</td>
                  </tr>
                ))}
                {team.length === 0 ? <tr><td colSpan="4" style={{ padding: 10 }}>No employees found.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}
        <p style={{ color: "#666", marginTop: 10 }}>
          View-only access. Managers cannot edit roles or salaries.
        </p>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 14 }}>
        <h3>Profile Management</h3>
        <form onSubmit={onSaveProfile} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <label>
            Name
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", padding: 10 }}
            />
          </label>
          <label>
            Email
            <input
              value={profileForm.email}
              onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
              style={{ width: "100%", padding: 10 }}
              type="email"
            />
          </label>
          <label>
            Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileForm((p) => ({ ...p, profilePic: e.target.files?.[0] || null }))}
              style={{ width: "100%" }}
            />
          </label>
          <button type="submit" className="secondary">
            Save Profile
          </button>
        </form>

        <form onSubmit={onChangePassword} style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <h4 style={{ margin: 0 }}>Change Password</h4>
          <label>
            Current Password
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
              style={{ width: "100%", padding: 10 }}
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
              style={{ width: "100%", padding: 10 }}
            />
          </label>
          <button type="submit" className="secondary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

