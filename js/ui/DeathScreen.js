export class DeathScreen{
 constructor(){this.root=document.getElementById("death-screen")}
 show(g,isBest,previousBest=0,coreEarned=0,bankedCore=0){
  const gap=Math.max(0,previousBest-g.score),ctx=g.deathContext||{},cause=ctx.reason==="danger-zone"?"The shrinking danger zone caught you.":ctx.reason==="enemy-contact"?"An enemy reached your core.":ctx.reason==="ranged-hit"?"Ranged fire overwhelmed your core.":ctx.reason==="exploder-blast"?"An explosive enemy detonated too close.":"Run ended.";
  const causeClass=ctx.reason==="danger-zone"?"danger":"enemy";
  document.getElementById("run-stats").innerHTML='<div class="death-insight '+causeClass+'"><small>RUN ENDED · DIAGNOSIS</small><strong>'+cause+'</strong></div>'+
  [[ "SCORE",g.score ],[ "SURVIVED",Math.floor(g.elapsed)+"s" ],[ "ELIMINATED",g.kills ],[ "LEVEL",g.level ],[ "SCRAP COLLECTED",g.scrapCollected ],[ "CORE EARNED", "+"+coreEarned ],[ "BANKED SCRAP CORE", bankedCore ],[ "MAX COMBO",g.combo.max ],[ "CORE LEFT",ctx.healthLeft??0 ],[ "CLOSEST THREAT",ctx.nearestEnemy==null?"No nearby enemy":ctx.nearestEnemy+" px" ],[ "SAFE-ZONE MARGIN",ctx.edgeGap==null?"—":ctx.edgeGap+" px" ]].map(([k,v])=>'<div class="run-stat"><small>'+k+'</small><strong>'+v+'</strong></div>').join("")+
  (isBest?'<div class="run-stat record-gap"><small>RECORD</small><strong>NEW BEST</strong></div>':previousBest>0?'<div class="run-stat record-gap"><small>PREVIOUS RECORD · GAP</small><strong>'+gap.toLocaleString()+" points to beat</strong></div>":'<div class="run-stat record-gap"><small>RECORD TARGET</small><strong>Set your first best!</strong></div>');
  const note=document.createElement("p");note.className="guide-footnote death-bank-note";note.textContent="Your run scrap is converted to permanent Scrap Core. The banked total survives this run ending and is saved locally in this browser.";document.getElementById("run-stats").append(note);
  this.root.hidden=false;
 }
 hide(){this.root.hidden=true}
}