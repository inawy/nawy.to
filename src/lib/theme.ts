export type Theme = "light" | "dark";

const STORAGE_KEY = "nawy-theme";
const THEME_COLOR: Record<Theme, string> = { light: "#F4F5F7", dark: "#0B0E13" };

/** The theme applied by the inline script in index.html before first paint. */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice simply lasts for this visit.
  }
}
