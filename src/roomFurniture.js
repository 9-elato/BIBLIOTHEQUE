import {atticX} from './atticLayout.js'
// Shared by rendered furniture, walking collision and sitting anchors.
export const READING_CHAIRS=[
 {id:'upper-0',label:'열람실 세이지 안락의자',x:10.2,z:-2.65,level:7.2,turn:0,color:'#526957'},
 {id:'upper-1',label:'열람실 버건디 안락의자',x:10.2,z:2.65,level:7.2,turn:Math.PI,color:'#795251'},
 {id:'attic-0',label:'다락 별빛 안락의자',x:atticX(-14.5),z:-2.7,level:10.6,turn:0,color:'#637482'},
 {id:'attic-1',label:'다락 장미빛 안락의자',x:atticX(-12.9),z:-3.7,level:10.6,turn:0,color:'#866467'},
]
export const CHAIR_HEIGHT=.62
export const STUDY_CHAIR={id:'study-chair',label:'작업실 독서 안락의자',x:-4.7,z:-25,turn:0,level:0,color:'#6a5360'}
