import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import type { NawyRoute } from "../types";
import { hostOf, isComingSoon, normalizeSlug } from "../lib/navigation";
import { normalizeQuery, searchRoutes } from "../lib/search";
import { CloseIcon, GoIcon, SearchIcon } from "./icons";

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
  const [open, setOpen] = useState(false);

  const results = useMemo(() => (routes ? searchRoutes(routes, query) : []), [routes, query]);
  const selectable = useMemo(() => results.filter((route) => !isComingSoon(route)), [results]);
  const active = selectable.find((route) => route.slug === activeSlug) ?? selectable[0];
  const activeId = active?.slug;
  const showPanel = open && !!routes;

  // A keyboard-first launcher: "/" or Ctrl/⌘+K jumps to the field from anywhere.
  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      const focusField = () => {
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      };
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusField();
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        focusField();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // Desktop only, and without opening the list: on touch screens it would raise the keyboard unasked.
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (showPanel && activeId) document.getElementById(`route-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [showPanel, activeId]);

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
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      else move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) onQueryChange("");
      setOpen(false);
    }
  }

  // Close the list when focus leaves the whole launcher, not when it moves between its own parts.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  // Clicking padding or text inside the card must not steal focus from the field.
  function keepFocus(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target as HTMLElement).closest("input, button, a")) event.preventDefault();
  }

  return (
    <div className="launcher" onBlur={handleBlur}>
      <div className="launcher__slot">
        <div className="card" data-open={showPanel ? "true" : undefined} onMouseDown={keepFocus}>
          <div className="field" dir="ltr">
            <SearchIcon className="field__icon" />
            <span className="field__prefix" aria-hidden="true">nawy.to/</span>
            <input
              ref={inputRef}
              className="field__input"
              dir="auto"
              type="text"
              role="combobox"
              aria-label="اسم الوجهة"
              aria-expanded={showPanel}
              aria-controls="routes"
              aria-autocomplete="list"
              aria-activedescendant={showPanel && activeId ? `route-${activeId}` : undefined}
              placeholder="note"
              value={query}
              onChange={(event) => {
                setActiveSlug("");
                setOpen(true);
                onQueryChange(event.target.value);
              }}
              onClick={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
            />
            {query && (
              <button
                type="button"
                className="field__btn"
                aria-label="امسح"
                onClick={() => {
                  onQueryChange("");
                  inputRef.current?.focus();
                }}
              >
                <CloseIcon />
              </button>
            )}
            <button type="button" className="field__go" onClick={submit} aria-label="افتح">
              <GoIcon />
            </button>
          </div>

          {showPanel && results.length > 0 && (
            <div className="panel" id="routes" role="listbox" aria-label="وجهات ناوي">
              {results.map((route) => {
                if (isComingSoon(route)) {
                  return (
                    <div key={route.slug} className="option option--soon" role="option" aria-disabled="true" aria-selected="false">
                      <span className="option__text">
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
                    className="option"
                    href={route.url}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive ? "true" : undefined}
                    onMouseMove={() => { if (!isActive) setActiveSlug(route.slug); }}
                  >
                    <span className="option__text">
                      <strong>{route.label}</strong>
                      <span>{route.description}</span>
                    </span>
                    <span className="option__meta" dir="ltr">
                      <span>/{route.slug}</span>
                      {isActive && <small>{hostOf(route.url)}</small>}
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          {showPanel && results.length === 0 && (
            <div className="panel panel--empty">مفيش وجهة بالاسم ده. جرّب اسم تاني.</div>
          )}
        </div>
      </div>

      <nav className="chips" aria-label="وجهات ناوي">
        {routes
          ? routes.map((route) =>
              isComingSoon(route) ? (
                <button key={route.slug} type="button" className="chip chip--soon" onClick={() => onOpen(route)}>
                  {route.label}
                  <small>قريبًا</small>
                </button>
              ) : (
                <a key={route.slug} className="chip" href={route.url}>{route.label}</a>
              )
            )
          : [0, 1, 2].map((index) => <span key={index} className="chip chip--skeleton" aria-hidden="true" />)}
      </nav>
    </div>
  );
}
