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

  const User = db.user;

  // Copy stored legacy `monthlySalary` into canonical `salary`, then remove legacy field.
  // Uses an update pipeline so it works without needing to load documents into Node.
  const result = await User.collection.updateMany(
    { monthlySalary: { $exists: true } },
    [
      { $set: { salary: "$monthlySalary" } },
      { $unset: "monthlySalary" },
    ]
  );

  console.log(
    `Salary migration done. matched=${result.matchedCount || 0} modified=${result.modifiedCount || 0}`
  );

  await db.mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("migrate-monthlysales-to-salary failed:", err.message || err);
  try {
    await db.mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});

