export const REGION_REWARDS = [
  { id: "debris", flag: "🇺🇸", name: "United States" },
  { id: "ember", flag: "🇬🇧", name: "United Kingdom" },
  { id: "cryo", flag: "🇩🇪", name: "Germany" },
  { id: "rift", flag: "🇯🇵", name: "Japan" },
  { id: "starforge", flag: "🇧🇷", name: "Brazil" },
  { id: "nova", flag: "🇦🇺", name: "Australia" },
  { id: "eclipse", flag: "🇨🇦", name: "Canada" }
];

const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(" ");
const POPULAR_CODES = new Set("TR US GB DE JP BR FR IN CA AU IT ES PT NL KR CN MX AR".split(" "));
const REGION_MILESTONES = {
  US: { regions: 1, raids: 0 },
  GB: { regions: 2, raids: 0 },
  DE: { regions: 3, raids: 0 },
  JP: { regions: 4, raids: 0 },
  BR: { regions: 5, raids: 0 },
  AU: { regions: 6, raids: 0 },
  CA: { regions: 7, raids: 0 },
  FR: { regions: 0, raids: 2 },
  IN: { regions: 0, raids: 3 }
};
const SPECIAL_FLAGS = [
  { flag: "🏴‍☠️", label: "Pirate Fleet", price: 2400, rarity: "legendary" },
  { flag: "☠️", label: "Void Skull", price: 2800, rarity: "legendary" },
  { flag: "🌌", label: "Nebula", price: 1800, rarity: "rare" },
  { flag: "☄️", label: "Comet", price: 1900, rarity: "rare" },
  { flag: "👾", label: "Arcade Invader", price: 2200, rarity: "epic" },
  { flag: "🛸", label: "UFO Squadron", price: 2600, rarity: "epic" },
  { flag: "⚓", label: "Corsair", price: 2100, rarity: "rare" },
  { flag: "🐉", label: "Dragon Banner", price: 3200, rarity: "legendary" },
  { flag: "🦈", label: "Deep Space Raider", price: 2300, rarity: "epic" },
  { flag: "🚀", label: "Pioneer", price: 1700, rarity: "rare" },
  { flag: "🔱", label: "Trident Guard", price: 3000, rarity: "legendary" },
  { flag: "🌠", label: "Starfall", price: 2000, rarity: "rare" },
  { flag: "🔥", label: "Solar Raiders", price: 2500, rarity: "epic" },
  { flag: "🧭", label: "Explorer Guild", price: 1600, rarity: "rare" },
  { flag: "🏴", label: "Blackout", price: 3600, rarity: "mythic" },
  { flag: "🏳️", label: "Whiteout", price: 3600, rarity: "mythic" },
  { flag: "👽", label: "Alien Dominion", price: 4200, rarity: "mythic" },
  { flag: "👻", label: "Ghost Armada", price: 3900, rarity: "mythic" },
  { flag: "🕳️", label: "Black Hole", price: 3500, rarity: "epic" },
  { flag: "💎", label: "Crystal Guard", price: 3000, rarity: "legendary" },
  { flag: "🤖", label: "Cyber Fleet", price: 3300, rarity: "legendary" },
  { flag: "🌙", label: "Moon Raiders", price: 2400, rarity: "rare" },
  { flag: "👑", label: "Solar Crown", price: 4000, rarity: "mythic" },
  { flag: "⚡", label: "Storm Legion", price: 2700, rarity: "epic" },
  { flag: "🦑", label: "Deep Abyss", price: 3200, rarity: "legendary" },
  { flag: "🪽", label: "Phoenix Wing", price: 2900, rarity: "epic" },
  { flag: "🧿", label: "Astral Watch", price: 2600, rarity: "rare" }
];
const regionNames = (() => {
  try { return new Intl.DisplayNames(["en"], { type: "region" }); }
  catch { return null; }
})();
const regionNamesTR = (() => {
  try { return new Intl.DisplayNames(["tr"], { type: "region" }); }
  catch { return null; }
})();
const SPECIAL_LABELS_TR = {
  "Pirate Fleet": "Korsan Filosu", "Void Skull": "Boşluk Kafatası",
  "Nebula": "Bulutsu", "Comet": "Kuyruklu Yıldız", "Arcade Invader": "Atari İstilacısı",
  "UFO Squadron": "UFO Filosu", "Corsair": "Korsan", "Dragon Banner": "Ejderha Sancağı",
  "Deep Space Raider": "Derin Uzay Akıncısı", "Pioneer": "Öncü", "Trident Guard": "Üç Dişli Muhafız",
  "Starfall": "Yıldız Yağmuru", "Solar Raiders": "Güneş Akıncıları", "Explorer Guild": "Kaşifler Birliği",
  "Blackout": "Karanlık", "Whiteout": "Beyaz Fırtına",
  "Alien Dominion": "Uzaylı Hâkimiyeti", "Ghost Armada": "Hayalet Filosu",
  "Black Hole": "Kara Delik", "Crystal Guard": "Kristal Muhafızları",
  "Cyber Fleet": "Siber Filo", "Moon Raiders": "Ay Akıncıları",
  "Solar Crown": "Güneş Tacı", "Storm Legion": "Fırtına Lejyonu",
  "Deep Abyss": "Derin Uçurum", "Phoenix Wing": "Anka Kanadı",
  "Astral Watch": "Yıldız Gözcüleri"
};
const flagFromCode = code => String.fromCodePoint(...[...code].map(char => 127397 + char.charCodeAt(0)));
const milestoneByCode = code => REGION_MILESTONES[code] || { regions: 999, raids: 999 };
const countryFlags = COUNTRY_CODES.map((code, index) => {
  const milestone = milestoneByCode(code);
  const label = regionNames?.of(code) || code;
  const labelTR = regionNamesTR?.of(code) || label;
  const featured = POPULAR_CODES.has(code);
  const price = code === "TR" ? 0 : featured ? 120 + [...POPULAR_CODES].indexOf(code) * 35 : 520 + Math.min(850, index * 4);
  return {
    flag: flagFromCode(code),
    label,
    countryCode: code,
    regions: code === "TR" ? 0 : milestone.regions,
    raids: code === "TR" ? 0 : milestone.raids,
    category: featured ? "popular" : "countries",
    rarity: featured ? "common" : "uncommon",
    price
  };
});
export const FLAG_UNLOCKS = [
  ...countryFlags,
  ...SPECIAL_FLAGS.map(item => ({
    ...item,
    countryCode: null,
    regions: 999,
    raids: 999,
    category: "special"
  }))
];
export const FLAG_PRICES = Object.fromEntries(FLAG_UNLOCKS.map(item => [item.flag, item.price || 0]));

export function purchaseFlag(profile, flag) {
  const option = FLAG_UNLOCKS.find(item => item.flag === flag);
  if (!profile || !option) return { ok: false, reason: "invalid", cost: 0 };
  if (isFlagUnlocked(profile, flag)) return { ok: false, reason: "owned", cost: 0 };
  const cost = FLAG_PRICES[flag] ?? 500;
  const balance = Math.max(0, Number(profile.scrapCore) || 0);
  if (balance < cost) return { ok: false, reason: "funds", cost, balance };
  profile.scrapCore = balance - cost;
  profile.ownedFlags = [...new Set([...(Array.isArray(profile.ownedFlags) ? profile.ownedFlags : []), flag])];
  return { ok: true, reason: "purchased", cost, balance: profile.scrapCore };
}

export function captureRegion(profile, regionId) {
  if (!profile || !REGION_REWARDS.some(region => region.id === regionId)) return null;
  const captured = Array.isArray(profile.capturedRegions) ? profile.capturedRegions : [];
  if (captured.includes(regionId)) return null;
  profile.capturedRegions = [...captured, regionId];
  return REGION_REWARDS.find(region => region.id === regionId);
}

export function recordRaidWin(profile) {
  if (!profile) return 0;
  profile.raidWins = Math.max(0, Number(profile.raidWins) || 0) + 1;
  return profile.raidWins;
}

export function countryCodeForFlag(flag) {
  return FLAG_UNLOCKS.find(option => option.flag === flag)?.countryCode || "TR";
}

export function isFlagUnlocked(profile, flag) {
  const option = FLAG_UNLOCKS.find(item => item.flag === flag);
  if (!option) return false;
  return (Array.isArray(profile?.ownedFlags) && profile.ownedFlags.includes(flag))
    || ((Array.isArray(profile?.capturedRegions) ? profile.capturedRegions.length : 0) >= option.regions
    && (Number(profile?.raidWins) || 0) >= option.raids);
}

export const SKIN_PRICES = { blue: 0, mint: 350, violet: 700, amber: 1100, red: 1700, gold: 2400 };

export function purchaseSkin(profile, skin) {
  if (!profile || !(skin in SKIN_PRICES)) return { ok: false, reason: "invalid", cost: 0 };
  if (isSkinUnlocked(profile, skin)) return { ok: false, reason: "owned", cost: 0 };
  const cost = SKIN_PRICES[skin];
  const balance = Math.max(0, Number(profile.scrapCore) || 0);
  if (balance < cost) return { ok: false, reason: "funds", cost, balance };
  profile.scrapCore = balance - cost;
  profile.ownedSkins = [...new Set([...(Array.isArray(profile.ownedSkins) ? profile.ownedSkins : []), skin])];
  return { ok: true, reason: "purchased", cost, balance: profile.scrapCore };
}

export function isSkinUnlocked(profile, skin) {
  if (Array.isArray(profile?.ownedSkins) && profile.ownedSkins.includes(skin)) return true;
  const regions = Array.isArray(profile?.capturedRegions) ? profile.capturedRegions.length : 0;
  const raids = Math.max(0, Number(profile?.raidWins) || 0);
  if (skin === "red") return regions >= 3;
  if (skin === "gold") return raids >= 3;
  const required = { blue: 1, mint: 2, violet: 3, amber: 5 };
  return (Number(profile?.careerLevel) || 1) >= (required[skin] || 999);
}
