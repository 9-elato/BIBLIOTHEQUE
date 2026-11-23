import {Shape,ShapeGeometry} from 'three'
// Rectangular conservatory frames must not inherit the manor's arched window cutout.
export function createWindowGeometry(w,h,rectangular=false){
 const s=new Shape()
 s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2)
 if(rectangular){s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2)}
 else{s.lineTo(w/2,h/2-w/2);s.absarc(0,h/2-w/2,w/2,0,Math.PI,false)}
 s.closePath()
 const g=new ShapeGeometry(s),p=g.attributes.position,uv=g.attributes.uv
 for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5)
 return g
}
