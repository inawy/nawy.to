import type { NawyRoute } from "../types";

export function normalizeSlug(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "").split("/")[0].toLowerCase();
}

export function getPathSlug(pathname = window.location.pathname): string {
  return normalizeSlug(pathname);
}

export function findRoute(routes: NawyRoute[], slug: string): NawyRoute | undefined {
  const normalized = normalizeSlug(slug);
  return routes.find((route) => route.slug === normalized);
}

export function openRoute(route: NawyRoute): void {
  window.location.assign(route.url);
}
