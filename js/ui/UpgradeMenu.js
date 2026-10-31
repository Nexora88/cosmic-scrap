export class UpgradeMenu{
 constructor(){
  this.root=document.getElementById("meta-screen");
  this.list=document.getElementById("meta-options");
  this.profile=null;this.upgrades=[];this.purchase=null;this.onChange=()=>{};
 }
 show(profile,upgrades,purchase,onChange=()=>{}){
  this.profile=profile;this.upgrades=upgrades||[];this.purchase=purchase;this.onChange=onChange;
  this.render();if(this.root)this.root.hidden=false;
 }
 render(){
  if(!this.list||!this.profile)return;
  this.list.replaceChildren();
  const balance=document.createElement("p");
  balance.className="meta-balance";
  balance.textContent="AVAILABLE SCRAP CORE · "+Math.max(0,Number(this.profile.scrapCore??this.profile.core)||0);
  this.list.append(balance);
  for(const item of this.upgrades){
   const rank=Math.max(0,Number(this.profile.meta?.[item.id])||0);
   const maxed=rank>=item.max;
   const row=document.createElement("article");row.className="meta-option";
   const copy=document.createElement("div");copy.className="meta-copy";
   const title=document.createElement("strong");title.textContent=item.name+" · "+rank+"/"+item.max;
   const description=document.createElement("small");description.textContent=item.description;
   copy.append(title,description);
   const action=document.createElement("button");action.type="button";action.disabled=maxed||(Number(this.profile.scrapCore??this.profile.core)||0)<item.cost;
   action.textContent=maxed?"MAXED":"BUY · "+item.cost;
   action.setAttribute("aria-label",maxed?item.name+" maxed": "Buy "+item.name+" for "+item.cost+" Scrap Core");
   action.addEventListener("click",()=>{
    if(!this.purchase||!this.purchase(this.profile,item.id))return;
    this.onChange(this.profile);
    this.render();
   });
   row.append(copy,action);this.list.append(row);
  }
 }
 hide(){if(this.root)this.root.hidden=true}
}
