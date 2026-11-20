import bpy,os,math
from mathutils import Vector
root=os.path.abspath('.')
# Export the supplied model without cameras, lights or embedded scripts.
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type in {'MESH','CURVE','EMPTY'}:
  o.select_set(True)
  if o.name.startswith('Sculpted ear'):
   o.data.materials[0]=bpy.data.materials.get('Apricot coat');o.data.materials[1]=bpy.data.materials.get('Chestnut tips')
  for m in o.modifiers:
   if m.type=='SUBSURF':m.levels=1;m.render_levels=1
  if o.type=='CURVE':o.data.resolution_u=8;o.data.bevel_resolution=2
# glTF does not carry procedural ear gradients: existing face material slots preserve tips.
bpy.ops.export_scene.gltf(filepath=os.path.join(root,'public/models/fox_librarian.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False)
# Build an editable architectural ornament model in a fresh scene.
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n,c,metal=0):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=.65
 return m
stone=mat('Warm carved limestone',(.65,.53,.38));cream=mat('Ivory cornice',(.82,.72,.55));wood=mat('Walnut',(.16,.075,.035));brass=mat('Aged brass',(.5,.32,.10),.65)
def box(n,p,s,m,bev=.035):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=n;o.dimensions=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m)
 if bev:mod=o.modifiers.new('Masonry bevel','BEVEL');mod.width=bev;mod.segments=2;o.modifiers.new('Weighted corners','WEIGHTED_NORMAL')
 return o
box('Upper facade extension',(0,8.9,11.68),(20,3.8,.73),stone)
for y,w in [(7.1,20.2),(10.7,20.5),(10.85,20.8)]:box('Layered entablature',(0,y,12.05),(w,.15,.48),cream)
for x in [-9.7,-7,-4,4,7,9.7]:
 box('Pilaster shaft',(x,4.5,12.16),(.28,8.9,.26),cream)
 for y in [.3,6.9,10.35]:box('Carved capital',(x,y,12.22),(.55,.24,.44),stone)
for x in [-7,-3.5,0,3.5,7]:
 box('Upper window surround',(x,8.8,12.10),(2.2,2.45,.25),cream)
 box('Upper window recess',(x,8.8,12.25),(1.95,2.2,.04),wood)
 for dx in [-.65,0,.65]:box('Window mullion',(x+dx,8.8,12.33),(.055,2.1,.08),brass,.01)
 for y in [8.25,8.8,9.35]:box('Window transom',(x,y,12.33),(1.9,.045,.08),brass,.01)
 for a in range(13):
  t=a*math.pi/12
  box('Voussoir',(x+1.14*math.cos(t),10.05+.65*math.sin(t),12.2),(.19,.20,.3),stone)
for x in range(-9,10):box('Cornice dentil',(x,10.53,12.35),(.18,.20,.18),cream)
for x in [-9.7,9.7]:
 for y in range(1,10):box('Corner quoin',(x,y,12.25),(.55,.28,.38),stone)
os.makedirs(os.path.join(root,'assets/blender'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'assets/blender/manor_facade.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(root,'public/models/manor_facade.glb'),export_format='GLB',export_apply=True)
