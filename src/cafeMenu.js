export const MENU_ART_PATH='art/cafe-watercolor-menu.png'
export function menuItems(menu=''){
 return menu.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{
  const parts=line.split(/\s*[·|]\s*/),name=parts[0],price=parts.slice(1).join(' · ')
  const index=/스콘/.test(name)?7:/케이크/.test(name)?8:/초콜릿|초코/.test(name)?6:/레몬|에이드/.test(name)?5:/캐모|카모/.test(name)?4:/얼그레이|홍차|티|차/.test(name)?3:/바닐라/.test(name)?2:/라테|라떼/.test(name)?1:/커피|드립|에스프레소/.test(name)?0:-1
  return {name,price,art:index}
 })
}
