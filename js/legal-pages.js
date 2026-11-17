import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "./legal-translations.js";
const names={en:"English",tr:"Türkçe","pt-BR":"Português (Brasil)",es:"Español",ru:"Русский",id:"Bahasa Indonesia",de:"Deutsch",fr:"Français",ja:"日本語"};
const select=document.getElementById("legal-language");
const stored=(()=>{try{return localStorage.getItem("cosmic-scrap-language")}catch{return null}})();
function applyLocale(locale){
 const code=LEGAL_LOCALES.includes(locale)?locale:"en",dict=LEGAL_TRANSLATIONS[code]||LEGAL_TRANSLATIONS.en;
 document.documentElement.lang=code;
 for(const el of document.querySelectorAll("[data-i18n]")){const key=el.dataset.i18n;el.textContent=dict[key]||LEGAL_TRANSLATIONS.en[key]||key}
 const privacy=document.body.dataset.pageTitle==="TAVIRO · Privacy";
 const titles={en:privacy?"Privacy":"Support",tr:privacy?"Gizlilik":"Destek","pt-BR":privacy?"Privacidade":"Suporte",es:privacy?"Privacidad":"Soporte",ru:privacy?"Конфиденциальность":"Поддержка",id:privacy?"Privasi":"Dukungan",de:privacy?"Datenschutz":"Support",fr:privacy?"Confidentialité":"Assistance",ja:privacy?"プライバシー":"サポート"};
 document.title="TAVIRO · "+titles[code];
 const meta=document.querySelector('meta[name="description"]'),intro=document.querySelector(".legal-hero p");
 if(meta&&intro)meta.content=intro.textContent;
 if(select&&select.value!==code)select.value=code;
}
for(const code of LEGAL_LOCALES){const option=document.createElement("option");option.value=code;option.textContent=names[code];select.append(option)}
select.addEventListener("change",()=>{try{localStorage.setItem("cosmic-scrap-language",select.value)}catch{}applyLocale(select.value);window.dispatchEvent(new CustomEvent("cosmic-scrap:language-changed",{detail:{language:select.value}}))});
applyLocale(stored||"en");
