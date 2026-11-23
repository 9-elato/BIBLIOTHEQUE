import {avatarDetailProfiles} from './avatarDetailProfiles.js'

export function detailedAvatarMaterial(source,character,kind){
 const material=source.clone()
 const profile=avatarDetailProfiles[character]
 const scale=kind==='metal'?.24:kind==='leather'?.57:1
 material.roughness=kind==='metal'?.38:kind==='leather'?.69:character==='ghost'?.89:.81
 material.onBeforeCompile=shader=>{
  shader.uniforms.detailFrequency={value:profile.frequency}
  shader.uniforms.detailContrast={value:profile.contrast*scale}
  shader.uniforms.detailRoughness={value:profile.roughness*scale}
  shader.vertexShader=shader.vertexShader
   .replace('#include <common>','#include <common>\nvarying vec3 avatarSurfacePoint;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\navatarSurfacePoint = position;')
  shader.fragmentShader=shader.fragmentShader
   .replace('#include <common>',`#include <common>
    varying vec3 avatarSurfacePoint;
    uniform float detailFrequency,detailContrast,detailRoughness;`)
   .replace('#include <color_fragment>',`#include <color_fragment>
    vec3 fiber=avatarSurfacePoint*detailFrequency;
    float grain=sin(fiber.x+sin(fiber.y*.61))*cos(fiber.z+fiber.y*1.31);
    float fade=1.0-smoothstep(.4,1.9,length(fwidth(fiber)));
    float nap=sin(fiber.y*.17+sin(fiber.x*.19))*sin(fiber.z*.21);
    diffuseColor.rgb*=1.0+grain*detailContrast*fade+nap*detailContrast*.23;`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=clamp(roughnessFactor+grain*detailRoughness*fade,.12,1.0);`)
 }
 material.customProgramCacheKey=()=>character+'-'+kind
 return material
}
