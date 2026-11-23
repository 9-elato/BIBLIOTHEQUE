export const EAST_MEADOW=[7.12,80,-34,-5.65]
export const STUDY_EXIT={x:7.23,z:-21.3,width:2}
export const MEADOW_STAIRS={id:'meadow',from:[20,0,-15.9],to:[8.15,7.2,-15.9],width:2,steps:38}
export const inEastMeadow=(x,z,end=43.1)=>x>7.65&&x<Math.max(80,end+14)&&z>-34&&z<-5.65

export function eastMeadowWalk(x,z,gateReady,end=43.1){
 if(x>end+8.3&&x<Math.max(80,end+14)&&z>-34&&z<4)return true
 if(z<-5.5&&z>-6.09&&x>7.65&&x<80)return false
 if(x>6.7&&x<7.65&&z>-29.3&&z<-19)return Boolean(gateReady&&Math.abs(z-STUDY_EXIT.z)<STUDY_EXIT.width/2-.23)
 return inEastMeadow(x,z,end)?true:null
}
