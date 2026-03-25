require("dotenv").config();

const db = require("../app/models");
const dbConfig = require("../app/config/db.config");
// Password hashing is done by the User model pre-save hook.

async function main() {
  const emailArg = process.argv[2];
  const passwordArg = process.argv[3];
  const nameArg = process.argv[4] || "Admin User";
  if (!emailArg || !passwordArg) {
    throw new Error("Usage: node scripts/make-admin.js <user-email> <password> [name]");
  }

  const email = String(emailArg).trim().toLowerCase();
  const mongoUri =
    process.env.MONGO_URI ||
    dbConfig.URI ||
    `mongodb+srv://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}/?appName=Cluster0`;

  await db.mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const Role = db.role;
  const User = db.user;

  let adminRole = await Role.findOne({ name: "admin" }).exec();
  if (!adminRole) {
    adminRole = await new Role({ name: "admin" }).save();
  }

  const user = await User.findOne({ email }).exec();
  if (!user) {
    const created = new User({
      name: String(nameArg).trim(),
      email,
      password: String(passwordArg),
      role: "admin",
      isLoggedIn: false,
    });
    await created.save();
    console.log(`Created and promoted ${email} to admin successfully.`);
    await db.mongoose.disconnect();
    return;
  }

  // If user already exists, keep their password as-is.
  user.role = "admin";
  await user.save();

  console.log(`Promoted ${email} to admin successfully.`);
  await db.mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("make-admin failed:", err.message || err);
  try {
    await db.mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
