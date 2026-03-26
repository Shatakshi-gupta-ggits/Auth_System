require("dotenv").config();

const db = require("../app/models");
const dbConfig = require("../app/config/db.config");

// Password hashing is done by the User model pre-save hook.

const DEMO_USERS = [
  { name: "Admin User", email: "admin@example.com", password: "Admin@123", role: "admin" },
  { name: "Manager User", email: "manager@example.com", password: "Manager@123", role: "manager" },
  {
    name: "Employee User",
    email: "employee@example.com",
    password: "Employee@123",
    role: "employee",
  },
];

async function ensureRoles() {
  const Role = db.role;
  const roles = ["employee", "manager", "admin"];
  await Promise.all(
    roles.map(async (r) => {
      const exists = await Role.findOne({ name: r }).exec();
      if (!exists) await new Role({ name: r }).save();
    })
  );
}

async function upsertUser({ name, email, password, role }) {
  const User = db.user;
  const normalizedEmail = String(email).trim().toLowerCase();

  let user = await User.findOne({ email: normalizedEmail }).exec();
  if (!user) {
    user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: String(role).trim().toLowerCase(),
      isLoggedIn: false,
    });
  } else {
    user.name = String(name).trim();
    user.role = String(role).trim().toLowerCase();
    user.password = String(password); // ensure demo password works
    user.isLoggedIn = false;
  }

  await user.save();
}

async function main() {
  const mongoUri =
    process.env.MONGO_URI ||
    dbConfig.URI ||
    `mongodb+srv://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}/?appName=Cluster0`;

  await db.mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await ensureRoles();

  for (const u of DEMO_USERS) {
    await upsertUser(u);
    console.log(`Seeded demo user: ${u.email} (${u.role})`);
  }

  await db.mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("seed-demo-users failed:", err.message || err);
  try {
    await db.mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});

