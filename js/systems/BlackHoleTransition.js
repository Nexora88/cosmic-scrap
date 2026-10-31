export function createBlackHoleTransition(region){
 return {region,timer:5.8,duration:5.8,cleanupClock:0,absorbed:0};
}
export function advanceBlackHoleTransition(state,dt){
 if(!state)return {done:true,removeCount:0,progress:1};
 state.timer=Math.max(0,state.timer-dt);
 state.cleanupClock+=dt;
 const removeCount=Math.floor(state.cleanupClock/.22);
 state.cleanupClock-=removeCount*.22;
 return {done:state.timer<=0,removeCount,progress:1-state.timer/state.duration};
}
export function blackHoleRadius(progress,shortSide){
 const p=Math.max(0,Math.min(1,progress));
 return Math.max(8,shortSide*.34*p*p);
}
