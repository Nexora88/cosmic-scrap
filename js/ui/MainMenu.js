export class MainMenu{
 constructor(){this.root=document.getElementById("overlay")}
 refresh(profile={}){
  const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=String(value)};
  const core=Math.max(0,Number(profile.scrapCore??profile.core)||0);
  const achievements=Array.isArray(profile.achievements)?profile.achievements.length:0;
  set("best",profile.bestScore||0);set("local-pilot-core",core);set("local-pilot-best",profile.bestScore||0);
  set("local-pilot-achievements",achievements+"/6");set("local-pilot-runs",profile.runs||0);
  set("local-pilot-scrap",profile.totalScrap||0);
  set("achievement-count",achievements+"/6");set("career-level","LEVEL "+(profile.careerLevel||1));
  if(this.root)this.root.hidden=false;
 }
 show(){if(this.root)this.root.hidden=false}
 hide(){if(this.root)this.root.hidden=true}
}
