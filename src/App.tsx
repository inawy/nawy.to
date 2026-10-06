import { useEffect, useMemo, useState } from "react";
import { RoutePicker } from "./components/RoutePicker";
import { loadRoutes } from "./data/routes";
import { findRoute, getPathSlug, openRoute } from "./lib/navigation";
import type { NawyRoute } from "./types";

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

  const activeRoutes = useMemo(() => routes.filter((route) => route.status !== "coming-soon"), [routes]);
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
          <div><p className="brand-name">Nawy.to</p><p className="brand-kicker">بوابة ناوي</p></div>
        </header>

        <div className="hero-copy">
          <p className="eyebrow">من هنا تبدأ الطريق</p>
          <h1 id="portal-title">كل ناوي<br /><span>في طريقه.</span></h1>
          <p className="intro">بوابة بسيطة للوصول إلى منتجات وخدمات ناوي من مكان واحد.</p>
        </div>

        <div className="route-area">
          <RoutePicker routes={activeRoutes} value={slug} onChange={setSlug} />
          <button className="go-button" type="button" onClick={go} disabled={loading || !selected}>
            <span>اذهب</span><span aria-hidden="true">←</span>
          </button>
          <p className="selected-description">
            {selected?.description ?? (slug ? "المسار غير موجود حاليًا." : "اختر مسارًا أو اكتب واحدًا.")}
          </p>
        </div>

        <nav className="route-list" aria-label="بوابات ناوي">
          {activeRoutes.map((route) => (
            <button
              key={route.slug}
              className={route.slug === slug ? "route-chip is-active" : "route-chip"}
              type="button"
              onClick={() => setSlug(route.slug)}
              title={route.description ?? route.label}
            >
              <span>{route.label}</span><small>/{route.slug}</small>
            </button>
          ))}
        </nav>

        <footer className="footer-row">
          <span>{source === "local" ? "متاح محليًا" : source === "network" ? "محدّث" : "نسخة افتراضية"}</span>
          <span>بسيط. سريع. لناوي.</span>
        </footer>
      </section>
    </main>
  );
}
