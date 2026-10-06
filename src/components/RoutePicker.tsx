import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react";
import type { NawyRoute } from "../types";
import { normalizeSlug } from "../lib/navigation";

interface RoutePickerProps {
  routes: NawyRoute[];
  value: string;
  onChange: (slug: string) => void;
}

export function RoutePicker({ routes, value, onChange }: RoutePickerProps) {
  const startX = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);
  const foundIndex = routes.findIndex((route) => route.slug === value);
  const index = foundIndex >= 0 ? foundIndex : 0;

  useEffect(() => {
    if (!value && routes[0]) onChange(routes[0].slug);
  }, [onChange, routes, value]);

  function move(delta: number) {
    if (!routes.length) return;
    const nextIndex = (index + delta + routes.length) % routes.length;
    onChange(routes[nextIndex].slug);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, input, select, textarea, a")) return;

    startX.current = event.clientX;
    pointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== event.pointerId || startX.current === null) return;

    const delta = event.clientX - startX.current;
    if (Math.abs(delta) > 40) {
      event.preventDefault();
      move(delta < 0 ? 1 : -1);
    }

    startX.current = null;
    pointerId.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== event.pointerId) return;
    startX.current = null;
    pointerId.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("input, button, select, textarea, a")) return;
    if (Math.abs(event.deltaY) < 8) return;

    event.preventDefault();
    move(event.deltaY > 0 ? 1 : -1);
  }

  return (
    <div
      className="route-picker"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-label="اختيار بوابة من بوابات ناوي"
    >
      <button className="picker-arrow" type="button" onClick={() => move(-1)} aria-label="البوابة السابقة">‹</button>
      <div className="route-value">
        <span className="route-prefix">nawy.to /</span>
        <input
          value={value}
          onChange={(event) => onChange(normalizeSlug(event.target.value))}
          list="nawy-routes"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label="اسم المسار"
          placeholder="..."
        />
        <datalist id="nawy-routes">
          {routes.map((route) => <option key={route.slug} value={route.slug}>{route.label}</option>)}
        </datalist>
      </div>
      <button className="picker-arrow" type="button" onClick={() => move(1)} aria-label="البوابة التالية">›</button>
    </div>
  );
}
