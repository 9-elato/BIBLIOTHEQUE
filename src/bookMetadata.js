import {normalizeCoverUrl} from './coverUrl.js'
export const STAR_RATINGS=Array.from({length:9},(_,i)=>1+i*.5)
export function validRating(value){return value===0||STAR_RATINGS.includes(value)}
export function spineSource(value=''){return /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)?value:''}
export function shelfImage(book){return spineSource(book?.spine)||normalizeCoverUrl(book?.cover)}
export function validateBook(book){
 if(!book.title?.trim())return '책 제목을 입력하세요.'
 if(!validRating(Number(book.rating)))return '별점은 1~5점 사이 0.5점 단위로 선택하세요.'
 if(book.cover&&!normalizeCoverUrl(book.cover))return '올바른 책표지 이미지 URL을 입력하세요.'
 if(book.pages!==''&&book.pages!=null&&(!Number.isSafeInteger(Number(book.pages))||Number(book.pages)<1))return '페이지 수는 1 이상의 정수로 입력하세요.'
 return ''
}
export async function importSpine(file){
 if(!file||file.size>10*1024*1024)throw new Error('10MB 이하의 JPG 파일을 선택하세요.')
 const bytes=new Uint8Array(await file.slice(0,3).arrayBuffer())
 if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new Error('JPG/JPEG 이미지 파일만 업로드할 수 있습니다.')
 const url=URL.createObjectURL(file)
 try{
  const image=new Image();image.src=url;await image.decode()
  const ratio=Math.min(1,1536/Math.max(image.width,image.height)),canvas=document.createElement('canvas')
  canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio))
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height)
  return canvas.toDataURL('image/jpeg',.94)
 }finally{URL.revokeObjectURL(url)}
}
