"""Structural QA only: render the east bay from production panel coordinates.
WindowLandscape shader is represented by an opaque blue plane so missing panels
are visible. Not a screenshot or material-quality comparison of the web scene.
Run blender --background --python this.py -- input.json output-directory
"""
import bpy, json, sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:]
data=json.loads(Path(args[0]).read_text(encoding='utf-8-sig'))
out=Path(args[1]).resolve();out.mkdir(parents=True,exist_ok=True)
def material(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*color,1);return m
for variant in ['before','after']:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 iron=material('frame',(.025,.10,.065));stone=material('stone',(.72,.69,.59));glass=material('glazing-placeholder',(.24,.52,.61));ground=material('ground',(.39,.43,.34))
 scale=data['heightScale']
 def box(name,center,size,mat):
  x,y,z=center;sx,sy,sz=size
  bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y*scale))
  obj=bpy.context.object;obj.name=name;obj.dimensions=(sx,sz,sy*scale);obj.data.materials.append(mat)
 def window(name,x,z,w,turn=False):
  import math
  old_arch=variant=='before' and not data.get('beforeRectangular',False)
  height=3.25 if old_arch else 3.4
  center=2.65 if old_arch else 2.7
  width=w-(.1 if old_arch else .04)
  if old_arch:
   r=width/2
   points=[(-r,-height/2),(r,-height/2),(r,height/2-r)]+[(r*math.cos(t*math.pi/32),height/2-r+r*math.sin(t*math.pi/32)) for t in range(33)]
  else:points=[(-width/2,-height/2),(width/2,-height/2),(width/2,height/2),(-width/2,height/2)]
  vertices=[(x if turn else x+u,-z-u if turn else -z,(center+v)*scale) for u,v in points]
  mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],[list(range(len(vertices)))]);mesh.update()
  obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(glass)
 def panel(z,w):
  # Glazing at x=8.5 rotated -pi/2: local width maps onto world z.
  box('stone plinth',(8.5,.45,z),(.18,.9,w),stone)
  box('ledge',(8.5,.94,z),(.3,.12,w+.06),stone)
  window('window placeholder',8.54,z,w,True)
  import math
  n=math.ceil(w/1.2)
  for i in range(n+1):box('mullion',(8.46,2.65,z-w/2+i*w/n),(.09,3.5,.06),iron)
  for y in [1,2.3,4.4]:box('rail',(8.45,y,z),(.1,.06,w),iron)
 box('floor',(6.9,-.12,-14.05),(3.3,.24,6.5),stone)
 box('roof',(6.9,4.4,-14.1),(3.2,.045,6.2),stone)
 for z in [data['back'],data['front']]:
  box('return stone',(6.9,.45,z),(3.2,.9,.18),stone)
  window('return window',6.9,z,3.2)
  for x in [5.3,6.3667,7.4333,8.5]:box('return column',(x,2.65,z),(.06,3.5,.09),iron)
  for y in [1,2.3,4.4]:box('return rail',(6.9,y,z),(3.2,.06,.1),iron)
 for p in data[variant]:panel(p['z'],p['w'])
 if variant=='after' and data.get('portal'):
  p=data['portal'];top=4.4
  for side in [-1,1]:box('portal jamb',(p['x'],p['height']/2,p['z']+side*(p['width']/2+.04)),(.15,p['height'],.08),iron)
  for y in [p['height']+.04,top]:box('portal lintel',(p['x'],y,p['z']),(.15,.08,p['width']+.16),iron)
  box('portal transom',(p['x'],(top+p['height'])/2,p['z']),(.015,top-p['height'],p['width']+.08),glass)
 if data.get('stair'):
  stair=data['stair'];a=stair['from'];b=stair['to'];steps=stair['steps'];rise=(b[1]-a[1])/steps
  for i in range(steps):
   t=(i+.5)/steps;x=a[0]+(b[0]-a[0])*t;y=a[1]+(b[1]-a[1])*t;z=a[2]+(b[2]-a[2])*t
   box('outdoor stair tread',(x,(y-rise/2-.05-data['level'])/scale,z),(abs(b[0]-a[0])/steps+.012,(rise+.1)/scale,stair['width']),stone)
 box('ground',(7,-data.get('level',0)/scale-.3,-14),(30,.1,30),ground)
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
 scene.render.resolution_x=640;scene.render.resolution_y=480;scene.render.resolution_percentage=100
 scene.world=bpy.data.worlds.new('world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.7,.8,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.6
 bpy.ops.object.light_add(type='AREA',location=(13,13,12));bpy.context.object.data.energy=1800;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=8
 bpy.ops.object.camera_add(location=(15,22,5.7));camera=bpy.context.object;camera.rotation_euler=(Vector((7,14.1,3))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=10.7;scene.camera=camera
 scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/(variant+'.png'))
 bpy.ops.render.render(write_still=True)

