export const REGIONS = [
  { id:"debris", name:{en:"DEBRIS BELT",tr:"ENKAZ KUŞAĞI","pt-BR":"CINTURÃO DE DETRITOS"}, hint:{en:"Keep moving. Learn the drift.",tr:"Hareket et. Akışı öğren."}, tint:[22,48,72], star:"#b7eaff", accent:"#40cfff", specialEnemy:"fast" },
  { id:"ember", name:{en:"EMBER NEBULA",tr:"KOR BULUTSUSU","pt-BR":"NEBULOSA DE BRASAS"}, hint:{en:"Fast threats cross your path.",tr:"Hızlı tehditlere dikkat et."}, tint:[82,28,38], star:"#ffb0a0", accent:"#ff795f", specialEnemy:"charger" },
  { id:"cryo", name:{en:"CRYO EXPANSE",tr:"BUZUL BOŞLUĞU","pt-BR":"EXPANSÃO CRIOGÊNICA"}, hint:{en:"Watch for long-range shots.",tr:"Uzun menzilli atışlara dikkat."}, tint:[24,62,88], star:"#a9efff", accent:"#70dcff", specialEnemy:"sniper" },
  { id:"rift", name:{en:"RIFT FIELDS",tr:"YARIK ALANLARI","pt-BR":"CAMPOS DE FENDA"}, hint:{en:"Unstable enemies move in groups.",tr:"Dengesiz düşmanlar gruplar hâlinde."}, tint:[62,34,86], star:"#d4a8ff", accent:"#bd82ff", specialEnemy:"prism" },
  { id:"starforge", name:{en:"STARFORGE",tr:"YILDIZ OCAĞI","pt-BR":"FORJA ESTELAR"}, hint:{en:"Hold steady through the final forge.",tr:"Son ocakta dengeni koru."}, tint:[82,48,24], star:"#ffd18a", accent:"#ffb347", specialEnemy:"leech" },
  { id:"nova", name:{en:"NOVA REACH",tr:"NOVA SINIRI","pt-BR":"FRONTEIRA NOVA"}, hint:{en:"A brighter frontier. Keep your rhythm.",tr:"Daha parlak bir sınır. Ritmini koru."}, tint:[52,38,86], star:"#e8c8ff", accent:"#d08cff", specialEnemy:"phaseStalker" },
  { id:"eclipse", name:{en:"ECLIPSE VEIL",tr:"TUTULMA ÖRTÜSÜ","pt-BR":"VÉU DO ECLIPSE"}, hint:{en:"The last frontier rewards calm movement.",tr:"Son sınırda sakin hareket avantaj sağlar."}, tint:[30,38,66], star:"#b8c8ff", accent:"#8da7ff", specialEnemy:"prism" }
];

export function getGalaxyProgress(elapsed,bossesDefeated){
  const cleared=Math.min(Math.floor(Math.max(0,elapsed)/210),Math.max(0,bossesDefeated|0));
  return {cleared,galaxy:Math.floor(cleared/REGIONS.length)+1,sector:cleared%REGIONS.length+1,cycle:Math.floor(cleared/REGIONS.length)};
}
export function getRegion(elapsed,bossesDefeated){
  const progress=getGalaxyProgress(elapsed,bossesDefeated);
  return {...REGIONS[progress.sector-1],galaxy:progress.galaxy,sector:progress.sector,cycle:progress.cycle};
}

export function regionIndex(region){
  return Math.max(0,REGIONS.findIndex(item=>item.id===region?.id));
}
