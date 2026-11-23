export function bookDimensions(pages){
 const n=Number(pages),count=Number.isFinite(n)&&n>0?n:300
 return {thickness:Math.min(.29,Math.max(.075,.055+count*.00029)),height:.54,depth:.37}
}
export function fitImage(width,height,box){
 const ratio=Math.min(box[0]/width,box[1]/height)
 return [width*ratio,height*ratio]
}
// Dominant opaque colour rather than an average muddied by white lettering.
export function coverColor(pixels,fallback='#795440'){
 const bins=new Map()
 for(let i=0;i<pixels.length;i+=4){const [r,g,b,a]=pixels.slice(i,i+4);if(a<128)continue
  const key=[r,g,b].map(v=>Math.floor(v/32)).join(',');const bin=bins.get(key)||[0,0,0,0];bin[0]+=r;bin[1]+=g;bin[2]+=b;bin[3]++;bins.set(key,bin)
 }
 const best=[...bins.values()].sort((a,b)=>b[3]-a[3])[0]
 return best?'#'+best.slice(0,3).map(v=>Math.round(v/best[3]).toString(16).padStart(2,'0')).join(''):fallback
}
