import type { NawyRoute } from "../types";

/** Cleans what the person typed or pasted: "nawy.to/note", "/note" and " note " all become "note". */
export function normalizeQuery(value: string): string {
  return value
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?nawy\.to/i, "")
    .replace(/^\/+/, "")
    .trim()
    .toLowerCase();
}

function scoreRoute(route: NawyRoute, q: string): number {
  const aliases = (route.aliases ?? []).map((alias) => alias.toLowerCase());
  const label = route.label.toLowerCase();
  const haystack = [route.slug, label, route.description ?? "", ...(route.keywords ?? []), ...aliases]
    .join(" ")
    .toLowerCase();
  if (route.slug === q) return 100;
  if (label === q) return 95;
  if (aliases.includes(q)) return 92;
  if (route.slug.startsWith(q) || label.startsWith(q)) return 85;
  if (haystack.startsWith(q)) return 80;
  if (haystack.includes(q)) return 60;
  return 0;
}

/** Routes matching the query, best first. An empty query returns every route in manifest order. */
export function searchRoutes(routes: NawyRoute[], query: string): NawyRoute[] {
  const q = normalizeQuery(query);
  if (!q) return routes;
  return routes
    .map((route, index) => ({ route, index, score: scoreRoute(route, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.route);
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

/** "Did you mean" candidates for a slug that does not exist. Only live destinations are suggested. */
export function suggestRoutes(routes: NawyRoute[], slug: string, limit = 3): NawyRoute[] {
  const q = normalizeQuery(slug);
  if (!q) return [];
  const live = routes.filter((route) => route.status !== "coming-soon");
  const direct = searchRoutes(live, q);
  if (direct.length && direct.length < live.length) return direct.slice(0, limit);
  const tolerance = Math.min(2, Math.floor(q.length / 2));
  return live
    .filter((route) => [route.slug, ...(route.aliases ?? [])].some((name) => distance(name, q) <= tolerance))
    .slice(0, limit);
}
