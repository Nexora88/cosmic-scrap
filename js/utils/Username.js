export function normalizeUsername(value) {
  const transliterated = String(value || "").replace(/[ıİşŞğĞçÇöÖüÜ]/g, ch => ({
    "ı":"i", "İ":"I", "ş":"s", "Ş":"S", "ğ":"g", "Ğ":"G",
    "ç":"c", "Ç":"C", "ö":"o", "Ö":"O", "ü":"u", "Ü":"U"
  })[ch] || ch);
  return transliterated.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
    .slice(0, 20).replace(/_+$/g, "");
}
