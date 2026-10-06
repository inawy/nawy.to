import type { NawyRoute } from "../types";

export const defaultRoutes: NawyRoute[] = [
  { slug: "app", url: "https://nawy.app/", label: "ناوي", description: "مساحتك الشخصية لنواياك وأهدافك", cta: "ابدأ نواياك", status: "active" },
  { slug: "note", url: "https://inawy.github.io/nawy-notes/", label: "ناوي نوت", description: "روح دوّن ملاحظاتك وخليها معك", cta: "روح دوّن ملاحظاتك", status: "active" },
  { slug: "game", url: "https://nawy.app/game", label: "ناوي رن", description: "خد استراحة والعب مع ناوي 🎮", cta: "روح العب مع ناوي", status: "active" }
];
