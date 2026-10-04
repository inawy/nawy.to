import Dexie, { type Table } from "dexie";
import type { NawyRoute } from "../types";

export interface RouteRecord extends NawyRoute { order: number; }

class NawyDatabase extends Dexie {
  routes!: Table<RouteRecord, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("nawy-to");
    this.version(1).stores({ routes: "slug, order, status", meta: "key" });
  }
}

export const db = new NawyDatabase();
