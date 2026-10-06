import { db, type RouteRecord } from "./db";
import { defaultRoutes } from "./defaultRoutes";
import type { NawyRoute, RoutesFile } from "../types";

function fromFile(data: RoutesFile): NawyRoute[] {
  return Object.entries(data)
    .map(([slug, value]) => ({
      ...value,
      slug: slug.trim().toLowerCase(),
      aliases: (value.aliases ?? []).map((alias) => alias.trim().toLowerCase()).filter(Boolean)
    }))
    .filter((route) => route.slug && /^[-a-z0-9]+$/i.test(route.slug) && /^https?:\/\//i.test(route.url));
}

async function saveLocal(routes: NawyRoute[]) {
  const records: RouteRecord[] = routes.map((route, order) => ({ ...route, order }));
  await db.transaction("rw", db.routes, db.meta, async () => {
    await db.routes.clear();
    await db.routes.bulkPut(records);
    await db.meta.put({ key: "routesLastSyncedAt", value: new Date().toISOString() });
  });
}

async function readLocal(): Promise<NawyRoute[]> {
  const records = await db.routes.orderBy("order").toArray();
  return records.map(({ order: _order, ...route }) => route);
}

async function tryReadLocal(): Promise<NawyRoute[]> {
  try {
    return await readLocal();
  } catch {
    return [];
  }
}

export async function loadRoutes(): Promise<{ routes: NawyRoute[]; source: "network" | "local" | "fallback" }> {
  try {
    const response = await fetch("/links.json", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`Route manifest request failed: ${response.status}`);
    const routes = fromFile((await response.json()) as RoutesFile);
    if (!routes.length) throw new Error("Route manifest contains no usable routes.");
    try {
      await saveLocal(routes);
    } catch {
      // The network manifest is still valid even if local persistence is unavailable.
    }
    return { routes, source: "network" };
  } catch {
    const local = await tryReadLocal();
    return local.length ? { routes: local, source: "local" } : { routes: defaultRoutes, source: "fallback" };
  }
}
