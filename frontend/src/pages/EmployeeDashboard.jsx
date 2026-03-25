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

export default function EmployeeDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

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

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function onUpdateProfile(e) {
    e.preventDefault();
    const name = String(profileForm.name || "").trim();
    const email = String(profileForm.email || "").trim();
    if (!name) return alert("Name is required.");
    if (!email.includes("@")) return alert("Please enter a valid email.");

    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    if (profileForm.profilePic) fd.append("profilePic", profileForm.profilePic);

    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return alert(data?.message || "Profile update failed.");
    alert("Profile updated successfully.");
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
    if (!res.ok) return alert(data?.message || "Password change failed.");
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginTop: 14 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>DOB:</strong> {formatDate(user?.dob)}</p>
          <div style={{ marginTop: 10 }}>
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="profile"
                style={{ width: 90, height: 90, borderRadius: 16, objectFit: "cover", border: "1px solid #ddd" }}
              />
            ) : (
              <div style={{ color: "#666" }}>No profile picture</div>
            )}
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3>Salary Information</h3>
          <p style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>{user?.salary ?? 0}</p>
          <p style={{ color: "#666" }}>Salary is view-only for employees.</p>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 14 }}>
        <h3>Profile Management</h3>

        <form onSubmit={onUpdateProfile} style={{ display: "grid", gap: 10, marginTop: 12 }}>
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
              type="email"
              style={{ width: "100%", padding: 10 }}
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
            Update Profile
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

