export const QUALITY_PROFILES={desktop:{density:1,grassShadow:18,leafShadow:35,branchShadow:55,maxDpr:1,shadowInterval:.125},mobile:{density:.5,grassShadow:0,leafShadow:15,branchShadow:28,maxDpr:.8,shadowInterval:.25}}
export function resolveQuality(choice='auto',mobile=false){return QUALITY_PROFILES[choice==='auto'?(mobile?'mobile':'desktop'):choice]||QUALITY_PROFILES.desktop}
