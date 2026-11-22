export function createSectorTransition(region,isGalaxyTransition=false){
 const duration=isGalaxyTransition?7:3.6;
 return {region,timer:duration,duration,pulseClock:0,isGalaxyTransition};
}
export function advanceSectorTransition(state,dt){
 if(!state)return {done:true,pulse:false,progress:1};
 state.timer=Math.max(0,state.timer-dt);
 state.pulseClock+=dt;
 let pulse=false;
 if(state.pulseClock>=.38){state.pulseClock-=.38;pulse=true}
 return {done:state.timer<=0,pulse,progress:1-state.timer/state.duration};
}
