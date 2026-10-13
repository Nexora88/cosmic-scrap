export class LevelUpScreen{
 constructor(){this.root=document.getElementById("upgrade-screen");this.cards=document.getElementById("upgrade-cards")}
 show(choices,onChoose){
  this.cards.replaceChildren();
  choices.forEach(u=>{
   const roll=Math.random(),rarity=roll<.03?"epic":roll<.2?"rare":"common";
   const b=document.createElement("button");b.className="upgrade-card rarity-"+rarity;b.dataset.rarity=rarity;
   const icon=document.createElement("span");icon.className="card-icon";icon.textContent=u.icon;
   const title=document.createElement("h3");title.textContent=u.name;
   const description=document.createElement("p");description.textContent=u.description;
   const tag=document.createElement("span");tag.className="rarity-label";tag.textContent=rarity==="epic"?"✦ EPIC · DOUBLE POWER":rarity==="rare"?"◆ RARE · BOOSTED":"● COMMON";
   b.append(icon,title,description,tag);
   b.addEventListener("click",()=>onChoose(u,rarity));
   this.cards.append(b);
  });
  this.root.hidden=false;
 }
 hide(){this.root.hidden=true}
}