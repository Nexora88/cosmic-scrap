export const REGIONS = [
  { id:"debris", name:{en:"DEBRIS BELT",tr:"ENKAZ KUŞAĞI"}, hint:{en:"Keep moving. Learn the drift.",tr:"Hareket et. Akışı öğren."}, tint:[22,48,72], star:"#b7eaff", accent:"#40cfff", specialEnemy:"fast" },
  { id:"ember", name:{en:"EMBER NEBULA",tr:"KOR BULUTSUSU"}, hint:{en:"Fast threats cross your path.",tr:"Hızlı tehditlere dikkat et."}, tint:[82,28,38], star:"#ffb0a0", accent:"#ff795f", specialEnemy:"charger" },
  { id:"cryo", name:{en:"CRYO EXPANSE",tr:"BUZUL BOŞLUĞU"}, hint:{en:"Watch for long-range shots.",tr:"Uzun menzilli atışlara dikkat."}, tint:[24,62,88], star:"#a9efff", accent:"#70dcff", specialEnemy:"sniper" },
  { id:"rift", name:{en:"RIFT FIELDS",tr:"YARIK ALANLARI"}, hint:{en:"Unstable enemies move in groups.",tr:"Dengesiz düşmanlar gruplar hâlinde."}, tint:[62,34,86], star:"#d4a8ff", accent:"#bd82ff", specialEnemy:"prism" },
  { id:"starforge", name:{en:"STARFORGE",tr:"YILDIZ OCAĞI"}, hint:{en:"The final sector. Stay sharp.",tr:"Son bölge. Dikkatini koru."}, tint:[82,48,24], star:"#ffd18a", accent:"#ffb347", specialEnemy:"leech" }
];

export function getRegion(elapsed,bossesDefeated){
  const unlocked=Math.min(REGIONS.length-1,Math.floor(Math.max(0,elapsed)/210),Math.max(0,bossesDefeated|0));
  return REGIONS[unlocked];
}

export function regionIndex(region){
  return Math.max(0,REGIONS.findIndex(item=>item.id===region?.id));
}
