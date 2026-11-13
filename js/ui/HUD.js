import {formatTime} from "../utils/MathUtils.js";
export class HUD{
 show(){document.querySelectorAll(".top-hud,.bottom-hud").forEach(node=>node.hidden=false)}
 hide(){document.querySelectorAll(".top-hud,.bottom-hud").forEach(node=>node.hidden=true)}
 el(id){return document.getElementById(id)}
 update(g){
  const sector=this.el("sector-label");if(sector&&g.region){const tr=localStorage.getItem("cosmic-scrap-language")==="tr";sector.textContent=g.regionTransition?(tr?"KARA DELİK GEÇİŞİ":"BLACK HOLE TRANSIT"):(tr?g.region.name.tr:g.region.name.en);sector.style.setProperty("--sector-accent",g.region.accent)}this.el("time").textContent=formatTime(g.elapsed);this.el("level").textContent=String(g.level).padStart(2,"0");this.el("score").textContent=String(g.score).padStart(6,"0");
  this.el("health").textContent=Math.max(0,Math.ceil(g.player.health));this.el("health-fill").style.width=Math.max(0,g.player.health/g.player.maxHealth*100)+"%";
  this.el("scrap").textContent=g.scrapCollected;this.el("xp-fill").style.width=Math.min(100,g.xp/g.xpNext*100)+"%";
  const combo=this.el("combo"),wrap=combo.closest(".combo-wrap");combo.textContent="x"+g.combo.multiplier.toFixed(1);
  wrap.classList.toggle("combo-hot",g.combo.count>=8);wrap.classList.toggle("combo-max",g.combo.count>=20);
  this.el("storm-banner").hidden=!g.stormActive;
  const contract=this.el("contract-hud");contract.hidden=!g.contract;if(g.contract){this.el("contract-hud-title").textContent=g.contract.name;this.el("contract-hud-progress").textContent=g.contract.metric==="boss"?(g.contractComplete?"ELITE DEFEATED":"ELITE NOT YET DEFEATED"):Math.floor(g.contractProgress)+" / "+g.contract.target+(g.contract.metric==="scrap"?" SCRAP":" STORM KILLS");this.el("contract-hud-fill").style.width=(100*g.contractProgress/g.contract.target)+"%";contract.classList.toggle("contract-complete",g.contractComplete)}
 }
}