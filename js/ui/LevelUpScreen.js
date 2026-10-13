import {rarityAt} from "../systems/Balance.js";
export class LevelUpScreen{
 constructor(){this.root=document.getElementById("upgrade-screen");this.cards=document.getElementById("upgrade-cards")}
 show(choices,onChoose){
  this.cards.replaceChildren();
  choices.forEach(u=>{
   const rarity=rarityAt(Math.random());
   const b=document.createElement("button");b.className="upgrade-card rarity-"+rarity;b.dataset.rarity=rarity;
   const icon=document.createElement("span");icon.className="card-icon";icon.textContent=u.icon;
   const title=document.createElement("h3");title.textContent=u.name;
   const description=document.createElement("p");description.textContent=u.description;
   const tag=document.createElement("span");tag.className="rarity-label";tag.textContent=rarity==="epic"?"✦ EPIC · 5% ROLL · DOUBLE POWER":rarity==="rare"?"◆ RARE · 22% ROLL · BOOSTED":"● COMMON · 73% ROLL";
   b.append(icon,title,description,tag);
   b.addEventListener("click",()=>onChoose(u,rarity));
   this.cards.append(b);
  });
  this.root.hidden=false;
 }
 hide(){this.root.hidden=true}
}