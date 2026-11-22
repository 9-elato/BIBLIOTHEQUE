"""Editable five-part estate. Coordinates authored in app X/Y-up/Z-front space.
Run: blender --background --python scripts/build_manor_estate.py
Only creates new estate assets; never reads or exports character files.
"""
import bpy, math, os, json
from mathutils import Vector
ROOT=os.path.abspath('.')
bpy.ops.wm.read_factory_settings(use_empty=True)
def xyz(p):return (p[0],-p[2],p[1])
def mat(name,color,metal=0,rough=.75):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m
stone=mat('Cream limestone',(.72,.66,.52));trim=mat('Carved ivory',(.9,.83,.67));slate=mat('Charcoal slate',(.12,.17,.20));wood=mat('Dark walnut',(.13,.075,.043));glass=mat('Blue grey window glass',(.16,.27,.29),.32,.2);gold=mat('Aged brass',(.5,.36,.16),.7);step=mat('Terrace paving',(.5,.52,.46));green=mat('Conservatory iron',(.08,.19,.14),.5);roofalt=mat('Slate seam',(.2,.25,.27));stonealt=mat('Limestone variation',(.66,.60,.49))
zone=None
def section(name):
 global zone
 print('BUILDING',name,flush=True)
 zone=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(zone)
def register(o,name,m):
 o.name=name;o.data.materials.append(m)
 for c in list(o.users_collection):c.objects.unlink(o)
 zone.objects.link(o);return o
def box(name,p,s,m,bevel=.025):
 x,y,z=p;w,h,d=[v/2 for v in s]
 return mesh(name,[(x+dx*w,y+dy*h,z+dz*d) for dx,dy,dz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m)
def mesh(name,verts,faces,m):
 data=bpy.data.meshes.new(name);data.from_pydata([xyz(v) for v in verts],[],faces);data.update();o=bpy.data.objects.new(name,data);zone.objects.link(o);data.materials.append(m);return o
def cylinder(name,p,r,depth,m,vertices=12,top=None):
 x,y,z=p;top=r if top is None else top
 verts=[(x+radius*math.cos(i*math.tau/vertices),y+dy,z+radius*math.sin(i*math.tau/vertices)) for dy,radius in [(-depth/2,r),(depth/2,top)] for i in range(vertices)]
 faces=[tuple(range(vertices-1,-1,-1)),tuple(range(vertices,vertices*2))]+[(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
 return mesh(name,verts,[tuple(reversed(f)) for f in faces],m)
def beam(name,a,b,width,m):
 av,bv=Vector(a),Vector(b);axis=(bv-av).normalized();u=axis.cross(Vector((0,1,0)))
 if u.length<.01:u=axis.cross(Vector((1,0,0)))
 u.normalize();v=axis.cross(u).normalized();w=width/2
 verts=[tuple(p+u*du*w+v*dv*w) for p in [av,bv] for du,dv in [(-1,-1),(1,-1),(1,1),(-1,1)]]
 return mesh(name,verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],m)
def arch(name,x,y,z,w,h,turn=0):
 # Plane arch with a separately segmented stone surround; no solid wall cutter is needed for exterior-only panes.
 r=w/2;spring=h-r;points=[(-r,0),(r,0)]+[(r*math.cos(i*math.pi/16),spring+r*math.sin(i*math.pi/16)) for i in range(17)]
 def p(dx,dy,dz=0):return (x+math.cos(turn)*dx+math.sin(turn)*dz,y+dy,z-math.sin(turn)*dx+math.cos(turn)*dz)
 mesh(name+' glass',[p(a,b,.035) for a,b in points],[(0,i,i+1) for i in range(1,len(points)-1)],glass)
 for a in [-1,1]:beam(name+' stone jamb',p(a*(r+.10),0),p(a*(r+.10),spring),.18,trim)
 for i in range(16):beam(name+' arch voussoir',p((r+.10)*math.cos(i*math.pi/16),spring+(r+.10)*math.sin(i*math.pi/16)),p((r+.10)*math.cos((i+1)*math.pi/16),spring+(r+.10)*math.sin((i+1)*math.pi/16)),.18,trim)
 beam(name+' sill',p(-r-.22,0,.05),p(r+.22,0,.05),.16,trim)
 for dx in [-w*.24,0,w*.24]:beam(name+' walnut mullion',p(dx,.08,.08),p(dx,spring+math.sqrt(max(0,r*r-dx*dx))-.06,.08),.045,wood)
 beam(name+' transom',p(-r,h*.43,.08),p(r,h*.43,.08),.05,wood)
def rectangular_window(x,y,z,w,h,turn):
 def p(a,b,d=0):return (x+math.cos(turn)*a+math.sin(turn)*d,y+b,z-math.sin(turn)*a+math.cos(turn)*d)
 mesh('Wing rectangular glass',[p(-w/2,0),p(w/2,0),p(w/2,h),p(-w/2,h)],[(0,1,2,3)],glass)
 for a in [-w/2,w/2]:beam('Rectangular stone jamb',p(a,0,.03),p(a,h,.03),.16,trim)
 for b in [0,h]:beam('Rectangular stone lintel',p(-w/2,b,.03),p(w/2,b,.03),.16,trim)
 beam('Rectangular mullion',p(0,0,.06),p(0,h,.06),.05,wood);beam('Rectangular transom',p(-w/2,h/2,.06),p(w/2,h/2,.06),.05,wood)
def roof(name,x,z,w,d,eave,rise):
 mesh(name,[(x-w/2,eave,z-d/2),(x+w/2,eave,z-d/2),(x,eave+rise,z-d/2),(x-w/2,eave,z+d/2),(x+w/2,eave,z+d/2),(x,eave+rise,z+d/2)],[(0,2,1),(3,4,5),(0,3,5,2),(1,2,5,4)],slate)
 beam(name+' ridge',(x,eave+rise+.05,z-d/2),(x,eave+rise+.05,z+d/2),.13,gold)
 for zz in [z-d/2,z+d/2]:
  beam(name+' verge',(x-w/2,eave,zz),(x,eave+rise,zz),.18,trim);beam(name+' verge',(x+w/2,eave,zz),(x,eave+rise,zz),.18,trim)
 for i in range(1,7):
  q=i/7
  for side in [-1,1]:beam(name+' slate course',(x+side*w/2*(1-q),eave+rise*q+.025,z-d/2),(x+side*w/2*(1-q),eave+rise*q+.025,z+d/2),.035,roofalt)
def chimney(x,z,y):
 box('Chimney shaft',(x,y+1,z),(.85,2,1),stonealt)
 for yy in [y+1.75,y+2]:box('Chimney crown',(x,yy,z),(1.04,.16,1.2),trim)
 for dx in [-.23,.23]:cylinder('Terracotta chimney pot',(x+dx,y+2.3,z),.16,.55,wood,10)
def shell(name,x,z,w,d,h,door=False):
 # Four facade walls; front entrance is genuinely open at ground level.
 if door:
  for a in [-1,1]:box(name+' front flank',(x+a*(w/4+.8),h/2,z+d/2),(w/2-1.6,h,.3),stone)
  box(name+' entrance lintel',(x,(h+6.2)/2,z+d/2),(3.2,h-6.2,.3),stone)
 else:box(name+' front',(x,h/2,z+d/2),(w,h,.3),stone)
 box(name+' rear',(x,h/2,z-d/2),(w,h,.3),stone)
 for side in [-1,1]:box(name+' side',(x+side*w/2,h/2,z),(.3,h,d),stone)
 for y in [.24,h*.34,h*.67,h-.15]:
  for zz in [z-d/2-.15,z+d/2+.15]:box(name+' stringcourse',(x,y,zz),(w+.45,.18,.35),trim)
 for side in [-1,1]:
  for zz in [z-d/2-.16,z+d/2+.16]:
   for i in range(int(h/.65)):box(name+' quoin',(x+side*(w/2-.2),.4+i*.65,zz),(.58,.27,.2),trim)
section('Main Manor')
shell('Main Manor',0,1.5,20,20,15,True)
for y in [1.0,6.0,10.9]:
 for x in [-7.5,-3.8,0,3.8,7.5]:
  if y==1 and x==0:continue
  arch('Main arched window',x,y,11.7,1.65,3.1)
for y in [6.0,10.9]:
 for x in [-7.5,-3.8,0,3.8,7.5]:arch('Main rear window',x,y,-8.7,1.65,3.1,math.pi)
for a in [-1,1]:
 for z in [-5,0,5]:arch('Main side window',a*10.2,10.9,z,1.5,2.8,a*math.pi/2)
for x in [-6.5,0,6.5]:roof('Main gable',x,1.5,7.1,21,15,4.1 if x==0 else 3.3)
for x,z in [(-7,-4),(6,-3),(-3,6)]:chimney(x,z,17)
# Projecting portico keeps the existing interactive entrance clear.
for a in [-1,1]:
 box('Portico pier',(a*2.05,3.0,12.1),(.65,6.0,2.1),trim)
 for y in [.2,5.5,5.8]:box('Portico capital',(a*2.05,y,12.9),(.88,.18,.8),stone)
box('Portico entablature',(0,6.05,12.2),(5.2,.4,2.6),trim);roof('Portico pediment',0,12.2,5.4,2.8,6.25,1.6)
arch('Portico upper fanlight',0,6.75,13.64,1.5,1.7)
for side,name in [(-1,'West Tower'),(1,'East Tower')]:
 section(name);x=side*13.2;z=7.3
 cylinder(name+' stone drum',(x,8.7,z),3.35,17.4,stone,12)
 for yy in [.35,5.6,10.7,16.7,17.2]:cylinder(name+' carved belt',(x,yy,z),3.5,.20,trim,12)
 for y in [1.5,6.6,11.7]:
  for a in [0,math.pi/3,-math.pi/3,math.pi]:arch(name+' lancet',x+math.sin(a)*3.28,y,z+math.cos(a)*3.28,1.05,3.3,a)
 cylinder(name+' slate spire',(x,20.1,z),3.65,5.6,slate,12,0)
 cylinder(name+' finial',(x,23.15,z),.09,.8,gold,10,0)
 for i in range(12):
  a=i*math.pi/6
  box(name+' parapet baluster',(x+math.sin(a)*3.48,17.6,z+math.cos(a)*3.48),(.12,.65,.12),trim)
 cylinder(name+' balcony rim',(x,17.94,z),3.55,.09,trim,12)
for side,name,depth,height in [(-1,'West Wing',16,11.5),(1,'East Wing',18,10.8)]:
 section(name);x=side*23.3;z=-.6 if side<0 else -1.6
 shell(name,x,z,14,depth,height)
 for xx in [x-4.5,x,x+4.5]:
  for y in [1.1,6.1]:arch(name+' front window',xx,y,z+depth/2+.21,1.5,2.9)
  for y in [1.1,6.1]:arch(name+' rear window',xx,y,z-depth/2-.21,1.5,2.9,math.pi)
  roof(name+' gable',xx,z,4.9,depth+.9,height,2.8 if side<0 else 2.4)
 for zz in [-5,0,4]:
  arch(name+' end window',x+side*7.2,2,zz,1.4,2.7,side*math.pi/2)
  rectangular_window(x+side*7.21,6.4,zz,1.35,1.9,side*math.pi/2)
 chimney(x+side*4,z-3,height+1.8)
 # Visible links occupy the existing lateral transition corridor; interior routing stays separate.
 box(name+' linking arcade',(side*16,3,3),(3,6,5),stone)
 for xx in [side*15.3,side*16.8]:arch(name+' connector window',xx,1.4,5.61,1,2.8)
section('Rear Manor')
# Unequal rear additions and terraces create the accumulated-house silhouette.
for x,z,w,d,h in [(-6,-12,7,7,9),(5.7,-10.5,6,4,8.5)]:
 shell('Rear annex',x,z,w,d,h);roof('Rear annex gable',x,z,w+.5,d+.6,h,2.6)
 arch('Rear annex door',x,.3,z-d/2-.22,1.8,3.3,math.pi)
 for xx in [x-w*.32,x+w*.32]:arch('Rear annex window',xx,4.6,z-d/2-.22,1.3,2.5,math.pi)
box('Rear terrace',(0,-.14,-18),(18,.28,8),step)
for x in [-8.7,8.7]:
 for z in [-15,-17,-19,-21]:box('Terrace pier',(x,.6,z),(.32,1.2,.32),trim)
 beam('Terrace handrail',(x,1.1,-15),(x,1.1,-21),.12,trim)
for i in range(6):box('Rear garden stepping stone',(0,.025,-22.5-i*1.15),(2,.05,.85),step)
# The actual 2F greenhouse remains the live React component, with weather and seating.
# Reserve its envelope rather than duplicate opaque walls around it.
reservation=bpy.data.objects.new('Winter garden future connection',None);zone.objects.link(reservation);reservation.location=xyz((0,7.2,-16));reservation['reserved_width']=10.8;reservation['reserved_depth']=17.7
# Save fully editable collection hierarchy before joining runtime meshes.
os.makedirs(os.path.join(ROOT,'assets/blender'),exist_ok=True)
print('Saving editable estate',flush=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/blender/manor_estate.blend'))
# Export compact meshes grouped by architectural region and material.
for coll in list(bpy.data.collections):
 for m in list(bpy.data.materials):
  objects=[o for o in coll.objects if o.type=='MESH' and o.active_material==m]
  if not objects:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:
   o.select_set(True);bpy.context.view_layer.objects.active=o
   for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=coll.name+' - '+m.name
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/models/manor_estate.glb'),export_format='GLB',export_apply=True,export_animations=False)
import sys
if '--no-preview' in sys.argv: sys.exit(0)
# Dedicated Blender previews, separate from the playable scene.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=850;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Estate daylight');scene.world.color=(.42,.46,.5)
bpy.ops.object.light_add(type='AREA',location=(0,-20,42));bpy.context.object.data.energy=16000;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=32
bpy.ops.object.light_add(type='SUN',location=(15,-25,30));bpy.context.object.rotation_euler=(.45,-.4,-.4);bpy.context.object.data.energy=2
bpy.ops.object.camera_add();camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=73;scene.camera=camera
for label,pos in [('front',(48,-70,39)),('rear',(-48,68,38))]:
 camera.location=pos;camera.rotation_euler=(Vector((0,0,8))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=os.path.join('C:/output','BIBLIOTHEQUE-estate-'+label+'.png');bpy.ops.render.render(write_still=True)
print('ESTATE COMPLETE')
