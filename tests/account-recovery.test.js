import test from "node:test";
import assert from "node:assert/strict";
import { accountAuthRedirectUrl, validateNewPassword } from "../js/account-recovery.js";

test("password reset validation enforces length and confirmation", () => {
  assert.equal(validateNewPassword("short", "short"), "Password must be between 8 and 128 characters.");
  assert.equal(validateNewPassword("long-enough", "different"), "Passwords do not match.");
  assert.equal(validateNewPassword("long-enough", "long-enough"), "");
});

test("password reset validation rejects oversized and non-string values", () => {
  assert.equal(validateNewPassword("x".repeat(129), "x".repeat(129)), "Password must be between 8 and 128 characters.");
  assert.equal(validateNewPassword(null, null), "Password must be between 8 and 128 characters.");
});

test("auth redirect returns the current app root without stale query or hash values", () => {
  assert.equal(
    accountAuthRedirectUrl("https://example.test/game/index.html?ref=invite#access_token=secret"),
    "https://example.test/game/"
  );
});
