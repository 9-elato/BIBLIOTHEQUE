// Spread independent cell LOD checks across frames instead of polling the
// entire meadow on one frame every 200 ms. Long pauses do not create backlogs.
export function nextVegetationPoll(now,x,z,interval=.2){
 const phase=((Math.sin(x*12.9898+z*78.233)*43758.5453)%1+1)%1*interval
 return (Math.floor((now-phase)/interval)+1)*interval+phase
}
