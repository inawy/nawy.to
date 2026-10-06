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

function productSubline(slug: string): string {
  if (slug === "app") return "نواياك وأهدافك";
  if (slug === "note") return "ملاحظاتك معك";
  if (slug === "game") return "استراحة خفيفة";
  return "قريبًا مع ناوي";
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
    <main className="relative min-h-screen overflow-hidden bg-[#070A10] px-3 py-3 text-white sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#3D7BFF]/10 blur-[110px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#3D7BFF]/5 blur-[100px]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] px-5 py-6 shadow-[0_30px_100px_rgba(0,0,0,.38)] backdrop-blur-2xl sm:min-h-[calc(100vh-3rem)] sm:rounded-[36px] sm:px-10 sm:py-9 lg:px-14">
        <header className="flex items-center gap-3">
          <div className="nawy-logo-mark" aria-hidden="true">
            <span className="nawy-logo-dot" />
            <span className="nawy-logo-check" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-black tracking-[-0.03em]">ناوي</div>
            <div className="text-[10px] font-semibold text-white/35" dir="ltr">Nawy.to</div>
          </div>
          <div className="mr-auto flex items-center gap-2 text-[10px] font-semibold text-white/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3D7BFF] shadow-[0_0_12px_rgba(61,123,255,.8)]" />
            مساحتك، من هنا
          </div>
        </header>

        <div className="mt-14 sm:mt-20">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-extrabold text-[#7FA5FF]">
            <span className="h-1 w-1 rounded-full bg-[#3D7BFF]" />
            ناوي معك
          </p>
          <h1 className="max-w-2xl text-[clamp(3rem,9vw,6.2rem)] font-black leading-[.92] tracking-[-.075em]">
            ناوي على إيه؟
            <span className="mt-3 block text-white/35"></span>
          </h1>
          <p className="mt-6 max-w-lg text-sm font-medium leading-8 text-white/45 sm:text-[15px]">
            تطبيقات ناوي اللي تساعدك تقول، تكتب، تلعب، وتحقق اللي نفسك تعمله.
          </p>
        </div>

        <div className="mt-9 sm:mt-11">
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-extrabold text-white/65">
            <span>ناوي على إيه؟</span>
            <span className="text-[10px] font-semibold text-white/25">اسحب أو اختار</span>
          </div>

          <RoutePicker routes={activeRoutes} value={slug} onChange={setSlug} />

          <div className="mt-2 flex min-h-7 items-center justify-between gap-3 px-1">
            <p className="m-0 text-[11px] font-medium leading-6 text-white/40">
              {selected?.description ?? (slug ? "المسار غير موجود حاليًا." : "اختار اللي ناوي عليه.")}
            </p>
            {selected && <span className="text-[10px] font-bold text-white/20" dir="ltr">/{selected.slug}</span>}
          </div>

          <button
            className="mt-2 flex min-h-14 w-full items-center justify-between rounded-2xl border border-[#3D7BFF]/40 bg-[#3D7BFF] px-5 text-sm font-black shadow-[0_14px_35px_rgba(61,123,255,.18)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            type="button"
            onClick={go}
            disabled={loading || !selected}
          >
            <span>{loading ? "لحظة…" : selected?.cta ?? "اختار ناوي"}</span>
            <span className="text-xl font-light" aria-hidden="true">↗</span>
          </button>
        </div>

        <nav className="mt-8 border-t border-white/[0.06] pt-6" aria-label="تطبيقات ناوي">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold text-white/60">تطبيقات ناوي</span>
            <span className="text-[10px] font-semibold text-white/25">{activeRoutes.length} {activeRoutes.length === 1 ? "تطبيق" : "تطبيقات"}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {activeRoutes.map((route) => (
              <button
                key={route.slug}
                className={`group flex min-h-[68px] min-w-0 items-center gap-3 rounded-2xl border px-3 text-right transition hover:-translate-y-0.5 ${
                  route.slug === slug
                    ? "border-[#3D7BFF]/35 bg-[#3D7BFF]/[0.08]"
                    : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.045]"
                }`}
                type="button"
                onClick={() => setSlug(route.slug)}
                title={route.description ?? route.label}
                aria-pressed={route.slug === slug}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-black ${
                  route.slug === slug
                    ? "border-[#3D7BFF]/25 bg-[#3D7BFF]/10 text-white"
                    : "border-white/[0.07] bg-white/[0.03] text-[#7FA5FF]"
                }`} aria-hidden="true">{routeGlyph(route.slug)}</span>
                <span className="grid min-w-0 gap-0.5">
                  <strong className="truncate text-[12px] font-black">{route.label}</strong>
                  <small className="text-[10px] font-semibold text-white/25">{productSubline(route.slug)}</small>
                </span>
                <span className="mr-auto text-sm text-white/20 transition group-hover:text-white/50" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </nav>

        <footer className="mt-auto flex flex-col gap-2 border-t border-white/[0.045] pt-5 text-[9px] font-semibold text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <i className="h-1 w-1 rounded-full bg-[#3D7BFF]" />
            {source === "local" ? "يعمل بدون اتصال" : source === "network" ? "محدّث الآن" : "وضع احتياطي"}
          </span>
          <span>أقول → أحقق → أشوف</span>
        </footer>
      </section>
    </main>
  );
}
