import { PROFILE_TRANSLATIONS, PROFILE_LOCALES, PROFILE_NAMES } from "./js/profile-translations.js";

const language = () => {
  const saved = localStorage.getItem("cosmic-scrap-language") || "en";
  return PROFILE_LOCALES.includes(saved) ? saved : "en";
};
const localized = (source, locale) => PROFILE_TRANSLATIONS[locale]?.[source] || source;

function setLanguage(locale) {
  if (!PROFILE_LOCALES.includes(locale)) locale = "en";
  localStorage.setItem("cosmic-scrap-language", locale);
  document.documentElement.lang = locale;
  document.querySelectorAll("[data-en-content]").forEach(element => element.setAttribute("content", localized(element.dataset.enContent, locale)));
  document.querySelectorAll("[data-en]").forEach(element => {
    if (element.matches("input,textarea")) return;
    const source = element.dataset.en || element.textContent;
    const value = localized(source, locale);
    element.textContent = element.matches("option") && element.dataset.level
      ? value + " · " + localized("LEVEL", locale) + " " + element.dataset.level
      : value;
  });
  const toggle = document.getElementById("language-toggle");
  if (toggle) {
    toggle.textContent = (PROFILE_NAMES[locale] || locale) + " ↻";
    toggle.setAttribute("aria-label", "Language: " + (PROFILE_NAMES[locale] || locale));
  }
  const username = document.getElementById("username");
  if (username) username.placeholder = localized("Choose a pilot name", locale);
  window.dispatchEvent(new CustomEvent("cosmic-scrap:language-changed", { detail: { language: locale } }));
}
window.TAVIROProfileI18n = { setLanguage, localized, language };
document.getElementById("language-toggle")?.addEventListener("click", () => {
  const current = language();
  setLanguage(PROFILE_LOCALES[(PROFILE_LOCALES.indexOf(current) + 1) % PROFILE_LOCALES.length]);
});
setLanguage(language());
