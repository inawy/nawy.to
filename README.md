# Nawy.to

بوابة ناوي للوصول السريع إلى منتجات وخدمات ناوي.

## Routes

- `nawy.to/app` → `https://nawy.app/`
- `nawy.to/game` → `https://nawy.app/game`

المسارات تُدار من `public/links.json`، ولا توجد صفحة HTML منفصلة لكل slug.

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
