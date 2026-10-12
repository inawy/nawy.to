import type { NawyRoute } from "../types";

export function normalizeSlug(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "").split("/")[0].toLowerCase();
}

export function getPathSlug(pathname = window.location.pathname): string {
  return normalizeSlug(pathname);
}

export function findRoute(routes: NawyRoute[], slug: string): NawyRoute | undefined {
  const normalized = normalizeSlug(slug);
  return routes.find(
    (route) => route.slug === normalized || (route.aliases ?? []).some((alias) => alias === normalized)
  );
}

export function isComingSoon(route: NawyRoute): boolean {
  return route.status === "coming-soon";
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function openRoute(route: NawyRoute): void {
  window.location.assign(route.url);
}
