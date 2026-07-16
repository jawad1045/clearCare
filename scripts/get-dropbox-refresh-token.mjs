// scripts/get-dropbox-refresh-token.mjs
// Run: node scripts/get-dropbox-refresh-token.mjs
// 1. Open the printed URL, approve access, copy the "code" from the redirect URL
// 2. Paste it when prompted

import readline from "node:readline/promises";

const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const REDIRECT_URI = "http://localhost"; // must match what you use below

const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code&token_access_type=offline&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log("Open this URL, approve, then copy the `code` param from the redirect:\n", authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const code = await rl.question("\nPaste the code here: ");
rl.close();

const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code: code.trim(),
    grant_type: "authorization_code",
    client_id: APP_KEY,
    client_secret: APP_SECRET,
    redirect_uri: REDIRECT_URI,
  }),
});

const data = await res.json();
console.log("\nResult:\n", data);
console.log("\nSave data.refresh_token as DROPBOX_REFRESH_TOKEN in your env — it does not expire.");