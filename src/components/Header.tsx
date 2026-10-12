import { useState } from "react";
import type { RouteSource } from "../data/routes";
import { applyTheme, currentTheme, type Theme } from "../lib/theme";
import { MoonIcon, SunIcon } from "./icons";

function Logo() {
  return (
    <svg className="brand__mark" width="36" height="36" viewBox="0 0 64 64" role="img" aria-label="ناوي">
      <rect width="64" height="64" rx="18" style={{ fill: "var(--ink)" }} />
      <path d="M17 38 27 47 47 23" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--bg)" }} />
      <circle cx="45" cy="16" r="5" style={{ fill: "var(--accent)" }} />
    </svg>
  );
}

const STATUS: Record<RouteSource | "loading", string> = {
  loading: "بيحمّل…",
  network: "محدّث الآن",
  local: "يعمل بدون اتصال",
  fallback: "جاهز"
};

export function Header({ source }: { source: RouteSource | null }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const state = source ?? "loading";

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
        <span className="status" data-state={state} role="status">
          <i aria-hidden="true" />
          {STATUS[state]}
        </span>
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "المظهر الفاتح" : "المظهر الداكن"}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
