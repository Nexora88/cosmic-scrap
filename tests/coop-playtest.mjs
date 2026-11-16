import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/";
const mockSupabase = 'export function createClient() {\n  const user = window.__MOCK_USER;\n  const post = async (path, payload) => {\n    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, userId: user.id }) });\n    return response.json();\n  };\n  return {\n    auth: { getSession: async () => ({ data: { session: { user } }, error: null }) },\n    rpc: async (name, args) => { const result = await post("/__mock/rpc", { name, args }); return result.error ? { data: null, error: { message: result.error } } : { data: result.data, error: null }; },\n    functions: { invoke: async (name, options) => { const result = await post("/__mock/functions", { name, body: options.body }); return result.error ? { data: null, error: { message: result.error } } : { data: result.data, error: null }; } },\n    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }), in: async () => ({ data: [], error: null }) }) }),\n    storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "" } }) }) }\n  };\n}';
const state = { room: null, startedUsers: new Set(), inputs: {}, failNextTickUser: null };
const browser = await chromium.launch({ headless: true });
const errors = [];
const contexts = [];

async function createPilot(id, mobile = false) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1365, height: 900 },
    isMobile: mobile,
    hasTouch: mobile
  });
  contexts.push(context);
  await context.addInitScript(userId => {
    window.__MOCK_USER = { id: userId, email: userId + "@example.test" };
    localStorage.setItem("cosmic-scrap-language-selected", "1");
    localStorage.setItem("taviro-onboarding-complete", "1");
  }, id);
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(id + ": " + error.message));
  await page.route("https://esm.sh/@supabase/supabase-js@2", route => route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: mockSupabase
  }));
  await page.route("**/__mock/rpc", async route => {
    const { name, args, userId } = route.request().postDataJSON();
    let data = null;
    if (name === "create_invite_room") {
      state.room = { id: "room-1", invite_code: "AB12CD34", status: "waiting", room_mode: "friend", host_user_id: userId, guest_user_id: null, host_connected: true, guest_connected: false };
      data = state.room;
    } else if (name === "join_invite_room") {
      if (!state.room || args.p_invite_code !== state.room.invite_code) {
        return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Invite not found" }) });
      }
      state.room.guest_user_id = userId;
      state.room.status = "ready";
      state.room.guest_connected = true;
      data = state.room;
    } else if (name === "get_room_state") {
      if (!state.room || args.p_room_id !== state.room.id || ![state.room.host_user_id, state.room.guest_user_id].includes(userId)) {
        return route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ error: "Room access denied" }) });
      }
      data = { ...state.room, host_connected: true, guest_connected: Boolean(state.room.guest_user_id) };
    } else if (name === "heartbeat_coop_room") {
      data = { room_id: args.p_room_id, user_id: userId, last_seen_at: new Date().toISOString() };
    } else {
      data = [];
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data }) });
  });
  await page.route("**/__mock/functions", async route => {
    const { body, userId } = route.request().postDataJSON();
    if (body.action === "coop_start") {
      if (!state.room || !["playing", "ready"].includes(state.room.status)) {
        return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Room not ready" }) });
      }
      state.room.status = "playing";
      state.startedUsers.add(userId);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { status: "playing" } }) });
    }
    if (body.action === "coop_tick") {
      if (state.failNextTickUser === userId) {
        state.failNextTickUser = null;
        return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary simulated disconnect" }) });
      }
      state.inputs[userId] = body.input;
      const data = {
        status: "playing",
        waiting_for_players: state.startedUsers.size < 2,
        players: [{ x: 250, y: 500, alive: true }, { x: 750, y: 500, alive: true }],
        enemies: [], bullets: [], wave: 1, shared_score: 120, shared_lives: 3
      };
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data }) });
    }
    return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Unknown action" }) });
  });
  return page;
}

async function waitFor(check, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for mocked Co-op state");
}

try {
  const host = await createPilot("pilot-a");
  const guest = await createPilot("pilot-b", true);

  await host.goto(baseURL, { waitUntil: "domcontentloaded" });
  if (await host.locator("#intro-screen").isVisible()) await host.locator("#intro-continue").click();
  await host.locator("#online-open").click();
  await host.locator("#coop-client").waitFor({ state: "visible" });
  await host.locator(".coop-create").click();
  await host.waitForFunction(() => document.querySelector(".coop-invite-code")?.textContent === "AB12CD34");

  await guest.goto(baseURL, { waitUntil: "domcontentloaded" });
  if (await guest.locator("#intro-screen").isVisible()) await guest.locator("#intro-continue").click();
  await guest.locator("#online-open").click();
  await guest.locator("#coop-client").waitFor({ state: "visible" });
  await guest.locator(".coop-code").fill("ab12cd34");
  await guest.locator(".coop-join").click();
  await guest.waitForFunction(() => document.querySelector(".coop-invite-code")?.textContent === "AB12CD34");
  await waitFor(() => Boolean(state.room?.guest_user_id));
  await host.waitForFunction(() => !document.querySelector(".coop-start")?.hidden);
  await guest.waitForFunction(() => !document.querySelector(".coop-start")?.hidden);

  state.failNextTickUser = "pilot-a";
  await host.locator(".coop-start").click();
  await guest.locator(".coop-start").click();
  await host.locator(".coop-arena").waitFor({ state: "visible" });
  await guest.locator(".coop-arena").waitFor({ state: "visible" });
  await waitFor(() => state.startedUsers.size === 2 && Boolean(state.inputs["pilot-b"]));
  await host.keyboard.down("ArrowRight");
  await waitFor(() => state.inputs["pilot-a"]?.dx === 1);
  await host.keyboard.up("ArrowRight");

  const touchRight = guest.locator('[data-coop-key="d"]');
  await touchRight.dispatchEvent("pointerdown", { pointerType: "touch" });
  await waitFor(() => state.inputs["pilot-b"]?.dx === 1);
  await touchRight.dispatchEvent("pointerup", { pointerType: "touch" });

  await host.reload({ waitUntil: "domcontentloaded" });
  await host.locator("#online-open").click();
  await host.waitForFunction(() => document.querySelector(".coop-invite-code")?.textContent === "AB12CD34");
  await host.waitForFunction(() => !document.querySelector(".coop-start")?.hidden);
  await host.locator(".coop-start").click();
  await host.locator(".coop-arena").waitFor({ state: "visible" });
  await host.locator(".coop-leave").click();
  assert.equal(await host.evaluate(() => localStorage.getItem("taviro-coop-room-id")), null);
  assert.deepEqual(errors, []);

  console.log(JSON.stringify({
    simulatedAccounts: 2,
    inviteCreateJoin: "passed",
    serverMatchStart: "passed",
    keyboardInput: "passed",
    touchInput: "passed",
    transientDisconnectRetry: "passed",
    reloadReconnect: "passed",
    errors
  }, null, 2));
} finally {
  await Promise.all(contexts.map(context => context.close()));
  await browser.close();
}
