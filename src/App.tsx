import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hints } from "./components/Hints";
import { Launcher } from "./components/Launcher";
import { StatusScreen } from "./components/StatusScreen";
import { loadRoutes, type RouteSource } from "./data/routes";
import { findRoute, getPathSlug, isComingSoon, openRoute } from "./lib/navigation";
import { suggestRoutes } from "./lib/search";
import type { NawyRoute } from "./types";

type View =
  | { kind: "loading" }
  | { kind: "home" }
  | { kind: "opening"; route: NawyRoute }
  | { kind: "soon"; route: NawyRoute }
  | { kind: "missing"; slug: string };

const HOME_TITLE = "Nawy.to — ناوي على إيه؟";

function resolveView(routes: NawyRoute[], slug: string): View {
  const route = findRoute(routes, slug);
  if (!route) return { kind: "missing", slug };
  return isComingSoon(route) ? { kind: "soon", route } : { kind: "opening", route };
}

function titleFor(view: View): string {
  switch (view.kind) {
    case "opening": return `بنفتح ${view.route.label} — Nawy.to`;
    case "soon": return `${view.route.label} قريبًا — Nawy.to`;
    case "missing": return "رابط مش موجود — Nawy.to";
    default: return HOME_TITLE;
  }
}

export default function App() {
  const [routes, setRoutes] = useState<NawyRoute[] | null>(null);
  const [source, setSource] = useState<RouteSource | null>(null);
  const [view, setView] = useState<View>(() => (getPathSlug() ? { kind: "loading" } : { kind: "home" }));
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadRoutes().then((result) => {
      if (cancelled) return;
      setRoutes(result.routes);
      setSource(result.source);
      const slug = getPathSlug();
      if (slug) setView(resolveView(result.routes, slug));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.title = titleFor(view);
  }, [view]);

  function goHome() {
    window.history.replaceState(null, "", "/");
    setQuery("");
    setView({ kind: "home" });
  }

  function openFromLauncher(route: NawyRoute) {
    if (isComingSoon(route)) setView({ kind: "soon", route });
    else openRoute(route);
  }

  return (
    <div className="app">
      <Header source={routes ? source : null} />

      <main className="stage">
        {view.kind === "home" ? (
          <>
            <div className="intro">
              <h1 className="intro__title">ناوي على إيه؟</h1>
              <p className="intro__text">اكتب اسم المكان اللي عايز تروحه، أو اختار من القايمة.</p>
            </div>
            <Launcher
              routes={routes}
              query={query}
              onQueryChange={setQuery}
              onOpen={openFromLauncher}
              onMissing={(slug) => setView({ kind: "missing", slug })}
            />
          </>
        ) : view.kind === "loading" ? (
          <StatusScreen kind="loading" />
        ) : view.kind === "missing" ? (
          <StatusScreen kind="missing" slug={view.slug} suggestions={suggestRoutes(routes ?? [], view.slug)} onHome={goHome} />
        ) : view.kind === "soon" ? (
          <StatusScreen kind="soon" route={view.route} onHome={goHome} />
        ) : (
          <StatusScreen kind="opening" route={view.route} onHome={goHome} />
        )}
      </main>

      {view.kind === "home" && <Hints hasQuery={query.length > 0} />}
    </div>
  );
}
