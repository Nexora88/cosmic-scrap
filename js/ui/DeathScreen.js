import {translateText} from "../language.js";
export class DeathScreen{
 constructor(){this.root=document.getElementById("death-screen")}
 show(g,isBest,previousBest=0,coreEarned=0,bankedCore=0,achievements=[]){
  const gap=Math.max(0,previousBest-g.score),ctx=g.deathContext||{};
  const cause=translateText(ctx.reason==="danger-zone"?"The shrinking danger zone caught you.":ctx.reason==="enemy-contact"?"An enemy reached your core.":ctx.reason==="ranged-hit"?"Ranged fire overwhelmed your core.":ctx.reason==="exploder-blast"?"An explosive enemy detonated too close.":ctx.reason==="contract-complete"?"MISSION COMPLETE · ELITE TARGET ELIMINATED.":"Run ended.");
  const causeClass=ctx.reason==="danger-zone"?"danger":ctx.reason==="contract-complete"?"mission":"enemy";
  const stats=[
   ["SCORE",g.score],["SURVIVED",Math.floor(g.elapsed)+"s"],["ELIMINATED",g.kills],["LEVEL",g.level],
   ["SCRAP COLLECTED",g.scrapCollected],["CORE EARNED","+"+coreEarned],["BANKED SCRAP CORE",bankedCore],
   ["RUN DIRECTIVE",g.contract?translateText(g.contract.name):translateText("NONE")],
   ["DIRECTIVE RESULT",translateText(g.contractComplete?"COMPLETE":"NOT COMPLETE")],
   ["DIRECTIVE BONUS",g.contractComplete?"+"+g.contract.reward+" CORE":"0 CORE"],
   ["MAX COMBO",g.combo.max],["CORE LEFT",ctx.healthLeft??0],
   ["CLOSEST THREAT",ctx.nearestEnemy==null?translateText("No nearby enemy"):ctx.nearestEnemy+" px"],
   ["SAFE-ZONE MARGIN",ctx.edgeGap==null?"—":ctx.edgeGap+" px"]
  ];
  const recordMarkup=isBest
   ?`<div class="run-stat record-gap"><small>${translateText("RECORD")}</small><strong>${translateText("NEW BEST")}</strong></div>`
   :previousBest>0
    ?`<div class="run-stat record-gap"><small>${translateText("PREVIOUS RECORD · GAP")}</small><strong>${gap.toLocaleString()} ${translateText("points to beat")}</strong></div>`
    :`<div class="run-stat record-gap"><small>${translateText("RECORD TARGET")}</small><strong>${translateText("Set your first best!")}</strong></div>`;
  const statsMarkup=stats.map(([key,value])=>`<div class="run-stat"><small>${translateText(key)}</small><strong>${value}</strong></div>`).join("");
  const root=document.getElementById("run-stats");
  root.innerHTML=`<div class="death-insight ${causeClass}"><small>${translateText("RUN ENDED · DIAGNOSIS")}</small><strong>${cause}</strong></div>${statsMarkup}${recordMarkup}`;
  const note=document.createElement("p");note.className="guide-footnote death-bank-note";note.textContent=translateText("Your run scrap is converted to permanent Scrap Core. The banked total survives this run ending and is saved locally in this browser.");root.append(note);
  if(achievements.length){
   const section=document.createElement("section");section.className="achievement-unlocks";const title=document.createElement("strong");title.textContent=translateText("✦ CAREER ACHIEVEMENTS UNLOCKED");section.append(title);
   achievements.forEach(a=>{const row=document.createElement("div");row.className="achievement-unlock";const copy=document.createElement("span");copy.innerHTML="<b>"+a.name+"</b><small>"+a.description+"</small>";const reward=document.createElement("strong");reward.textContent="+"+a.reward+" CORE";row.append(copy,reward);section.append(row)});
   root.append(section);
  }
  this.root.hidden=false;
 }
 hide(){this.root.hidden=true}
}
