import test from "node:test";
import assert from "node:assert/strict";
import { ensureVibratePermission } from "../scripts/ensure-android-vibrate-permission.mjs";

test("adds the Android vibration permission to a generated Capacitor manifest", () => {
  const manifest = '<?xml version="1.0"?><manifest xmlns:android="http://schemas.android.com/apk/res/android"><application /></manifest>';
  const result = ensureVibratePermission(manifest);
  assert.equal(result.changed, true);
  assert.match(result.content, /<uses-permission android:name="android\.permission\.VIBRATE" \/>/);
});

test("does not duplicate an existing Android vibration permission", () => {
  const manifest = '<manifest><uses-permission android:name="android.permission.VIBRATE" /><application /></manifest>';
  const result = ensureVibratePermission(manifest);
  assert.equal(result.changed, false);
  assert.equal((result.content.match(/android\.permission\.VIBRATE/g) || []).length, 1);
});

test("fails clearly when the manifest root is missing", () => {
  assert.throws(() => ensureVibratePermission("<application />"), /opening <manifest>/);
});
