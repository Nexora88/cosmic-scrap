import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUsername } from "../js/utils/Username.js";

test("transliterates Turkish letters and spaces into a database-safe handle", () => {
  assert.equal(normalizeUsername("Şule Çelik"), "Sule_Celik");
  assert.equal(normalizeUsername("İğde Üzüm"), "Igde_Uzum");
  assert.equal(normalizeUsername("Pilot 7"), "Pilot_7");
});

test("removes unsupported punctuation and trims separators", () => {
  assert.equal(normalizeUsername("  !!Nova--Pilot!!  "), "Nova_Pilot");
  assert.equal(normalizeUsername("___A___"), "A");
});

test("limits handles to 20 safe characters", () => {
  const name = normalizeUsername("ExtraordinarilyLongPilotName");
  assert.equal(name.length, 20);
  assert.match(name, /^[A-Za-z0-9_]+$/);
});

test("empty or punctuation-only names normalize to an empty value", () => {
  assert.equal(normalizeUsername(""), "");
  assert.equal(normalizeUsername("!!! ___"), "");
});
