import bundled from "../../public/links.json";
import type { NawyRoute, RoutesFile } from "../types";
import { routesFromFile } from "./manifest";

/**
 * Built-in copy of public/links.json for a first visit with no network. It is read from the same
 * file at build time, so it cannot drift from the live manifest.
 */
export const defaultRoutes: NawyRoute[] = routesFromFile(bundled as unknown as RoutesFile);
