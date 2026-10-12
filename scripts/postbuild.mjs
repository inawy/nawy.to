// Runs after `vite build`. Two jobs:
//
// 1. Refuse to publish a broken links.json (see manifest.mjs), so a typo fails CI instead of
//    silently removing a route.
// 2. Write a real page for every slug and alias (dist/note/index.html, ...). GitHub Pages serves
//    those with HTTP 200, so link checkers, uptime monitors and link previews see a healthy link.
//    Paths we do not know still fall back to 404.html, which is the same app showing "not found".
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { validateManifest } from "./manifest.mjs";

const DIST = "dist";
const ORIGIN = "https://nawy.to";

function fail(lines) {
  console.error("\nBuild stopped: public/links.json has problems.\n");
  for (const line of lines) console.error(`  - ${line}`);
  console.error("");
  process.exit(1);
}

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let manifest;
try {
  manifest = JSON.parse(readFileSync(`${DIST}/links.json`, "utf8"));
} catch (error) {
  fail([`links.json is not valid JSON (${error.message}).`]);
}

const problems = validateManifest(manifest, { reserved: readdirSync(DIST) });
if (problems.length) fail(problems);

const shell = readFileSync(`${DIST}/index.html`, "utf8");
if (!shell.includes("</head>") || !/<title>[^<]*<\/title>/.test(shell)) {
  fail(["dist/index.html has no <title> or </head>; the page template changed shape."]);
}

function pageFor(path, route) {
  const live = route.status !== "coming-soon";
  const title = live ? `بنفتح ${route.label} — Nawy.to` : `${route.label} قريبًا — Nawy.to`;
  const head = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="ar_AR">`,
    `<meta property="og:site_name" content="Nawy.to">`,
    `<meta property="og:title" content="${escapeHtml(route.label)}">`,
    route.description ? `<meta property="og:description" content="${escapeHtml(route.description)}">` : "",
    `<meta property="og:url" content="${ORIGIN}/${path}">`,
    // Without JavaScript the app cannot redirect, so the browser does it.
    live ? `<noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(route.url)}"></noscript>` : ""
  ].filter(Boolean).join("\n  ");

  return shell
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace("</head>", `  ${head}\n</head>`);
}

let pages = 0;
for (const [slug, route] of Object.entries(manifest)) {
  for (const path of [slug, ...(route.aliases ?? [])]) {
    mkdirSync(`${DIST}/${path}`, { recursive: true });
    writeFileSync(`${DIST}/${path}/index.html`, pageFor(path, route));
    pages += 1;
  }
}

// Any other path (typos, old links) still reaches the app through the 404 fallback.
copyFileSync(`${DIST}/index.html`, `${DIST}/404.html`);

if (!existsSync(`${DIST}/404.html`)) fail(["dist/404.html was not created."]);
console.log(`postbuild: validated ${Object.keys(manifest).length} routes, wrote ${pages} pages and 404.html`);
