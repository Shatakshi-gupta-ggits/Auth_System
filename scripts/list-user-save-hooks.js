const db = require("../app/models");

const User = db.user;

// Mongoose stores middleware in internal schema hook maps.
// This script prints whether a pre('save') hook is registered.
const pres = User.schema?.s?.hooks?._pres;
console.log("has _pres:", Boolean(pres));

if (pres && pres.get) {
  const savePres = pres.get("save") || [];
  console.log("pre('save') handlers count:", savePres.length);
  console.log(
    "pre('save') handlers:",
    savePres.map((h) => ({
      name: h.fn?.name || "anonymous",
      snippet: String(h.fn || "")
        .replace(/\s+/g, " ")
        .slice(0, 90),
    }))
  );
} else {
  console.log("Could not read pre hooks from schema.s.hooks._pres");
}

