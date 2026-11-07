import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("touch joystick knob stays at the last finger position after release", () => {
  const input = fs.readFileSync(new URL("../js/core/Input.js", import.meta.url), "utf8");
  assert.match(input, /this\.stick\.pointerType=e\.pointerType/);
  assert.match(input, /this\.stick\.pointerType!=="touch"\)knob\.style\.transform="translate\(0,0\)"/);
  assert.match(input, /this\.stick\.x=0;this\.stick\.y=0/);
  assert.match(input, /this\.stick\.pointerType=null/);
});
