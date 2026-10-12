import { useEffect } from "react";
import type { NawyRoute } from "../types";
import { hostOf, openRoute } from "../lib/navigation";

/** How long the "opening" screen stays before sending the person on. Short enough to feel like a gateway. */
export const OPEN_DELAY_MS = 900;

export type StatusProps =
  | { kind: "loading" }
  | { kind: "opening"; route: NawyRoute; onHome: () => void }
  | { kind: "soon"; route: NawyRoute; onHome: () => void }
  | { kind: "missing"; slug: string; suggestions: NawyRoute[]; onHome: () => void };

function Opening({ route, onHome }: { route: NawyRoute; onHome: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => openRoute(route), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [route]);

  return (
    <section className="screen" aria-live="polite">
      <h1 className="screen__title">بنفتح {route.label}</h1>
      <p className="screen__text">هتنتقل إلى <bdi dir="ltr">{hostOf(route.url)}</bdi></p>
      <div className="progress" role="progressbar" aria-label="جاري الفتح">
        <div className="progress__bar" style={{ animationDuration: `${OPEN_DELAY_MS}ms` }} />
      </div>
      <div className="screen__actions">
        <a className="btn btn--primary" href={route.url}>افتح دلوقتي</a>
        <button type="button" className="btn btn--ghost" onClick={onHome}>ارجع للرئيسية</button>
      </div>
    </section>
  );
}

export function StatusScreen(props: StatusProps) {
  if (props.kind === "loading") {
    return (
      <section className="screen" aria-live="polite">
        <h1 className="screen__title">لحظة…</h1>
        <p className="screen__text">بنجهّز الرابط.</p>
        <div className="progress" role="progressbar" aria-label="جاري التحميل">
          <div className="progress__bar progress__bar--wait" />
        </div>
      </section>
    );
  }

  if (props.kind === "opening") return <Opening route={props.route} onHome={props.onHome} />;

  if (props.kind === "soon") {
    return (
      <section className="screen">
        <span className="badge">قريبًا</span>
        <h1 className="screen__title">{props.route.label}</h1>
        <p className="screen__text">{props.route.description}</p>
        <p className="screen__text">لسه بنجهّزه، وهيظهر هنا أول ما يبقى جاهز.</p>
        <div className="screen__actions">
          <button type="button" className="btn btn--primary" onClick={props.onHome}>ارجع للرئيسية</button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1 className="screen__title">مفيش رابط باسم <bdi dir="ltr">/{props.slug}</bdi></h1>
      {props.suggestions.length > 0 && (
        <>
          <p className="screen__text">يمكن تقصد واحد من دول:</p>
          <div className="routes">
            {props.suggestions.map((route, index) => (
              <a key={route.slug} className="route" href={route.url} data-active={index === 0 ? "true" : undefined}>
                <span className="route__text"><strong>{route.label}</strong></span>
                <span className="route__meta" dir="ltr"><span className="route__slug">/{route.slug}</span></span>
              </a>
            ))}
          </div>
        </>
      )}
      <div className="screen__actions">
        <button type="button" className="btn btn--secondary" onClick={props.onHome}>شوف كل الوجهات</button>
      </div>
    </section>
  );
}
