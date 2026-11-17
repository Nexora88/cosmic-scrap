import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const files = [
  "index.html", "profile.html", "profile.css", "profile.js",
  "privacy.html", "support.html", "sw.js", "manifest.webmanifest"
];
const dirs = ["assets", "css", "js"];
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
for (const file of files) {
  try { await fs.copyFile(path.join(root, file), path.join(out, file)); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
for (const dir of dirs) {
  try { await fs.cp(path.join(root, dir), path.join(out, dir), { recursive: true }); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
console.log("Native web bundle staged in dist/");
