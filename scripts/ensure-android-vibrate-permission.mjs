import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function ensureVibratePermission(manifestXml) {
  const permission = '<uses-permission android:name="android.permission.VIBRATE" />';
  const permissionPattern = /<uses-permission\\b[^>]*android:name\\s*=\\s*["']android\\.permission\\.VIBRATE["'][^>]*\\/?>/;
  if (permissionPattern.test(manifestXml)) {
    return { content: manifestXml, changed: false };
  }

  const manifestTag = manifestXml.match(/<manifest\\b[^>]*>/);
  if (!manifestTag) {
    throw new Error("AndroidManifest.xml is missing its opening <manifest> element");
  }

  return {
    content: manifestXml.replace(manifestTag[0], manifestTag[0] + "\\n    " + permission),
    changed: true
  };
}

async function main() {
  const manifestPath = path.resolve("android/app/src/main/AndroidManifest.xml");
  const current = await fs.readFile(manifestPath, "utf8");
  const result = ensureVibratePermission(current);
  if (result.changed) {
    await fs.writeFile(manifestPath, result.content, "utf8");
    console.log("Added android.permission.VIBRATE to the generated Android manifest.");
  } else {
    console.log("android.permission.VIBRATE is already declared.");
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
