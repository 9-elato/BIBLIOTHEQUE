export const MENU_ART_PATH='art/cafe-literary-menu.png'
export function menuItems(menu=''){
 return menu.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{
  // Separators within a recipe (e.g. peach · pear) belong to the description.
  const parts=line.split(/\s*\|\s*|\s*·\s*(?![^()]*\))/),label=parts[0],price=parts.slice(1).join(' · ')
  const match=label.match(/^(.*?)\s*\(([^()]*)\)\s*$/),name=match?match[1].trim():label,description=match?.[2],subject=description||name
  const index=/밀크쉐이크/.test(subject)?0:/복숭아|배 주스/.test(subject)?1:/라테|라떼|호지/.test(subject)?2:/청포도|소다|에이드/.test(subject)?3:/브라우니/.test(subject)?4:/티|차/.test(subject)?5:/마들렌|스콘/.test(subject)?6:/초콜릿|초코/.test(subject)?7:/케이크/.test(subject)?8:-1
  return {name,price,art:index,...(description?{description}:{})}
 })
}
