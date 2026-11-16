const ACHIEVEMENT_DEFINITIONS = [
  { id:"first-signal", name:"FIRST SIGNAL", description:"Survive for 30 seconds.", reward:1, check:g=>g.elapsed>=30 },
  { id:"scavenger", name:"VOID SCAVENGER", description:"Collect 180 scrap in one run.", reward:2, check:g=>g.scrapCollected>=180 },
  { id:"storm-veteran", name:"STORM VETERAN", description:"Eliminate 12 enemies during storms in one run.", reward:2, check:g=>g.stormKills>=12 },
  { id:"elite-breaker", name:"ELITE BREAKER", description:"Defeat an Elite boss.", reward:3, check:g=>g.bossesDefeated>=1 },
  { id:"void-walker", name:"VOID WALKER", description:"Survive for 180 seconds.", reward:3, check:g=>g.elapsed>=180 },
  { id:"combo-architect", name:"COMBO ARCHITECT", description:"Reach a 20-kill combo.", reward:2, check:g=>(g.combo?.max||0)>=20 }
];
const COPY = {
 en: [["FIRST SIGNAL","Survive for 30 seconds."],["VOID SCAVENGER","Collect 180 scrap in one run."],["STORM VETERAN","Eliminate 12 enemies during storms in one run."],["ELITE BREAKER","Defeat an Elite boss."],["VOID WALKER","Survive for 180 seconds."],["COMBO ARCHITECT","Reach a 20-kill combo."]],
 tr: [["İLK SİNYAL","30 saniye hayatta kal."],["BOŞLUK HURDACISI","Tek oyunda 180 hurda topla."],["FIRTINA GAZİSİ","Tek oyunda fırtına sırasında 12 düşman yok et."],["ELİT AVCISI","Bir Elit patronu yen."],["BOŞLUK YOLCUSU","180 saniye hayatta kal."],["KOMBO MİMARI","20 düşmanlık kombo serisine ulaş."]],
 "pt-BR": [["PRIMEIRO SINAL","Sobreviva por 30 segundos."],["CATADOR DO VAZIO","Colete 180 sucatas em uma partida."],["VETERANO DA TEMPESTADE","Elimine 12 inimigos durante tempestades em uma partida."],["QUEBRA-ELITE","Derrote um chefe Elite."],["VIAJANTE DO VAZIO","Sobreviva por 180 segundos."],["ARQUITETO DE COMBOS","Alcance um combo de 20 eliminações."]],
 es: [["PRIMERA SEÑAL","Sobrevive 30 segundos."],["CHATARRERO DEL VACÍO","Recoge 180 unidades de chatarra en una partida."],["VETERANO DE LA TORMENTA","Elimina a 12 enemigos durante tormentas en una partida."],["ROMPEÉLITES","Derrota a un jefe Élite."],["VIAJERO DEL VACÍO","Sobrevive 180 segundos."],["ARQUITECTO DE COMBOS","Alcanza un combo de 20 eliminaciones."]],
 ru: [["ПЕРВЫЙ СИГНАЛ","Выживите в течение 30 секунд."],["СБОРЩИК ПУСТОТЫ","Соберите 180 единиц лома за один забег."],["ВЕТЕРАН ШТОРМА","Уничтожьте 12 врагов во время шторма за один забег."],["ПОБЕДИТЕЛЬ ЭЛИТЫ","Победите босса элитного класса."],["ПУТНИК ПУСТОТЫ","Выживите в течение 180 секунд."],["АРХИТЕКТОР КОМБО","Достигните серии из 20 устранений."]],
 id: [["SINYA PERTAMA","Bertahan selama 30 detik."],["PEMULUNG KEHAMPAAN","Kumpulkan 180 rongsokan dalam satu permainan."],["VETERAN BADAI","Kalahkan 12 musuh saat badai dalam satu permainan."],["PENAKLUK ELIT","Kalahkan bos Elite."],["PENJELAJAH KEHAMPAAN","Bertahan selama 180 detik."],["ARSITEK KOMBO","Capai kombo 20 eliminasi."]],
 de: [["ERSTES SIGNAL","Überlebe 30 Sekunden."],["SCHROTTSAMMLER","Sammle 180 Schrott in einem Lauf."],["STURMVETERAN","Besiege 12 Gegner während eines Sturms in einem Lauf."],["ELITEBRECHER","Besiege einen Elite-Boss."],["LEEREWANDERER","Überlebe 180 Sekunden."],["KOMBOARCHITEKT","Erreiche eine 20er-Abschussserie."]],
 fr: [["PREMIER SIGNAL","Survivez pendant 30 secondes."],["RÉCUPÉRATEUR DU VIDE","Collectez 180 ferrailles en une partie."],["VÉTÉRAN DE LA TEMPÊTE","Éliminez 12 ennemis pendant les tempêtes en une partie."],["BRISEUR D'ÉLITE","Vainquez un boss Élite."],["VOYAGEUR DU VIDE","Survivez pendant 180 secondes."],["ARCHITECTE DE COMBOS","Atteignez un combo de 20 éliminations."]],
 ja: [["最初のシグナル","30秒間生き残りましょう。"],["虚空の回収者","1回のプレイでスクラップを180個集めましょう。"],["嵐のベテラン","1回のプレイで嵐の最中に敵を12体倒しましょう。"],["エリートブレイカー","エリートボスを倒しましょう。"],["虚空の旅人","180秒間生き残りましょう。"],["コンボアーキテクト","20連続撃破を達成しましょう。"]]
};
export const ACHIEVEMENTS = ACHIEVEMENT_DEFINITIONS;
export function getAchievementCopy(achievement, language="en") {
  const index=ACHIEVEMENT_DEFINITIONS.findIndex(item=>item.id===achievement?.id);
  const rows=COPY[language]||COPY.en;
  if(index<0)return {name:achievement?.name||"",description:achievement?.description||""};
  return {name:rows[index][0],description:rows[index][1]};
}
export function awardAchievements(game,profile){
  const known=new Set(Array.isArray(profile.achievements)?profile.achievements:[]),unlocked=[];
  for(const achievement of ACHIEVEMENTS){if(!known.has(achievement.id)&&achievement.check(game)){known.add(achievement.id);unlocked.push(achievement)}}
  profile.achievements=[...known];
  return {unlocked,reward:unlocked.reduce((sum,a)=>sum+a.reward,0),total:known.size};
}
