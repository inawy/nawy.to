import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import type { NawyRoute } from "../types";
import { normalizeSlug } from "../lib/navigation";

interface RoutePickerProps {
  routes: NawyRoute[];
  value: string;
  onChange: (slug: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onGo: (route?: NawyRoute) => void;
}

function scoreRoute(route: NawyRoute, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const haystack = [route.slug, route.label, route.description ?? "", ...(route.keywords ?? [])].join(" ").toLowerCase();
  if (route.slug.toLowerCase() === q) return 100;
  if (route.label.toLowerCase() === q) return 95;
  if (haystack.startsWith(q)) return 80;
  if (haystack.includes(q)) return 60;
  return 0;
}

export function RoutePicker({ routes, value, onChange, onOpen, onClose, onGo }: RoutePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const startX = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = Math.max(0, routes.findIndex((route) => route.slug === value));

  const results = useMemo(() => routes
    .map((route, originalIndex) => ({ route, originalIndex, score: scoreRoute(route, query) }))
    .filter((item) => !query || item.score > 0)
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .map((item) => item.route), [query, routes]);

  useEffect(() => {
    if (!open) return;
    const index = results.findIndex((route) => route.slug === value);
    setActiveIndex(index >= 0 ? index : 0);
  }, [open, results, value]);

  function select(route: NawyRoute, navigate = false) {
    onChange(route.slug);
    setQuery("");
    setOpen(false);
    onClose();
    if (navigate) onGo(route);
  }

  function move(delta: number) {
    if (!routes.length) return;
    const next = (selectedIndex + delta + routes.length) % routes.length;
    onChange(routes[next].slug);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setQuery("");
      setOpen(false);
      onClose();
      inputRef.current?.blur();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const route = results[activeIndex] ?? routes[selectedIndex];
      if (route) {
        select(route, true);
      }
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, input, select, textarea, a")) return;
    startX.current = event.clientX;
    pointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== event.pointerId || startX.current === null) return;
    const delta = event.clientX - startX.current;
    if (Math.abs(delta) > 40) {
      event.preventDefault();
      move(delta < 0 ? 1 : -1);
    }
    startX.current = null;
    pointerId.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== event.pointerId) return;
    startX.current = null;
    pointerId.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("input, button, select, textarea, a")) return;
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    move(event.deltaY > 0 ? 1 : -1);
  }

  const selected = routes[selectedIndex];

  return (
    <div className={`launcher-shell ${open ? "is-open" : ""}`} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
      <div className="launcher-bar">
        <span className="launcher-mark" aria-hidden="true"><span /></span>
        <span className="launcher-prefix" dir="ltr">nawy.to /</span>
        <input
          ref={inputRef}
          value={query}
          onFocus={() => { setOpen(true); onOpen(); }}
          onChange={(event) => { setQuery(normalizeSlug(event.target.value)); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onBlur={() => window.setTimeout(() => { setOpen(false); onClose(); }, 140)}
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label="البحث في ناوي"
          placeholder="اكتب أو اختار من ناوي..."
        />
        <kbd className="launcher-key">⌘K</kbd>
        <button className="launcher-go" type="button" onMouseDown={(event) => event.preventDefault()} onClick={onGo} aria-label="فتح الوجهة الحالية">↗</button>
      </div>

      <div className="launcher-hint" aria-hidden={open}>
        <span>اسحب للتنقل</span>
        <span className="launcher-dots">{routes.map((route, index) => <i key={route.slug} className={index === selectedIndex ? "active" : ""} />)}</span>
        <span>أو اكتب</span>
      </div>

      {open && (
        <div className="launcher-results" role="listbox" aria-label="وجهات ناوي">
          {results.length ? results.map((route, index) => (
            <button key={route.slug} className={`launcher-result ${route.slug === value || index === activeIndex ? "is-active" : ""}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => select(route, true)} role="option" aria-selected={route.slug === value}>
              <span className="result-dot" aria-hidden="true" />
              <span className="result-copy"><strong>{route.label}</strong><small>{route.description}</small></span>
              <span className="result-slug" dir="ltr">/{route.slug}</span>
            </button>
          )) : <div className="launcher-empty">مفيش وجهة بالاسم ده دلوقتي.</div>}
        </div>
      )}
    </div>
  );
}
