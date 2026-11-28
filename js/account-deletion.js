import { forgetAccountStorage } from "./systems/AccountScopedStorage.js";

export function initAccountDeletion({ supabase, signedIn, setStatus, translateText }) {
  if (!supabase || !signedIn) return;
  const section = document.createElement("section");
  section.className = "account-delete-section";
  section.innerHTML = `
    <h3></h3>
    <p class="micro"></p>
    <button type="button" class="text-button account-delete-open"></button>
    <form class="account-delete-confirm" hidden>
      <label class="account-field account-delete-password-label"></label>
      <input class="account-delete-password" type="password" autocomplete="current-password" required maxlength="128">
      <label class="account-field account-delete-word-label"></label>
      <input class="account-delete-word" type="text" autocomplete="off" required maxlength="6">
      <button type="submit" class="danger-button account-delete-submit"></button>
      <button type="button" class="text-button account-delete-cancel"></button>
    </form>`;
  signedIn.append(section);
  const $ = selector => section.querySelector(selector);
  $("h3").textContent = translateText("DELETE ACCOUNT");
  $("p").textContent = translateText("This permanently removes your profile, cloud save, inventory, social links and account identity. This cannot be undone.");
  $(".account-delete-open").textContent = translateText("DELETE MY ACCOUNT");
  $(".account-delete-password-label").textContent = translateText("CONFIRM YOUR PASSWORD");
  $(".account-delete-word-label").textContent = translateText("TYPE DELETE TO CONFIRM");
  $(".account-delete-submit").textContent = translateText("PERMANENTLY DELETE ACCOUNT");
  $(".account-delete-cancel").textContent = translateText("CANCEL");
  $(".account-delete-open").addEventListener("click", () => {
    $(".account-delete-confirm").hidden = false;
    $(".account-delete-password").focus();
  });
  $(".account-delete-cancel").addEventListener("click", () => {
    $(".account-delete-confirm").reset();
    $(".account-delete-confirm").hidden = true;
  });
  $(".account-delete-confirm").addEventListener("submit", async event => {
    event.preventDefault();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (sessionError || !user?.email) {
      setStatus(translateText("Sign in again before deleting this account."), true);
      return;
    }
    if ($(".account-delete-word").value.trim() !== "DELETE") {
      setStatus(translateText("Type DELETE exactly to confirm account removal."), true);
      return;
    }
    const submit = $(".account-delete-submit");
    submit.disabled = true;
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: $(".account-delete-password").value
      });
      if (reauthError) throw new Error(translateText("Password confirmation failed. Your account was not deleted."));
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      if (error) throw error;
      if (!data?.deleted) throw new Error(translateText("The server did not confirm account deletion."));
      forgetAccountStorage(user.id);
      await supabase.auth.signOut({ scope: "local" });
      section.remove();
      setStatus(translateText("Account and associated cloud data deleted."));
      window.dispatchEvent(new Event("cosmic-scrap:account-deleted"));
    } catch (error) {
      setStatus(error.message || translateText("Account deletion failed. No success was reported."), true);
    } finally {
      submit.disabled = false;
    }
  });
}
