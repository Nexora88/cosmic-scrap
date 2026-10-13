export class LevelUpScreen{
 constructor(){this.root=document.getElementById("upgrade-screen");this.cards=document.getElementById("upgrade-cards")}
 show(choices,onChoose){
  this.cards.replaceChildren();
  choices.forEach(u=>{
   const roll=Math.random(),rarity=roll<.07?"epic":roll<.32?"rare":"common";
   const b=document.createElement("button");b.className="upgrade-card rarity-"+rarity;
   const icon=document.createElement("span");icon.className="card-icon";icon.textContent=u.icon;
   const title=document.createElement("h3");title.textContent=u.name;
   const description=document.createElement("p");description.textContent=u.description;
   const tag=document.createElement("span");tag.className="rarity-label";tag.textContent=rarity==="epic"?"✦ EPIC · ENHANCED":rarity==="rare"?"◆ RARE":"● COMMON";
   b.append(icon,title,description,tag);
   b.addEventListener("click",()=>{if(rarity==="epic"){u.apply(u.__player);u.apply(u.__player)}else u.apply(u.__player);onChoose(u)});
   b.dataset.rarity=rarity;
   this.cards.append(b);
  });
  this.root.hidden=false;
  // Apply against the current run's player; the callback is still the single source of truth.
  this.cards.querySelectorAll(".upgrade-card").forEach((b,i)=>{b.onclick=null; b.addEventListener("click",()=>onChoose(choices[i],b.dataset.rarity),{once:true})});
 }
 hide(){this.root.hidden=true}
}