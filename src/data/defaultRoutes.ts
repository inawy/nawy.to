import type { NawyRoute } from "../types";

export const defaultRoutes: NawyRoute[] = [
  { slug: "app", url: "https://nawy.app/", label: "ناوي", description: "مساحتك الشخصية لنواياك وأهدافك", cta: "ابدأ نواياك", status: "active" },
  { slug: "game", url: "https://nawy.app/game", label: "العب مع ناوي 🎮", description: "خد استراحة والعب مع ناوي 🎮", cta: "روح العب مع ناوي", status: "active" }
];
