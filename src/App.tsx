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
  const [launcherOpen, setLauncherOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRoutes().then((result) => {
      if (cancelled) return;
      const activeRoutes = result.routes.filter((route) => route.status !== "coming-soon");
      setRoutes(result.routes);
      setSource(result.source);
      const requested = findRoute(activeRoutes, getPathSlug());
      setSlug(requested?.slug ?? activeRoutes[0]?.slug ?? "");
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

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLauncherOpen(true);
        window.setTimeout(() => document.querySelector<HTMLInputElement>(".launcher-bar input")?.focus(), 0);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function go(route = selected) {
    if (route) openRoute(route);
    else if (slug) window.location.assign(`https://nawy.to/${encodeURIComponent(slug)}`);
  }

  return (
    <main className="nawy-page">
      <div className="nawy-glow nawy-glow-top" />
      <div className="nawy-glow nawy-glow-side" />

      <section className="nawy-stage">
        <header className="nawy-header">
          <div className="nawy-brand" dir="ltr" aria-label="Nawy.to">
            <div className="nawy-logo-mark" aria-hidden="true">
              <span className="nawy-logo-dot" />
              <span className="nawy-logo-check" />
            </div>
            <div className="nawy-wordmark">
              <div><span>nawy</span><b>./</b></div>
              <small>NAWY.TO</small>
            </div>
          </div>
          <div className="nawy-status">
            <span />
            من هنا
          </div>
        </header>

        <div className="nawy-hero">
          <div className="nawy-eyebrow"><span /> مساحتك تبدأ من هنا</div>
          <h1>ناوي على إيه؟</h1>
          <p>قول، دوّن، العب، وحقق اللي نفسك تعمله.</p>
        </div>

        <div className="nawy-launcher-wrap">
          <RoutePicker
            routes={activeRoutes}
            value={slug}
            onChange={setSlug}
            onOpen={() => setLauncherOpen(true)}
            onClose={() => setLauncherOpen(false)}
            onGo={go}
          />
        </div>

        <div className={`nawy-selected ${launcherOpen ? "is-hidden" : ""}`}>
          <div className="selected-copy">
            <span className="selected-route" dir="ltr">/{selected?.slug ?? "…"}</span>
            <strong>{selected?.description ?? "اختار من ناوي"}</strong>
          </div>
          <button type="button" onClick={go} disabled={loading || !selected} aria-label="فتح الوجهة الحالية">
            <span>{loading ? "لحظة…" : selected?.cta ?? "ابدأ"}</span>
            <b>↗</b>
          </button>
        </div>

        <div className={`nawy-discovery ${launcherOpen ? "is-hidden" : ""}`}>
          <span>اسحب على سطر ناوي للتنقل</span>
          <i>•</i>
          <span>أو اضغط واكتب</span>
        </div>

        <footer className="nawy-footer">
          <span className="offline-state">
            <i />
            {source === "local" ? "يعمل بدون اتصال" : source === "network" ? "محدّث الآن" : "جاهز"}
          </span>
          <span dir="ltr">أقول → أحقق → أشوف</span>
          <span dir="ltr">nawy./</span>
        </footer>
      </section>
    </main>
  );
}
