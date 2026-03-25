module.exports = {
  HOST: process.env.MONGO_HOST || "cluster0.2makqzt.mongodb.net",
  DB: process.env.MONGO_DB || "bezkoder_db",
  USER: process.env.MONGO_USER,
  PASSWORD: process.env.MONGO_PASSWORD,
  URI: process.env.MONGO_URI
};