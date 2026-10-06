import type { NawyRoute } from "../types";

export const defaultRoutes: NawyRoute[] = [
  {
    slug: "app",
    url: "https://nawy.app/",
    label: "ناوي",
    description: "مساحتك الشخصية لنواياك وأهدافك",
    cta: "ابدأ نواياك",
    keywords: ["ناوي", "نوايا", "نية", "نواياي", "هدف", "أهداف", "app", "home"],
    status: "active"
  },
  {
    slug: "note",
    url: "https://inawy.github.io/nawy-notes/",
    label: "ناوي نوت",
    description: "روح دوّن ملاحظاتك وخليها معك",
    cta: "روح دوّن ملاحظاتك",
    keywords: ["نوت", "ملاحظات", "ملاحظة", "اكتب", "دوّن", "note", "notes"],
    aliases: ["notes"],
    status: "active"
  },
  {
    slug: "game",
    url: "https://nawy.app/game",
    label: "ناوي جيم",
    description: "خد استراحة والعب مع ناوي",
    cta: "روح العب مع ناوي",
    keywords: ["جيم", "لعب", "العب", "استراحة", "game", "play"],
    status: "active"
  }
];
