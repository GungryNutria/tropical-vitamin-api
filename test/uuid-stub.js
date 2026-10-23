// uuid@13 is ESM-only; jest runs CommonJS.
module.exports = { v4: () => require("crypto").randomUUID() };
