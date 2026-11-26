export function cafeDisplays(books){
 const groups=new Map()
 for(const book of books){const name=book.category?.trim()||'미분류';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(book)}
 if(!groups.size)return ['문학','인문·사회','예술·취미','과학·자연'].map(name=>({name,books:[]}))
 const entries=[...groups].map(([name,books])=>({name,books}))
 return entries.length<=4?entries:[...entries.slice(0,3),{name:'다양한 분야',books:entries.slice(3).flatMap(g=>g.books)}]
}
