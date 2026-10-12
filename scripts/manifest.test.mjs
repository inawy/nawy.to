import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { validateManifest } from "./manifest.mjs";

const valid = () => ({
  app: { url: "https://nawy.app/", label: "ناوي", status: "active" },
  note: { url: "https://example.com/notes", label: "نوت", aliases: ["notes"], keywords: ["note"] },
  soon: { url: "https://nawy.to/soon", label: "قريبًا", status: "coming-soon" }
});

const problemsWith = (change, options) => {
  const manifest = valid();
  change(manifest);
  return validateManifest(manifest, options);
};

test("the real public/links.json is valid", () => {
  const manifest = JSON.parse(readFileSync(new URL("../public/links.json", import.meta.url), "utf8"));
  assert.deepEqual(validateManifest(manifest), []);
});

test("a correct manifest has no problems", () => {
  assert.deepEqual(validateManifest(valid()), []);
});

test("rejects a manifest that is not an object or is empty", () => {
  assert.equal(validateManifest([]).length, 1);
  assert.equal(validateManifest(null).length, 1);
  assert.match(validateManifest({})[0], /no routes/);
});

test("rejects slugs and aliases that are not lowercase url-safe", () => {
  assert.match(problemsWith((m) => { m.Bad_Slug = m.app; })[0], /lowercase letters/);
  assert.match(problemsWith((m) => { m.note.aliases = ["Not Ok"]; })[0], /alias/);
});

test("rejects an alias that clashes with a slug or another alias", () => {
  assert.match(problemsWith((m) => { m.note.aliases = ["app"]; })[0], /already used by "app"/);
  // The second route to claim a name is the one reported.
  assert.match(problemsWith((m) => { m.app.aliases = ["notes"]; })[0], /"note": alias "notes" is already used by "app"/);
});

test("rejects names that clash with files the site already publishes", () => {
  assert.match(problemsWith(() => {}, { reserved: ["note"] })[0], /clashes/);
});

test("requires a label and a valid url", () => {
  assert.match(problemsWith((m) => { m.app.label = " "; })[0], /label/);
  assert.match(problemsWith((m) => { m.app.url = "nawy.app"; })[0], /full address/);
  assert.match(problemsWith((m) => { m.app.url = "javascript:alert(1)"; })[0], /http/);
});

test("rejects an unknown status", () => {
  assert.match(problemsWith((m) => { m.app.status = "live"; })[0], /status/);
});

test("an active route cannot redirect back to nawy.to, but coming-soon may", () => {
  assert.match(problemsWith((m) => { m.app.url = "https://nawy.to/app"; })[0], /redirect to itself/);
  assert.deepEqual(problemsWith((m) => { m.soon.url = "https://nawy.to/soon"; }), []);
});

test("rejects wrongly typed optional fields", () => {
  assert.match(problemsWith((m) => { m.app.keywords = "word"; })[0], /keywords/);
  assert.match(problemsWith((m) => { m.app.aliases = "x"; })[0], /aliases/);
  assert.match(problemsWith((m) => { m.app.description = 5; })[0], /description/);
});
