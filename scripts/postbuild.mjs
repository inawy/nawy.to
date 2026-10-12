// GitHub Pages serves 404.html for any path it does not know (nawy.to/note, nawy.to/typo, ...).
// Making it a copy of index.html lets the app itself resolve the slug, so every state shares one UI.
import { copyFileSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
