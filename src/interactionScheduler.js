// Only UI hints are cached. E/click actions must resolve from the current state.
export function createHintScheduler(interval=.1){
 let elapsed=interval,action=null
 return {next(dt,enabled,resolve){
  if(!enabled){elapsed=interval;action=null;return null}
  elapsed+=Math.max(0,dt)
  if(elapsed>=interval){elapsed=0;action=resolve()}
  return action
 },invalidate(){elapsed=interval}}
}
