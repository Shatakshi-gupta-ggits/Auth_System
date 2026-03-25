import { createHttpClient } from "../httpClient.js";

export function createProfileService(baseURL) {
  const http = createHttpClient(baseURL);

  return {
    updateProfile: async ({ name, email, dob, profilePic } = {}) => {
      const fd = new FormData();
      if (name !== undefined) fd.append("name", String(name).trim());
      if (email !== undefined) fd.append("email", String(email).trim());
      if (dob !== undefined) fd.append("dob", String(dob));
      if (profilePic) fd.append("profilePic", profilePic);

      const res = await http.patch("/api/user/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.user;
    },

    updateProfilePic: async (profilePic) => {
      const fd = new FormData();
      fd.append("profilePic", profilePic);
      const res = await http.patch("/api/user/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.user;
    },

    changePassword: async ({ currentPassword, newPassword }) => {
      const res = await http.put("/api/user/change-password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    },
  };
}

