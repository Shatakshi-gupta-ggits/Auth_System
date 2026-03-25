// Simple in-memory token blacklist.
// Note: blacklist resets when the server restarts.
const tokenBlacklist = new Set();

function blacklistToken(token) {
  if (token) tokenBlacklist.add(token);
}

function isTokenBlacklisted(token) {
  return !!token && tokenBlacklist.has(token);
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  tokenBlacklist,
};

