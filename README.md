# Nawy.to

بوابة ناوي للوصول السريع إلى منتجات وخدمات ناوي.

## Routes

- `nawy.to/app` → `https://nawy.app/`
- `nawy.to/note` (و`/notes`) → `https://inawy.github.io/nawy-notes/`
- `nawy.to/game` → `https://nawy.app/game`
- `nawy.to/do` و`nawy.to/today` → قريبًا

المسارات تُدار من `public/links.json`، ولا توجد صفحة HTML منفصلة لكل slug.

## الواجهة

- **الرئيسية:** حقل بشكل الرابط (`nawy.to/`) وتحته كل الوجهات. البحث بالاسم أو الوصف أو الكلمات المرتبطة، و`↑ ↓` للتنقل و`↵` للفتح و`/` أو `Ctrl+K` للكتابة.
- **رابط مباشر (`nawy.to/note`):** شاشة "بنفتح…" ثم تحويل تلقائي، وفيها زر "افتح دلوقتي" و"ارجع للرئيسية".
- **رابط غلط:** شاشة تقترح أقرب وجهة. **وجهة قريبًا:** شاشة تشرح إنها لسه بتتجهز.
- **المظهر:** فاتح وداكن حسب إعداد الجهاز، وزر لتغييره يتحفظ في المتصفح.
- **الخط:** IBM Plex Sans Arabic من Google Fonts، ويتخزّن للعمل بدون اتصال.

## بعد الـbuild (`scripts/postbuild.mjs`)

- **تحقق من `links.json`:** أي خطأ (slug غلط، alias مكرر، رابط active بيشاور على nawy.to نفسه، اسم بيتعارض مع ملف في الموقع) بيوقف الـbuild فلا يتم النشر. القواعد في `scripts/manifest.mjs` واختباراتها في `scripts/manifest.test.mjs` (`npm test`).
- **صفحة لكل slug وalias:** بيتولّد `dist/<slug>/index.html`، فالرابط بيرجع HTTP 200 بدل 404 (مهم لمراقبة الروابط ومعاينات واتساب وسلاك). فيها بيانات المعاينة (og tags)، وتحويل `<noscript>` للي مفعّل JavaScript عنده معطّل.
- **`404.html`:** نسخة من `index.html`، فأي مسار غير معروف يفتح التطبيق نفسه ويعرض شاشة "مفيش رابط".

## Stack

React + TypeScript + Vite + Tailwind CSS + Dexie/IndexedDB + PWA.

## Local-first

يتم جلب `links.json` وتخزين آخر نسخة محليًا في IndexedDB. عند فقد الاتصال، يستخدم التطبيق النسخة المحلية، ومع أول تشغيل يوجد fallback داخلي للمسارات الأساسية.

## إضافة مسار جديد

أضف block جديدًا داخل `public/links.json`:

```json
"note": {
  "url": "https://nawy.app/notes",
  "label": "ناوي نوت",
  "description": "ملاحظاتك ببساطة",
  "status": "active"
}
```

ثم يصبح:

`https://nawy.to/note`

## تطوير محلي

```bash
npm install
npm run dev
npm run check
npm run build
```

## GitHub Pages

الـworkflow موجود في `.github/workflows/deploy.yml` ويستخدم GitHub Pages artifact deployment.
