# Final proportion/detail pass: keep the arm's animation region, remove boxing gear.
# 01. Remove all glove pieces, wrist bands, lettering and the clenched arm.
for prefix in ['Black glove','UFC glove','Glove finger','UFC lettering','Cream arm R']:
    remove_named(prefix)
# 02. A relaxed elbow bends forward slightly instead of holding a fighting pose.
limb('Cream arm R',[(.61,-.10,1.49,.18,.18),(.78,-.15,1.34,.21,.19),
    (.88,-.23,1.16,.20,.18),(.90,-.32,1.02,.18,.16),(.89,-.38,.94,.13,.12),
    (.88,-.39,.90,.045,.045)],fur)
# 03. Rounded paw and 04. shallow toe creases, all attached to the same moving arm.
for i in [-1,1]:
    line('Right arm raised bare paw crease '+str(i),[(.89+i*.05,-.478,.96),(.89+i*.05,-.49,1.01)],.0025,fur)
for obj in list(root.children_recursive):
    n=obj.name
    # 05. Body depth; 06. a fuller lower belly, with the same floor clearance.
    if n.startswith('Main torso continuous'):
        obj.scale.y*=1.23
        for v in obj.data.vertices:
            v.co.x*=1+.025*math.exp(-((v.co.z-.65)/.25)**2)
    # 07. The jersey encloses the deeper torso rather than intersecting it.
    if n.startswith('Red jersey tailored body'):obj.scale.y*=1.23
    # 08. Hem follows the deeper cloth; 09. sponsor/brand remain on its front.
    if n.startswith('Curved ivory jersey hem'):
        for spline in obj.data.splines:
            for point in spline.bezier_points:point.co.y*=1.23
    if n.startswith(('Jersey sponsor','Three-bar brand')):obj.location.y-=.105
    # 10. Scarf has clearance over the thicker chest.
    if n.startswith(('Hanging scarf','Scarf emblem','Knitted white fringe')):obj.location.y-=.08
    if n.startswith('Thick red white striped'):obj.location.y-=.10
    # 11. Soft foot depth supports the wider body without widening the stance again.
    if n.startswith('Short hindleg'):
        for v in obj.data.vertices:v.co.y=-.10+(v.co.y+.10)*1.06
    # 12. Rear tail root remains seated in the fuller back of the jersey.
    if n.startswith('One-piece curved'):obj.location.y+=.08
# 13. Longer, softer sleeve rim transition at the relaxed shoulder.
for obj in root.children_recursive:
    if obj.name=='Red cuff R':obj.scale.y*=1.04

# Project real knit stitches onto the evaluated folded fabric; avoid floating dots.
bpy.context.view_layer.update()
cloth=bpy.data.objects.get('Hanging scarf soft wool drape')
stitches=bpy.data.objects.get('Hanging scarf raised yarn stitches')
if cloth and stitches:
    evaluated=cloth.evaluated_get(bpy.context.evaluated_depsgraph_get())
    cloth_inv=cloth.matrix_world.inverted();stitch_inv=stitches.matrix_world.inverted()
    for vertex in stitches.data.vertices:
        world=stitches.matrix_world@vertex.co
        origin=cloth_inv@Vector((world.x,-3,world.z))
        direction=(cloth_inv.to_3x3()@Vector((0,1,0))).normalized()
        hit,point,normal,index=evaluated.ray_cast(origin,direction)
        if hit:
            surface=cloth.matrix_world@point;surface.y-=.0025
            vertex.co=stitch_inv@surface
