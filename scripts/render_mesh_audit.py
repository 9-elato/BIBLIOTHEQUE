"""Render geometry exported by the actual no-window React/Three scene harness.
Usage: blender --background --python scripts/render_mesh_audit.py -- input.json output.png
Canvas lettering/external cover images are excluded by the export, not recreated.
"""
import bpy,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
args=sys.argv[sys.argv.index('--')+1:]
data=json.loads(Path(args[0]).read_text(encoding='utf-8-sig'));output=Path(args[1]).resolve();output.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
points=[]
for i,item in enumerate(data['meshes']):
 a=item['matrixWorld'];m=Matrix([[a[c*4+r] for c in range(4)] for r in range(4)])
 p=item['position'];vertices=[]
 for n in range(0,len(p),3):
  v=m@Vector(p[n:n+3]);vertices.append((v.x,-v.z,v.y))
 points.extend(vertices)
 indices=item['index'] or list(range(len(vertices)));faces=[indices[n:n+3] for n in range(0,len(indices),3)]
 mesh=bpy.data.meshes.new(item['name'] or 'part');mesh.from_pydata(vertices,[],faces);mesh.update()
 obj=bpy.data.objects.new('part-'+str(i),mesh);bpy.context.collection.objects.link(obj)
 material=bpy.data.materials.new('material-'+str(i));material.use_nodes=True;nodes=material.node_tree.nodes;shader=nodes.get('Principled BSDF');values=item['material'];shader.inputs['Base Color'].default_value=(*values['color'],1);shader.inputs['Roughness'].default_value=values['roughness'];shader.inputs['Metallic'].default_value=values['metalness']
 if values['vertexColors'] and item['color']:
  colors=mesh.color_attributes.new(name='color',type='FLOAT_COLOR',domain='POINT')
  source=item['color'];base=values['color']
  for j,c in enumerate(colors.data):c.color=(*(source[j*3+k]*base[k] for k in range(3)),1)
  attr=nodes.new('ShaderNodeVertexColor');attr.layer_name='color';material.node_tree.links.new(attr.outputs['Color'],shader.inputs['Base Color'])
 obj.data.materials.append(material)
 # Preserve Three's authored normals, including flat box edges and smooth round ornaments.
 if item.get('normal'):
  normal_matrix=m.to_3x3().inverted().transposed();normals=[]
  for j in range(0,len(item['normal']),3):
   n=(normal_matrix@Vector(item['normal'][j:j+3])).normalized();normals.append((n.x,-n.z,n.y))
  for face in mesh.polygons:face.use_smooth=True
  mesh.normals_split_custom_set_from_vertices(normals)
low=Vector(tuple(min(p[k] for p in points) for k in range(3)));high=Vector(tuple(max(p[k] for p in points) for k in range(3)));center=(low+high)*.5;extent=max(high-low)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.seed=0
scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.7,.7,.7,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
bpy.ops.object.light_add(type='AREA',location=center+Vector((-3,-5,6)));bpy.context.object.data.energy=900;bpy.context.object.data.size=5
bpy.ops.object.camera_add(location=center+Vector((extent*.8,-extent*1.6,extent*.45)));camera=bpy.context.object;camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=extent*1.3;scene.camera=camera
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(output);bpy.ops.render.render(write_still=True)
