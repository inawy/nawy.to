import type { NawyRoute, RoutesFile } from "../types";

/**
 * Turns the links.json shape into a clean route list. Entries that cannot work are dropped here as a
 * last line of defence; the build (scripts/postbuild.mjs) already refuses to publish such a file.
 */
export function routesFromFile(data: RoutesFile): NawyRoute[] {
  return Object.entries(data)
    .map(([slug, value]) => ({
      ...value,
      slug: slug.trim().toLowerCase(),
      aliases: (value.aliases ?? []).map((alias) => alias.trim().toLowerCase()).filter(Boolean)
    }))
    .filter((route) => route.slug && /^[-a-z0-9]+$/i.test(route.slug) && /^https?:\/\//i.test(route.url));
}
