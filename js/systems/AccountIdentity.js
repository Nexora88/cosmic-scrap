const TURKISH_LATIN = { "ı":"i", "İ":"I", "ş":"s", "Ş":"S", "ğ":"g", "Ğ":"G", "ü":"u", "Ü":"U", "ö":"o", "Ö":"O", "ç":"c", "Ç":"C" };

export function normalizePilotName(value) {
  return String(value ?? "")
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, character => TURKISH_LATIN[character] || character)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 20);
}
