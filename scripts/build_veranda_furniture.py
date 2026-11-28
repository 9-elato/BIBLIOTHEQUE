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
box('Low tea table',(-15,.43,-11),(1.75,.14,1.1),wood,.07)
for x in [-15.65,-14.35]:
 for z in [-11.35,-10.65]:
  box('Table foot',(x,.2,z),(.10,.4,.10),wood,.025)
  box('Brass foot cap',(x,.035,z),(.105,.07,.105),gold,.014)
box('Lower tea tray',(-15,.18,-11),(1.4,.045,.72),wood,.02)
for x in [-17.5,-12.5]:
 box('Woven floor cushion',(x,.14,-11.8),(1.34,.28,1.22),pillow,.12)
 seam(x,.22,-11.8,1.25,1.13)
 for dx in [-.22,.22]:
  for dz in [-.2,.2]:box('Quilt button',(x+dx,.278,-11.8+dz),(.045,.012,.045),edge,.005)
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
 bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name='Veranda '+material.name;bpy.ops.object.select_all(action='DESELECT')
os.makedirs(os.path.join(root,'assets/blender'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'assets/blender/veranda_furniture.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(root,'public/models/veranda_furniture.glb'),export_format='GLB',export_animations=False)
