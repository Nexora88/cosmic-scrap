export class DeathScreen{
 constructor(){this.root=document.getElementById("death-screen")}
 show(g,isBest,previousBest=0){
  const gap=Math.max(0,previousBest-g.score);
  document.getElementById("run-stats").innerHTML=[[ "SCORE",g.score ],[ "SURVIVED",Math.floor(g.elapsed)+"s" ],[ "ELIMINATED",g.kills ],[ "LEVEL",g.level ],[ "SCRAP COLLECTED",g.scrapCollected ],[ "MAX COMBO",g.combo.max ]].map(([k,v])=>'<div class="run-stat"><small>'+k+'</small><strong>'+v+'</strong></div>').join("")+
  (isBest?'<div class="run-stat"><small>RECORD</small><strong>NEW BEST</strong></div>':previousBest>0?'<div class="run-stat record-gap"><small>PREVIOUS RECORD · GAP</small><strong>'+gap.toLocaleString()+" points to beat</strong></div>":'<div class="run-stat record-gap"><small>RECORD TARGET</small><strong>Set your first best!</strong></div>');
  this.root.hidden=false;
 }
 hide(){this.root.hidden=true}
}