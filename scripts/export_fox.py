import bpy,os
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type not in {'MESH','CURVE','EMPTY'}:continue
 o.select_set(True)
 if o.name.startswith('Sculpted ear'):
  o.data.materials[0]=bpy.data.materials.get('Apricot coat')
  o.data.materials[1]=bpy.data.materials.get('Chestnut tips')
 for m in o.modifiers:
  if m.type=='SUBSURF':m.levels=1;m.render_levels=1
 if o.type=='CURVE':o.data.resolution_u=8;o.data.bevel_resolution=2
bpy.ops.export_scene.gltf(filepath=os.path.abspath('public/models/fox_librarian.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False)
