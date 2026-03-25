require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const base = process.env.BASE_URL || "http://localhost:" + (process.env.PORT || 3000);
  const u = "user" + Math.floor(Math.random() * 1e9);
  const payload = { name: u, email: `${u}@test.com`, password: "pass12345", role: "employee" };

  const res = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log("SIGNUP", res.status, text);

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment (.env).");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const usersCount = await mongoose.connection.collection("users").countDocuments();
  const lastUser = await mongoose.connection
    .collection("users")
    .find({}, { projection: { name: 1, email: 1 } })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  console.log("DB users.countDocuments()", usersCount);
  console.log("DB last user", lastUser[0] || null);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("DEBUG FAILED", e);
  process.exit(1);
});

