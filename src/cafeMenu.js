export const MENU_ART_PATH='art/cafe-minimal-menu.svg'
export function menuPalette(name){
 if(name.includes('부다페스트'))return {ink:'#35312d',accent:'#d6bac3'}
 if(name.includes('미드나잇'))return {ink:'#31343a',accent:'#cbbb92'}
 return {ink:'#44372c',accent:'#b8a38a'}
}
function artwork(subject){return /밀크쉐이크/.test(subject)?0:/복숭아|배 주스/.test(subject)?1:/라테|라떼|호지/.test(subject)?2:/청포도|소다|에이드/.test(subject)?3:/브라우니/.test(subject)?4:/얼그레이|티|차/.test(subject)?5:/마들렌|스콘/.test(subject)?6:/초콜릿|초코/.test(subject)?7:/케이크/.test(subject)?8:-1}
export function menuItems(menu=''){
 return menu.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{
  // Separators within a recipe (e.g. peach · pear) belong to the description.
  const parts=line.split(/\s*\|\s*|\s*·\s*(?![^()]*\))/),label=parts[0],price=parts.slice(1).join(' · ')
  const match=label.match(/^(.*?)\s*\(([^()]*)\)\s*$/),name=match?match[1].trim():label,description=match?.[2],subject=description||name
  const components=subject.split(/\s*\+\s*/),index=artwork(components[0])
  return {name,price,art:index,...(description?{description}:{}),...(components.length>1?{set:true,arts:components.map(artwork)}:{})}
 })
}
