import * as THREE from 'three'
export const windStrength=weather=>weather==='rain'?.82:weather==='snow'?.62:.24
export function windEnvelope(t,strength){return strength*(.72+.18*Math.sin(t*.31)+.1*Math.sin(t*.73))}
export function grassDensity(distance){return distance<15?1:distance>55?.08:1-(distance-15)/40*.92}
export function leafDensity(distance){return Math.max(.16,Math.min(1,1-(distance-30)/90))}
// Bound distant leaf enlargement and ease transitions after quality/LOD changes.
export function leafScale(total,count){return Math.min(1.5,Math.sqrt(total/Math.max(1,count)))}
export function easeLeafScale(current,target,dt){return current+(target-current)*(1-Math.exp(-5*Math.min(.1,Math.max(0,dt))))}
export function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}

// Used by the visible material AND shadow material so moving silhouettes match.
export function windMaterial(kind,uniforms,depth=false){
 const m=depth?new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({roughness:1,side:THREE.DoubleSide,color:kind==='branch'?'#66513d':'#ffffff'})
 m.onBeforeCompile=s=>{
  s.uniforms.plantGust=uniforms.gust||{value:0};s.uniforms.plantClock=uniforms.clock;s.uniforms.plantWind=uniforms.strength;s.uniforms.leafSize=uniforms.detail||{value:1};s.uniforms.plantEye=uniforms.eye||{value:new THREE.Vector3()}
  s.vertexShader=`uniform float plantClock,plantWind,leafSize,plantGust;uniform vec3 plantEye;${kind==='grass'?'attribute float plantRank;':'attribute vec4 plantRoot;'}\n`+s.vertexShader
  const root=kind==='grass'?'vec4(instanceMatrix[3].xyz,1.)':'plantRoot'
  s.vertexShader=s.vertexShader.replace('#include <project_vertex>',`
   vec4 mvPosition=vec4(transformed${kind==='leaf'?'*leafSize':''},1.);
   #ifdef USE_INSTANCING
    ${kind==='grass'?`float eyeDistance=distance(plantEye,(modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz);
     float density=clamp(1.-(eyeDistance-15.)/40.*.92,.08,1.);
     mvPosition.xyz*=smoothstep(plantRank-.025,plantRank+.025,density);`:''}
    mvPosition=instanceMatrix*mvPosition;
    vec4 root=${root};
    float height=max(0.,mvPosition.y-root.y),phase=root.x*.31+root.z*.23;
    float gust=${uniforms.gust?'plantGust':'plantWind*(.72+.18*sin(plantClock*.31)+.1*sin(plantClock*.73))'};
    float wave=sin(plantClock*1.4+mvPosition.x*.24+mvPosition.z*.18);
    ${kind==='grass'?`
     float bend=height*height*gust*(.65+.35*wave);
     mvPosition.x+=bend;mvPosition.z+=bend*.45+sin(plantClock*2.+phase)*height*.08*gust;
    `:`
     float trunk=pow(clamp(height/root.w,0.,1.),2.)*max(0.,gust-.48)*.65*sin(plantClock*.65+phase);
     float twig=max(0.,height/root.w-.35)*max(0.,gust-.22)*.28*sin(plantClock*1.5+phase+mvPosition.z);
     mvPosition.x+=trunk+twig;mvPosition.z+=(trunk-twig)*.45;
     ${kind==='leaf'?`float flutter=sin(plantClock*3.6+phase+mvPosition.x*3.3+mvPosition.y*5.1)*gust*.065;
      mvPosition.x+=flutter;mvPosition.y+=flutter*.5;`:''}
    `}
   #endif
   vec4 plantPosition=mvPosition;
   mvPosition=modelViewMatrix*mvPosition;
   gl_Position=projectionMatrix*mvPosition;`)
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','vec4 worldPosition=modelMatrix*plantPosition;')
 }
 m.customProgramCacheKey=()=>`vegetation-${kind}-${depth}-${Boolean(uniforms.gust)}-v2`
 return m
}
