// Validation for public/links.json. Used by the build (scripts/postbuild.mjs) and by the tests,
// so a bad manifest fails CI instead of silently dropping a route in production.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUSES = new Set(["active", "coming-soon"]);
const SELF_HOSTS = new Set(["nawy.to", "www.nawy.to"]);

function isTextList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Returns a list of human-readable problems. An empty list means the manifest is safe to publish.
 * `reserved` holds names that already exist in the build output (assets, links.json, ...).
 */
export function validateManifest(manifest, { reserved = [] } = {}) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return ["links.json must be an object whose keys are slugs."];
  }

  const errors = [];
  const claimedBy = new Map();
  const reservedNames = new Set(reserved);

  function claim(name, owner, kind) {
    if (!SLUG.test(name)) {
      errors.push(`"${owner}": ${kind} "${name}" must use lowercase letters, digits and single hyphens only.`);
      return;
    }
    if (reservedNames.has(name)) {
      errors.push(`"${owner}": ${kind} "${name}" clashes with a file the site already publishes.`);
    }
    const existing = claimedBy.get(name);
    if (existing) errors.push(`"${owner}": ${kind} "${name}" is already used by "${existing}".`);
    else claimedBy.set(name, owner);
  }

  const entries = Object.entries(manifest);
  if (!entries.length) errors.push("links.json has no routes.");

  for (const [slug, route] of entries) {
    claim(slug, slug, "slug");

    if (!route || typeof route !== "object" || Array.isArray(route)) {
      errors.push(`"${slug}": the route must be an object.`);
      continue;
    }
    if (typeof route.label !== "string" || !route.label.trim()) {
      errors.push(`"${slug}": "label" is required.`);
    }
    if (route.status !== undefined && !STATUSES.has(route.status)) {
      errors.push(`"${slug}": "status" must be "active" or "coming-soon".`);
    }
    for (const field of ["description", "cta"]) {
      if (route[field] !== undefined && typeof route[field] !== "string") {
        errors.push(`"${slug}": "${field}" must be text.`);
      }
    }
    if (route.keywords !== undefined && !isTextList(route.keywords)) {
      errors.push(`"${slug}": "keywords" must be a list of text.`);
    }

    if (route.aliases !== undefined) {
      if (isTextList(route.aliases)) route.aliases.forEach((alias) => claim(alias, slug, "alias"));
      else errors.push(`"${slug}": "aliases" must be a list of text.`);
    }

    let url = null;
    try {
      url = new URL(route.url);
    } catch {
      errors.push(`"${slug}": "url" must be a full address such as https://nawy.app/.`);
    }
    if (url) {
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        errors.push(`"${slug}": "url" must start with http:// or https://.`);
      } else if (route.status !== "coming-soon" && SELF_HOSTS.has(url.hostname)) {
        errors.push(`"${slug}": an active route cannot point back to nawy.to (it would redirect to itself). Use "aliases" instead.`);
      }
    }
  }

  return errors;
}
