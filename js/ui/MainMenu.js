export class MainMenu{
 constructor(){this.root=document.getElementById("overlay")}
 refresh(){this.show()}
 show(){if(this.root)this.root.hidden=false}
 hide(){if(this.root)this.root.hidden=true}
}