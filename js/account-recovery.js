export function validateNewPassword(password, confirmation) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return "Password must be between 8 and 128 characters.";
  }
  if (password !== confirmation) return "Passwords do not match.";
  return "";
}

export function accountAuthRedirectUrl(locationHref) {
  const url = new URL("./", locationHref);
  url.hash = "";
  url.search = "";
  return url.href;
}

export function initAccountRecovery({ supabase, accountPanel, signedOut, signedIn, authForm, setStatus, translateText }) {
  if (!supabase || !accountPanel || !signedOut || !authForm) return;

  const modeActions = signedOut.querySelector(".account-actions");
  const emailInput = document.getElementById("account-auth-email");
  const loginMode = document.getElementById("account-auth-mode");
  const forgotButton = document.createElement("button");
  forgotButton.type = "button";
  forgotButton.className = "text-button account-recovery-link";
  forgotButton.textContent = translateText("FORGOT PASSWORD?");
  forgotButton.setAttribute("aria-controls", "account-recovery-panel");
  authForm.append(forgotButton);

  const recoveryPanel = document.createElement("section");
  recoveryPanel.id = "account-recovery-panel";
  recoveryPanel.className = "account-recovery-panel";
  recoveryPanel.hidden = true;
  recoveryPanel.innerHTML = `
    <h3 class="account-recovery-title"></h3>
    <p class="micro account-recovery-copy"></p>
    <form class="account-recovery-request">
      <label class="account-field account-recovery-email-label"></label>
      <button class="primary-button account-recovery-send" type="submit"></button>
    </form>
    <form class="account-recovery-update" hidden>
      <label class="account-field account-recovery-new-label"></label>
      <input class="account-recovery-new" type="password" autocomplete="new-password" minlength="8" maxlength="128" required>
      <label class="account-field account-recovery-confirm-label"></label>
      <input class="account-recovery-confirm" type="password" autocomplete="new-password" minlength="8" maxlength="128" required>
      <button class="primary-button account-recovery-save" type="submit"></button>
    </form>
    <button class="text-button account-recovery-back" type="button"></button>
  `;
  const accountContent = accountPanel.querySelector(".account-panel") || accountPanel;
  accountContent.append(recoveryPanel);
  accountContent.classList.add("account-recovery-ready");
  const recoveryStyles = document.createElement("style");
  recoveryStyles.textContent = ".account-panel.account-recovering #account-signed-in,.account-panel.account-recovering #account-signed-out{display:none!important}.account-panel .account-recovery-panel{margin-top:1rem;padding:1rem;border:1px solid rgba(100,220,255,.22);border-radius:14px;background:rgba(5,12,24,.96)}.account-panel .account-recovery-panel[hidden]{display:none!important}.account-panel .account-recovery-panel input{width:100%;box-sizing:border-box;margin-top:.45rem}.account-panel .account-recovery-link{display:block;margin:.5rem auto}";
  document.head.append(recoveryStyles);

  const $ = (selector) => recoveryPanel.querySelector(selector);
  $(".account-recovery-title").textContent = translateText("ACCOUNT RECOVERY");
  $(".account-recovery-copy").textContent = translateText("Enter your account email. We will send a secure password-reset link if the address is eligible.");
  $(".account-recovery-email-label").textContent = translateText("EMAIL");
  $(".account-recovery-email-label").append(emailInput.cloneNode());
  $(".account-recovery-email-label input").id = "";
  $(".account-recovery-email-label input").className = "account-recovery-email";
  $(".account-recovery-email-label input").type = "email";
  $(".account-recovery-email-label input").required = true;
  $(".account-recovery-email-label input").maxLength = 254;
  $(".account-recovery-email-label input").autocomplete = "email";
  $(".account-recovery-send").textContent = translateText("SEND RESET LINK");
  $(".account-recovery-new-label").textContent = translateText("NEW PASSWORD");
  $(".account-recovery-new-label").append($(".account-recovery-new"));
  $(".account-recovery-confirm-label").textContent = translateText("CONFIRM NEW PASSWORD");
  $(".account-recovery-confirm-label").append($(".account-recovery-confirm"));
  $(".account-recovery-save").textContent = translateText("SAVE NEW PASSWORD");
  $(".account-recovery-back").textContent = translateText("BACK TO SIGN IN");

  let recoveryActive = false;
  const setRecoveryMode = (active) => {
    recoveryActive = active;
    authForm.hidden = active;
    if (modeActions) modeActions.hidden = active;
    recoveryPanel.hidden = !active;
    accountContent.classList.toggle("account-recovering", active);
    forgotButton.hidden = active || loginMode?.value !== "login";
    if (active) accountPanel.hidden = false;
  };

  forgotButton.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const recoveryEmail = $(".account-recovery-email");
    recoveryEmail.value = email;
    setRecoveryMode(true);
    $(".account-recovery-request").hidden = false;
    $(".account-recovery-update").hidden = true;
    recoveryEmail.focus();
  });

  document.getElementById("account-mode-signup")?.addEventListener("click", () => {
    forgotButton.hidden = true;
  });
  document.getElementById("account-mode-login")?.addEventListener("click", () => {
    forgotButton.hidden = false;
  });

  $(".account-recovery-back").addEventListener("click", () => {
    setRecoveryMode(false);
    setStatus(translateText("Sign in to load your saved online profile."));
  });

  $(".account-recovery-request").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $(".account-recovery-email").value.trim();
    if (!email || !$(".account-recovery-email").reportValidity()) return;
    const send = $(".account-recovery-send");
    send.disabled = true;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: accountAuthRedirectUrl(window.location.href)
      });
      if (error) throw error;
      setStatus(translateText("If an account can receive a reset email, a secure link has been sent. Check your inbox and spam folder."));
      $(".account-recovery-copy").textContent = translateText("Open the link from the same browser or device, then choose a new password here.");
    } catch (error) {
      const code = String(error?.code || error?.message || "").toLowerCase();
      setStatus(code.includes("rate") ? translateText("Too many requests. Wait a little before trying again.") : translateText("The reset request could not be sent. Check your connection and try again."), true);
    } finally {
      send.disabled = false;
    }
  });

  $(".account-recovery-update").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = $(".account-recovery-new").value;
    const confirmation = $(".account-recovery-confirm").value;
    const validation = validateNewPassword(password, confirmation);
    if (validation) {
      setStatus(translateText(validation), true);
      return;
    }
    const save = $(".account-recovery-save");
    save.disabled = true;
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      $(".account-recovery-new").value = "";
      $(".account-recovery-confirm").value = "";
      setRecoveryMode(false);
      setStatus(translateText("Password updated. Your account is ready to use."));

    } catch (error) {
      setStatus(error.message || translateText("The password could not be updated. Request a new reset link and try again."), true);
    } finally {
      save.disabled = false;
    }
  });

  supabase.auth.onAuthStateChange((event) => {
    if (event !== "PASSWORD_RECOVERY") return;
    setRecoveryMode(true);
    $(".account-recovery-request").hidden = true;
    $(".account-recovery-update").hidden = false;
    $(".account-recovery-copy").textContent = translateText("Your reset link is verified. Choose a new password for your pilot account.");
    setStatus(translateText("Password reset link verified. Enter a new password."));
    $(".account-recovery-new").focus();
  });

  forgotButton.hidden = loginMode?.value !== "login";
}
