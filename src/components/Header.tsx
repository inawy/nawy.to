import { useState } from "react";
import type { RouteSource } from "../data/routes";
import { applyTheme, currentTheme, type Theme } from "../lib/theme";
import { MoonIcon, SunIcon } from "./icons";

function Logo() {
  return (
    <svg className="brand__mark" width="36" height="36" viewBox="0 0 512 512" role="img" aria-label="ناوي">
      <rect width="512" height="512" rx="112" style={{ fill: "var(--logo-bg)" }} />
      <circle cx="193" cy="255" r="75" style={{ fill: "var(--logo-fg)" }} />
      <polygon points="361,180 418,180 326,331 269,331" style={{ fill: "var(--logo-fg)" }} />
    </svg>
  );
}

/** Only worth a word when something is unusual: the list came from this device, not the network. */
const OFFLINE_NOTE: Partial<Record<RouteSource, string>> = {
  local: "يعمل بدون اتصال",
  fallback: "يعمل بدون اتصال"
};

export function Header({ source }: { source: RouteSource | null }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const note = source ? OFFLINE_NOTE[source] : undefined;

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <header className="header">
      <a className="brand" href="/" aria-label="Nawy.to — الرئيسية" dir="ltr">
        <Logo />
        <span className="brand__word">nawy<span>.to</span></span>
      </a>
      <div className="header__tools">
        {note && (
          <span className="status" role="status">
            <i aria-hidden="true" />
            {note}
          </span>
        )}
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "المظهر الفاتح" : "المظهر الداكن"}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
