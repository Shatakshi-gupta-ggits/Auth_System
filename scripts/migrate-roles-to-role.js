require("dotenv").config();

const db = require("../app/models");
const dbConfig = require("../app/config/db.config");

async function main() {
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

  const roleDocs = await Role.find({ name: { $in: ["employee", "manager", "admin"] } }).exec();
  const idToName = new Map(roleDocs.map((r) => [String(r._id), String(r.name)]));

  const users = await User.find({}).lean().exec();
  let updated = 0;
  let skipped = 0;

  for (const u of users) {
    if (u.role) {
      skipped += 1;
      continue;
    }
    const legacyRoles = Array.isArray(u.roles) ? u.roles.map((x) => String(x)) : [];
    const names = legacyRoles.map((id) => idToName.get(id)).filter(Boolean);
    const inferred = names.includes("admin") ? "admin" : names.includes("manager") ? "manager" : "employee";
    await User.updateOne({ _id: u._id }, { $set: { role: inferred }, $unset: { roles: "" } }).exec();
    updated += 1;
  }

  console.log(`Migration done. updated=${updated} skipped=${skipped}`);
  await db.mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("migrate-roles-to-role failed:", err.message || err);
  try {
    await db.mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});

