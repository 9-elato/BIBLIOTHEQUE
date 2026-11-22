export const EAST_MEADOW=[7.12,41,-34,-5.65]
export const STACKS_EXIT={x:13.43,z:-5.85,width:1.55}
export const STUDY_EXIT={x:7.23,z:-21.3,width:2}
export const MEADOW_STAIRS={id:'meadow',from:[20,0,-15.9],to:[8.15,7.2,-15.9],width:2,steps:38}
export const inEastMeadow=(x,z)=>x>7.65&&x<41&&z>-34&&z<-5.65

export function eastMeadowWalk(x,z,gateReady){
 if(z<-5.5&&z>-6.09&&x>7.65&&x<41)return Math.abs(x-STACKS_EXIT.x)<STACKS_EXIT.width/2-.23
 if(x>6.7&&x<7.65&&z>-29.3&&z<-19)return Boolean(gateReady&&Math.abs(z-STUDY_EXIT.z)<STUDY_EXIT.width/2-.23)
 return inEastMeadow(x,z)?true:null
}
