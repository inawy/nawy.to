import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { NawyRoute } from "../types";
import { hostOf, isComingSoon, normalizeSlug } from "../lib/navigation";
import { normalizeQuery, searchRoutes } from "../lib/search";
import { ArrowIcon, EnterIcon } from "./icons";

interface LauncherProps {
  routes: NawyRoute[] | null;
  query: string;
  onQueryChange: (value: string) => void;
  onOpen: (route: NawyRoute) => void;
  onMissing: (slug: string) => void;
}

export function Launcher({ routes, query, onQueryChange, onOpen, onMissing }: LauncherProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSlug, setActiveSlug] = useState("");

  const results = useMemo(() => (routes ? searchRoutes(routes, query) : []), [routes, query]);
  const selectable = useMemo(() => results.filter((route) => !isComingSoon(route)), [results]);
  const active = selectable.find((route) => route.slug === activeSlug) ?? selectable[0];
  const activeId = active?.slug;

  // A keyboard-first launcher: "/" or Ctrl/⌘+K jumps to the field from anywhere.
  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // Focus the field on desktop only; on touch screens it would open the keyboard before the person asked.
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeId) document.getElementById(`route-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  function move(delta: number) {
    if (!selectable.length) return;
    const current = active ? selectable.indexOf(active) : 0;
    const next = Math.min(Math.max(current + delta, 0), selectable.length - 1);
    setActiveSlug(selectable[next].slug);
  }

  function submit() {
    if (active) return onOpen(active);
    if (results[0]) return onOpen(results[0]);
    const slug = normalizeSlug(normalizeQuery(query));
    if (slug) onMissing(slug);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) onQueryChange("");
      else inputRef.current?.blur();
    }
  }

  return (
    <div className="launcher">
      <div className="field" dir="ltr">
        <span className="field__prefix" aria-hidden="true">nawy.to/</span>
        <input
          ref={inputRef}
          className="field__input"
          dir="auto"
          type="text"
          role="combobox"
          aria-label="اسم الوجهة"
          aria-expanded="true"
          aria-controls="routes"
          aria-autocomplete="list"
          aria-activedescendant={activeId ? `route-${activeId}` : undefined}
          placeholder="note"
          value={query}
          onChange={(event) => {
            setActiveSlug("");
            onQueryChange(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
        />
        <button type="button" className="field__go" onClick={submit} aria-label="افتح">
          <EnterIcon />
          <span className="field__go-label">افتح</span>
        </button>
      </div>

      {!routes && (
        <div className="routes" aria-busy="true" aria-label="جاري تحميل الوجهات">
          {[0, 1, 2].map((index) => <div key={index} className="route route--skeleton" aria-hidden="true" />)}
        </div>
      )}

      {routes && results.length > 0 && (
        <div className="routes" id="routes" role="listbox" aria-label="وجهات ناوي">
          {results.map((route) => {
            if (isComingSoon(route)) {
              return (
                <div key={route.slug} className="route route--soon" role="option" aria-disabled="true" aria-selected="false">
                  <span className="route__text">
                    <strong>{route.label}</strong>
                    <span>{route.description}</span>
                  </span>
                  <span className="badge">قريبًا</span>
                </div>
              );
            }
            const isActive = route.slug === activeId;
            return (
              <a
                key={route.slug}
                id={`route-${route.slug}`}
                className="route"
                href={route.url}
                role="option"
                aria-selected={isActive}
                data-active={isActive ? "true" : undefined}
                onMouseMove={() => { if (!isActive) setActiveSlug(route.slug); }}
              >
                <span className="route__text">
                  <strong>{route.label}</strong>
                  <span>{route.description}</span>
                </span>
                <span className="route__meta" dir="ltr">
                  <span className="route__slug">/{route.slug}</span>
                  {isActive && <span className="route__host">{hostOf(route.url)}</span>}
                </span>
                {isActive && <ArrowIcon className="route__arrow" />}
              </a>
            );
          })}
        </div>
      )}

      {routes && results.length === 0 && (
        <div className="empty">
          <p>مفيش وجهة بالاسم ده.</p>
          <button type="button" className="btn btn--ghost" onClick={() => onQueryChange("")}>امسح البحث</button>
        </div>
      )}
    </div>
  );
}
