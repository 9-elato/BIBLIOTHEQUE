import bpy, os, math
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
root=os.path.abspath('.')
def mat(name,color,rough=.8,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m
fabric=mat('Forest velvet',(.065,.145,.085),.95);edge=mat('Sewn piping',(.14,.24,.13));wood=mat('Oiled walnut',(.19,.105,.045),.55);gold=mat('Aged brass',(.4,.28,.1),.35,.65);pillow=mat('Warm linen',(.46,.36,.22))
def box(name,p,s,m,r=.03):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name;o.dimensions=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m)
 mod=o.modifiers.new('Soft finished edges','BEVEL');mod.width=r;mod.segments=3
 o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
 return o
def seam(x,y,z,w,d):
 curve=bpy.data.curves.new('Cushion welt','CURVE');curve.dimensions='3D';curve.bevel_depth=.008;curve.bevel_resolution=1
 spline=curve.splines.new('POLY');pts=[];r=.09
 for cx,cz,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
  for i in range(7):
   a=math.radians(start+i*15);pts.append((x+cx+r*math.cos(a),-(z+cz+r*math.sin(a)),y,1))
 spline.points.add(len(pts)-1)
 for p,v in zip(spline.points,pts):p.co=v
 spline.use_cyclic_u=True;o=bpy.data.objects.new('Tailored cushion seam',curve);bpy.context.collection.objects.link(o);o.data.materials.append(edge)
box('Sofa frame',(10.7,.31,4.05),(4.4,.34,1.2),wood,.055)
for x in [8.7,12.7]:
 for z in [3.62,4.46]:box('Walnut foot',(x,.12,z),(.13,.24,.13),wood,.025)
box('Upholstered back',(10.7,.96,4.53),(4.4,1.08,.26),fabric,.10)
for x in [9.27,10.7,12.13]:
 box('Deep seat cushion',(x,.66,4),(1.4,.25,1.04),fabric,.105);seam(x,.735,4,1.34,.98)
 box('Back cushion',(x,1.02,4.35),(1.3,.72,.28),fabric,.12)
 o=box('Loose linen pillow',(x+.3,1.08,4.12),(.45,.45,.21),pillow,.085);o.rotation_euler[1]=.16
for x in [8.57,12.83]:box('Rounded arm',(x,.76,4.03),(.22,.75,1.2),fabric,.09)
box('Ottoman base',(12.2,.2,2.95),(1.24,.30,.86),wood,.04)
box('Ottoman cushion',(12.2,.5,2.95),(1.4,.5,1),fabric,.12);seam(12.2,.69,2.95,1.32,.92)
box('Rounded walnut table',(10.1,.5,1.85),(1.35,.14,.75),wood,.065)
for x in [9.6,10.6]:
 for z in [1.6,2.1]:
  box('Tapered table leg',(x,.23,z),(.09,.46,.09),wood,.02);box('Brass foot',(x,.035,z),(.095,.07,.095),gold,.01)
# Bake modifiers and join by material: detail without one draw call per seam/foot.
for o in list(bpy.context.scene.objects):
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 if o.type=='CURVE':bpy.ops.object.convert(target='MESH')
 else:
  for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
 o.select_set(False)
for material in [fabric,edge,wood,gold,pillow]:
 objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==material]
 if not objs:continue
 for o in objs:o.select_set(True)
 bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name='Reading nook '+material.name;bpy.ops.object.select_all(action='DESELECT')
os.makedirs(os.path.join(root,'assets/blender'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'assets/blender/reading_nook.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(root,'public/models/reading_nook.glb'),export_format='GLB',export_animations=False)
