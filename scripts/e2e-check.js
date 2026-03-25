require("dotenv").config();

async function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function main() {
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const uniq = Date.now();
  const userEmail = `user${uniq}@test.com`;

  const signup = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: userEmail,
      password: "pass12345",
      role: "employee",
    }),
  });
  console.log("signup", signup.status, await jsonOrText(signup));

  const signin = await fetch(`${base}/api/auth/signin`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: userEmail, password: "pass12345" }),
  });
  const cookie = signin.headers.get("set-cookie");
  console.log("signin", signin.status, await jsonOrText(signin));
  if (!cookie) throw new Error("No cookie from signin response.");

  const me = await fetch(`${base}/api/auth/me`, { headers: { cookie } });
  console.log("me", me.status, await jsonOrText(me));

  const userBoard = await fetch(`${base}/api/test/user`, { headers: { cookie } });
  console.log("userBoard", userBoard.status, await jsonOrText(userBoard));
}

main().catch((e) => {
  console.error("E2E FAILED", e);
  process.exit(1);
});

