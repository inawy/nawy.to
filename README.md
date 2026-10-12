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

بعد الـbuild بيتم نسخ `dist/index.html` إلى `dist/404.html` (`scripts/postbuild.mjs`)، فأي مسار غير معروف على GitHub Pages يفتح التطبيق نفسه ويحدد الشاشة المناسبة.

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
