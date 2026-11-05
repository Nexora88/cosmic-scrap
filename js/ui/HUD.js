import {formatTime} from "../utils/MathUtils.js";
export class HUD{
 show(){document.querySelectorAll(".top-hud,.bottom-hud").forEach(node=>node.hidden=false)}
 hide(){document.querySelectorAll(".top-hud,.bottom-hud").forEach(node=>node.hidden=true)}
 el(id){return document.getElementById(id)}
 setText(id,value){const node=this.el(id),next=String(value);if(node&&node.textContent!==next)node.textContent=next}
 setWidth(id,value){const node=this.el(id),next=value+"%";if(node&&node.style.width!==next)node.style.width=next}
 setHidden(id,value){const node=this.el(id);if(node&&node.hidden!==Boolean(value))node.hidden=Boolean(value)}
 update(g){
  const sector=this.el("sector-label");if(sector&&g.region){const tr=localStorage.getItem("cosmic-scrap-language")==="tr",name=g.regionTransition?(tr?"KARA DELİK GEÇİŞİ":"BLACK HOLE TRANSIT"):(tr?g.region.name.tr:g.region.name.en);this.setText("sector-label",name);if(sector.dataset.accent!==g.region.accent){sector.style.setProperty("--sector-accent",g.region.accent);sector.dataset.accent=g.region.accent}}
  this.setText("time",formatTime(g.elapsed));this.setText("level",String(g.level).padStart(2,"0"));this.setText("score",String(g.score).padStart(6,"0"));
  this.setText("health",Math.max(0,Math.ceil(g.player.health)));this.setWidth("health-fill",Math.max(0,g.player.health/g.player.maxHealth*100));
  this.setText("scrap",g.scrapCollected);this.setWidth("xp-fill",Math.min(100,g.xp/g.xpNext*100));
  const combo=this.el("combo"),wrap=combo?.closest(".combo-wrap");this.setText("combo","x"+g.combo.multiplier.toFixed(1));if(wrap){wrap.classList.toggle("combo-hot",g.combo.count>=8);wrap.classList.toggle("combo-max",g.combo.count>=20)}
  this.setHidden("storm-banner",!g.stormActive);
  this.setHidden("contract-hud",!g.contract);if(g.contract){this.setText("contract-hud-title",g.contract.name);this.setText("contract-hud-progress",g.contract.metric==="boss"?(g.contractComplete?"ELITE DEFEATED":"ELITE NOT YET DEFEATED"):Math.floor(g.contractProgress)+" / "+g.contract.target+(g.contract.metric==="scrap"?" SCRAP":" STORM KILLS"));this.setWidth("contract-hud-fill",100*g.contractProgress/g.contract.target);const contract=this.el("contract-hud");contract?.classList.toggle("contract-complete",g.contractComplete)}
 }
}
