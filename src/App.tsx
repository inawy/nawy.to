import { useEffect, useMemo, useState } from "react";
import { RoutePicker } from "./components/RoutePicker";
import { loadRoutes } from "./data/routes";
import { findRoute, getPathSlug, openRoute } from "./lib/navigation";
import type { NawyRoute } from "./types";

function routeGlyph(slug: string): string {
  if (slug === "app") return "•";
  if (slug === "game") return "✦";
  if (slug === "note") return "✎";
  if (slug === "today") return "◷";
  if (slug === "do") return "✓";
  return "↗";
}

export default function App() {
  const [routes, setRoutes] = useState<NawyRoute[]>([]);
  const [slug, setSlug] = useState("");
  const [source, setSource] = useState<"network" | "local" | "fallback">("fallback");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadRoutes().then((result) => {
      if (cancelled) return;
      setRoutes(result.routes);
      setSource(result.source);
      const activeRoutes = result.routes.filter((route) => route.status !== "coming-soon");
      const requested = findRoute(activeRoutes, getPathSlug());
      const first = activeRoutes[0];
      setSlug(requested?.slug ?? first?.slug ?? "");
      setLoading(false);
      if (requested) openRoute(requested);
    });
    return () => { cancelled = true; };
  }, []);

  const activeRoutes = useMemo(
    () => routes.filter((route) => route.status !== "coming-soon"),
    [routes]
  );
  const selected = findRoute(activeRoutes, slug);

  function go() {
    if (selected) openRoute(selected);
    else if (slug) window.location.assign(`https://nawy.to/${encodeURIComponent(slug)}`);
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <section className="portal" aria-labelledby="portal-title">
        <header className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div className="brand-copy">
            <p className="brand-name">Nawy.to</p>
            <p className="brand-kicker">بوابة ناوي</p>
          </div>
          <span className="status-dot" aria-hidden="true" />
        </header>

        <div className="hero-copy">
          <p className="eyebrow"><span /> ناوي معك</p>
          <h1 id="portal-title">قولها.<br /><span>ناوي عليها.</span></h1>
          <p className="intro">تطبيقات ناوي اللي تساعدك تقول، تكتب، تلعب، وتحقق اللي نفسك تعمله.</p>
        </div>

        <div className="route-area">
          <div className="route-label">
            <span>ناوي على إيه؟</span>
            <span className="route-hint">اسحب واختار</span>
          </div>

          <RoutePicker routes={activeRoutes} value={slug} onChange={setSlug} />

          <div className="selected-meta">
            <p>{selected?.description ?? (slug ? "المسار غير موجود حاليًا." : "اختر مسارًا أو اكتب واحدًا.")}</p>
            {selected && <span>/{selected.slug}</span>}
          </div>

          <button className="go-button" type="button" onClick={go} disabled={loading || !selected}>
            <span>{loading ? "لحظة…" : selected?.cta ?? "اختار ناوي"}</span>
            <span className="go-arrow" aria-hidden="true">↗</span>
          </button>
        </div>

        <nav className="route-list" aria-label="تطبيقات ناوي">
          <div className="section-heading">
            <span>تطبيقات ناوي</span>
            <span>{activeRoutes.length} {activeRoutes.length === 1 ? "تطبيق" : "تطبيقات"}</span>
          </div>

          <div className="route-grid">
            {activeRoutes.map((route) => (
              <button
                key={route.slug}
                className={route.slug === slug ? "route-card is-active" : "route-card"}
                type="button"
                onClick={() => setSlug(route.slug)}
                title={route.description ?? route.label}
                aria-pressed={route.slug === slug}
              >
                <span className="route-icon" aria-hidden="true">{routeGlyph(route.slug)}</span>
                <span className="route-card-copy">
                  <strong>{route.label}</strong>
                  <small>{route.slug === "app" ? "نواياك وأهدافك" : route.slug === "note" ? "ملاحظاتك معك" : route.slug === "game" ? "استراحة خفيفة" : "قريبًا مع ناوي"}</small>
                </span>
                <span className="route-card-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </nav>

        <footer className="footer-row">
          <span><i /> {source === "local" ? "يعمل بدون اتصال" : source === "network" ? "محدّث الآن" : "وضع احتياطي"}</span>
          <span>أقول → أحقق → أشوف</span>
        </footer>
      </section>
    </main>
  );
}
