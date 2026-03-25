import { createHttpClient } from "./httpClient.js";

export function createAuthApi(baseUrl) {
  const http = createHttpClient(baseUrl);

  return {
    register: async ({ name, email, password, dob, profilePic }) => {
      const fd = new FormData();
      fd.append("name", String(name).trim());
      fd.append("email", String(email).trim());
      fd.append("password", String(password));
      if (dob) fd.append("dob", String(dob));
      if (profilePic) fd.append("profilePic", profilePic);

      const res = await http.post("/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },

    login: async (email, password) => {
      const res = await http.post("/api/auth/login", {
        email: String(email).trim(),
        password: String(password),
      });
      return res.data;
    },

    logout: async () => {
      const res = await http.post("/api/auth/logout");
      return res.data;
    },

    me: async () => {
      const res = await http.get("/api/auth/me");
      return res.data.user;
    },
  };
}

