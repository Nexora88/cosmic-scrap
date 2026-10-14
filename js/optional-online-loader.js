const accountButton = document.getElementById("account-open");
const onlineButton = document.getElementById("online-open");
let accountLoad = null;
let onlineLoad = null;
function loadAccount() {
  if (!accountLoad) accountLoad = import("./cloud-account.js");
  return accountLoad;
}
function loadOnline() {
  if (!onlineLoad) onlineLoad = import("./online-hub.js");
  return onlineLoad;
}
accountButton.addEventListener("click", async () => {
  try {
    await loadAccount();
    await loadOnline();
    window.dispatchEvent(new Event("cosmic-scrap:open-account"));
  } catch {
    const status = document.getElementById("account-status");
    document.getElementById("account-screen").hidden = false;
    status.textContent = "Account service could not load. Offline play and this browser's save are still available.";
    status.dataset.state = "error";
  }
});
onlineButton.addEventListener("click", async () => {
  try {
    await loadOnline();
    window.dispatchEvent(new Event("cosmic-scrap:open-online"));
  } catch {
    const panel = document.getElementById("online-screen");
    const status = document.getElementById("online-status");
    panel.hidden = false;
    status.textContent = "Online services could not load. Offline play and this browser's save are still available.";
    status.dataset.state = "error";
  }
});
window.addEventListener("cosmic-scrap:request-account", async () => {
  try {
    await loadAccount();
    await loadOnline();
    window.dispatchEvent(new Event("cosmic-scrap:open-account"));
  } catch {
    const screen = document.getElementById("account-screen");
    const status = document.getElementById("account-status");
    screen.hidden = false;
    status.textContent = "Account service could not load. Offline play and this browser's save are still available.";
    status.dataset.state = "error";
  }
});
