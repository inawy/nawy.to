export type RouteStatus = "active" | "coming-soon";

export interface NawyRoute {
  slug: string;
  url: string;
  label: string;
  description?: string;
  cta?: string;
  keywords?: string[];
  aliases?: string[];
  status?: RouteStatus;
}

export type RoutesFile = Record<string, Omit<NawyRoute, "slug">>;
