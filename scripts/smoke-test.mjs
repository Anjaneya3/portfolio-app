// Checks the server's API rules: who can read, who can write, file checks, and security headers.
// Run it against a running server, for example: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:api
const BASE = process.env.BASE_URL || "http://localhost:3001";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
}

const JSON_HEADERS = { "Content-Type": "application/json" };
const pdfBytes = Buffer.from("%PDF-1.4\n%smoke test\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n");

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.log("Set ADMIN_EMAIL and ADMIN_PASSWORD to run the owner checks.");
    process.exit(1);
  }

  // Visitors can read the published content
  let res = await fetch(`${BASE}/api/content`);
  const content = await res.json();
  check("visitors can read the content", res.ok && Boolean(content.profile));
  check("visitors only see published projects", content.projects.every((p) => p.published === true));

  // Visitors cannot write
  res = await fetch(`${BASE}/api/skillGroups`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ title: "Nope" }) });
  check("writes without sign-in are refused (401)", res.status === 401, `got ${res.status}`);

  res = await fetch(`${BASE}/api/profile`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(content.profile) });
  check("profile changes without sign-in are refused (401)", res.status === 401, `got ${res.status}`);

  // Sign-in
  res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email: EMAIL, password: "definitely-wrong-password" }),
  });
  check("a wrong password is refused (401)", res.status === 401, `got ${res.status}`);

  res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const setCookie = res.headers.get("set-cookie") || "";
  check(
    "the owner can sign in, and gets an HttpOnly, SameSite=Strict session cookie",
    res.ok && /session=/.test(setCookie) && /HttpOnly/i.test(setCookie) && /SameSite=Strict/i.test(setCookie)
  );
  const cookie = setCookie.split(";")[0];
  const owner = { Cookie: cookie, ...JSON_HEADERS };

  res = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
  check("the session is recognised", res.ok && (await res.json()).user?.email === EMAIL.toLowerCase());

  // Owner edits: add, edit, reorder, delete
  res = await fetch(`${BASE}/api/skillGroups`, { method: "POST", headers: owner, body: JSON.stringify({ title: "Smoke group", items: "A, B, C" }) });
  const created = (await res.json()).item;
  check("the owner can add a skill group", res.status === 201 && created?.items?.length === 3);

  res = await fetch(`${BASE}/api/skillGroups/${created.id}`, { method: "PUT", headers: owner, body: JSON.stringify({ title: "Smoke renamed" }) });
  check("the owner can edit it", res.ok && (await res.json()).item.title === "Smoke renamed");

  const order = [created.id, ...content.skillGroups.map((g) => g.id)];
  res = await fetch(`${BASE}/api/skillGroups/reorder`, { method: "POST", headers: owner, body: JSON.stringify({ ids: order }) });
  check("the owner can reorder a list", res.ok);

  res = await fetch(`${BASE}/api/skillGroups/${created.id}`, { method: "DELETE", headers: { Cookie: cookie } });
  check("the owner can delete it", res.ok);

  // Profile update, then revert
  res = await fetch(`${BASE}/api/profile`, { method: "PUT", headers: owner, body: JSON.stringify({ ...content.profile, tagline: "Smoke tagline" }) });
  check("the owner can update the profile", res.ok);
  res = await fetch(`${BASE}/api/profile`, { method: "PUT", headers: owner, body: JSON.stringify(content.profile) });

  // Hidden projects: visible to the owner, invisible to visitors
  res = await fetch(`${BASE}/api/projects`, { method: "POST", headers: owner, body: JSON.stringify({ title: "Hidden smoke project", published: false }) });
  const hidden = (await res.json()).item;
  const visitorView = await (await fetch(`${BASE}/api/content`)).json();
  const ownerView = await (await fetch(`${BASE}/api/content`, { headers: { Cookie: cookie } })).json();
  check("a hidden project is not shown to visitors", !visitorView.projects.some((p) => p.id === hidden.id));
  check("a hidden project is shown to the owner", ownerView.projects.some((p) => p.id === hidden.id && p.published === false));
  await fetch(`${BASE}/api/projects/${hidden.id}`, { method: "DELETE", headers: { Cookie: cookie } });

  // Uploads: real files accepted, fake files refused
  res = await fetch(`${BASE}/api/uploads/resume`, { method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/pdf" }, body: pdfBytes });
  const upload = res.ok ? await res.json() : {};
  check("a real PDF resume uploads", res.ok && /^\/uploads\/resume-.*\.pdf$/.test(upload.url || ""), upload.url);

  if (upload.url) {
    res = await fetch(`${BASE}${upload.url}`);
    check("the resume is served as a PDF", res.ok && (res.headers.get("content-type") || "").includes("application/pdf"));

    res = await fetch(`${BASE}/api/profile`, { method: "PUT", headers: owner, body: JSON.stringify({ ...content.profile, resumeUrl: upload.url }) });
    res = await fetch(`${BASE}/api/profile`, { method: "PUT", headers: owner, body: JSON.stringify({ ...content.profile, resumeUrl: "" }) });
    res = await fetch(`${BASE}${upload.url}`);
    check("removing the resume deletes the file from the server", res.status === 404, `got ${res.status}`);
  }

  res = await fetch(`${BASE}/api/uploads/resume`, { method: "PUT", headers: { Cookie: cookie, "Content-Type": "application/pdf" }, body: Buffer.from("this is not a pdf") });
  check("a text file renamed as a PDF is refused (415)", res.status === 415, `got ${res.status}`);

  res = await fetch(`${BASE}/api/uploads/photo`, { method: "PUT", headers: { Cookie: cookie, "Content-Type": "image/png" }, body: pdfBytes });
  check("a PDF uploaded as a photo is refused (415)", res.status === 415, `got ${res.status}`);

  res = await fetch(`${BASE}/api/uploads/resume`, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: pdfBytes });
  check("uploads without sign-in are refused (401)", res.status === 401, `got ${res.status}`);

  // Visitor messages
  res = await fetch(`${BASE}/api/messages`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ name: "Smoke Tester", email: "tester@example.com", message: "Hello from the smoke test." }) });
  check("a visitor can send a message", res.status === 201, `got ${res.status}`);

  res = await fetch(`${BASE}/api/messages`);
  check("visitors cannot read the inbox (401)", res.status === 401, `got ${res.status}`);

  res = await fetch(`${BASE}/api/messages`, { headers: { Cookie: cookie } });
  const inbox = (await res.json()).messages || [];
  check("the owner can read the inbox", res.ok && inbox.some((m) => m.name === "Smoke Tester"));

  // Headers, missing files, unknown routes
  res = await fetch(`${BASE}/api/nothing-here`);
  check("unknown API routes return JSON 404", res.status === 404 && (await res.json()).error);

  res = await fetch(`${BASE}/uploads/missing-file.pdf`);
  check("missing uploads return 404 (not the home page)", res.status === 404);

  res = await fetch(`${BASE}/api/auth/logout`, { method: "POST", headers: owner, body: "{}" });
  const cleared = res.headers.get("set-cookie") || "";
  check("sign-out clears the session cookie", res.ok && /session=;/.test(cleared) || /Max-Age=0|Expires=/i.test(cleared));

  console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error("Smoke test could not run:", error.message);
  process.exit(1);
});
