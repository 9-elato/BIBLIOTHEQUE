"""My Little Library — Starlight Attic, Blender 4.x/5.x.
Run in Blender > Scripting > Open > Run Script.
Creates an editable .blend and game-ready .glb under ./output.
Coordinate convention: Blender floor is Z=0; GLB in Three.js has Y-up.
Attic local center = (0,0,0), width 8.4, length 13.4.
In React Three Fiber put glb at position={[-12.2, 8.45, 0]}.
"""
import bpy, math, os, random
from mathutils import Vector

ROOT = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.path.expanduser('~/LibraryAttic')
TEX = os.path.join(ROOT, 'textures')
OUT = os.path.join(ROOT, 'output')
os.makedirs(OUT, exist_ok=True)
random.seed(107)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablock in list(bpy.data.materials):
    if datablock.users == 0: bpy.data.materials.remove(datablock)

main_col = bpy.data.collections.new('ATTIC_EXPORT')
bpy.context.scene.collection.children.link(main_col)
preview_col = bpy.data.collections.new('PREVIEW_ONLY__DO_NOT_EXPORT')
bpy.context.scene.collection.children.link(preview_col)

# All meshes are in ATTIC_EXPORT. Preview lights and camera are excluded from GLB.
def place_in(obj, col=main_col):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    col.objects.link(obj)
    return obj


def mat(name, color, texture=None, roughness=.8, metallic=0, alpha=1):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*color,alpha)
    m.use_nodes=True
    nodes=m.node_tree.nodes
    bsdf=nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*color,1)
    bsdf.inputs['Roughness'].default_value=roughness
    bsdf.inputs['Metallic'].default_value=metallic
    bsdf.inputs['Alpha'].default_value=alpha
    if texture:
        path=os.path.join(TEX,texture+'.png')
        if os.path.isfile(path):
            image=bpy.data.images.load(path, check_existing=True)
            image.pack()
            tex=nodes.new('ShaderNodeTexImage')
            tex.image=image
            tex.interpolation='Linear'
            m.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
    if alpha<1:
        try:m.surface_render_method='BLENDED'
        except Exception:pass
        m.use_nodes=True
    return m

walnut=mat('01 Old walnut / woodgrain',(0.41,.25,.15),'walnut')
oak=mat('02 Warm oak',(0.59,.39,.22),'oak')
plaster=mat('03 Cream plaster',(.89,.82,.69),'plaster')
slate=mat('04 Roof slate',(.27,.30,.34),'slate')
fabric=mat('05 Sage linen',(.49,.56,.50),'fabric',roughness=.96)
blue=mat('06 Dusty blue velvet',(.29,.40,.53),'fabric',roughness=.97)
rose=mat('07 Rust velvet',(.50,.29,.28),'fabric',roughness=.96)
leather=mat('08 Old tan leather',(.46,.26,.19),'leather',roughness=.83)
brass=mat('09 Antique brass',(.61,.42,.18),None,roughness=.31,metallic=.78)
metal=mat('10 Bluish gunmetal',(.24,.29,.34),None,roughness=.4,metallic=.78)
chalk=mat('11 Chalkboard green',(.055,.16,.12),None,roughness=.92)
ivory=mat('12 Parchment',(.91,.86,.76),None,roughness=.95)
glass=mat('13 Sky glass',(.35,.57,.68),None,roughness=.2,metallic=.07,alpha=.42)
black=mat('14 Black rubber',(.07,.07,.075),None,roughness=.8)
red=mat('15 Burgundy rug',(.41,.20,.20),'fabric')
stone=mat('16 Gray sandstone',(.58,.57,.54),'plaster')
lightwood=mat('17 Pale wood accent',(.78,.64,.48),'oak')
ink=mat('18 Black ink',(.09,.11,.12),None,roughness=.85)
bookmats=[mat('Book binding '+str(i),c,'leather') for i,c in enumerate([
 (.45,.22,.21),(.17,.31,.25),(.30,.38,.49),(.62,.43,.26),(.36,.28,.41),(.57,.40,.36),(.26,.27,.26),(.37,.35,.21)])]

def assign(obj, material):
    obj.data.materials.append(material)
    return obj


def bevel(obj, width=.05, seg=2):
    if width<=0: return obj
    modifier=obj.modifiers.new('Edge wear / soft corners','BEVEL')
    modifier.width=width
    modifier.segments=seg
    if hasattr(modifier,'affect'):
        modifier.affect='EDGES'
    modifier.loop_slide=True
    obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return obj


def box(name,xyz,dims,material,bevel_width=0,rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=xyz)
    obj=place_in(bpy.context.object)
    obj.name=name
    obj.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if rotation: obj.rotation_euler=rotation
    assign(obj,material)
    if bevel_width:bevel(obj,bevel_width)
    return obj


def cylinder(name,loc,radius,depth,material,vertices=28,rotation=None,bevel_width=0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    obj=place_in(bpy.context.object); obj.name=name
    if rotation:obj.rotation_euler=rotation
    assign(obj,material)
    if bevel_width:bevel(obj,bevel_width)
    return obj


def sphere(name,loc,scale,material,segments=24,rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    obj=place_in(bpy.context.object);obj.name=name
    obj.scale=scale
    assign(obj,material)
    for face in obj.data.polygons:face.use_smooth=True
    return obj


def rod(name,a,b,r,material,vertices=14):
    a,b=Vector(a),Vector(b)
    d=b-a
    obj=cylinder(name,(a+b)*.5,r,d.length,material,vertices)
    obj.rotation_euler=d.to_track_quat('Z','Y').to_euler()
    return obj


def polygon(name,coords,material,thickness=.07):
    mesh=bpy.data.meshes.new(name+'Mesh')
    mesh.from_pydata(coords,[],[tuple(range(len(coords)))])
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    main_col.objects.link(obj)
    assign(obj,material)
    solid=obj.modifiers.new('Real thickness','SOLIDIFY')
    solid.thickness=thickness
    obj.modifiers.new('Normal weighted','WEIGHTED_NORMAL')
    return obj


def curved_rug():
    seg=56
    radiusx,radiusy=2.35,1.72
    coords=[(math.cos(i*2*math.pi/seg)*radiusx,2.0+math.sin(i*2*math.pi/seg)*radiusy,.043) for i in range(seg)]
    obj=polygon('Oval woven rug - burgundy border',coords,red,.015)
    for radius,material in [(.87,ivory),(.82,red)]:
        coords2=[(math.cos(i*2*math.pi/seg)*radiusx*radius,2.0+math.sin(i*2*math.pi/seg)*radiusy*radius,.07+(1-radius)*.015) for i in range(seg)]
        polygon('Woven rug inset '+str(radius),coords2,material,.008)


def draped_blanket(name,loc,width,height,material):
    x0,y0,z0=loc
    cols,rows=17,22
    verts=[]
    for j in range(rows):
        v=j/(rows-1)
        for i in range(cols):
            u=i/(cols-1)
            x=x0+(u-.5)*width
            y=y0+(v-.5)*height
            z=z0+.045*math.sin(u*20+v*7)+.035*math.sin(v*25)+.025*math.cos(u*35)
            if v>.84:z-=.1*(v-.84)/.16
            verts.append((x,y,z))
    faces=[]
    for j in range(rows-1):
        for i in range(cols-1):
            k=j*cols+i
            faces.append((k,k+1,k+cols+1,k+cols))
    mesh=bpy.data.meshes.new(name+' geometry')
    mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);main_col.objects.link(obj);assign(obj,material)
    obj.modifiers.new('Fabric body','SOLIDIFY').thickness=.02
    obj.modifiers.new('Fabric smoothing','SUBSURF').levels=1
    for face in mesh.polygons:face.use_smooth=True
    return obj


def cush(name,loc,scale,material):
    obj=sphere(name,loc,scale,material,32,22)
    return obj


def lettering(name,body,position,size,material,rot=(0,0,0)):
    curve=bpy.data.curves.new(name,'FONT');curve.body=body;curve.size=size;curve.extrude=.003
    obj=bpy.data.objects.new(name,curve);main_col.objects.link(obj)
    obj.location=position;obj.rotation_euler=rot
    assign(obj,material)
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return obj

# ---------------------------------------------------------
# Architectural shell / loft: floor at z=0, 8.4 x 13.4.
# ---------------------------------------------------------
box('STRUCTURE · floor subdeck',(0,0,-.14),(8.4,13.4,.28),oak,.035)
for i in range(22):
    x=-4.025+i*.385
    box('FLOOR · individual oak plank %02d'%i,(x,0,.012),(.373,13.18,.045),oak,.008)
for y in (-6.64,6.64):
    # Lower end panels separated at rear glazing; no fully opaque wall over glazing.
    box('WALL · end low plinth '+str(y),(0,y,1.07),(8.35,.17,2.12),plaster,.012)
    box('WALL · end top lintel '+str(y),(0,y,4.9),(8.35,.17,.95),plaster,.012)
    for sx in (-3.15,3.15):
        box('WALL · end opening pier '+str((y,sx)),(sx,y,3.05),(2.08,.17,2.02),plaster,.012)
    polygon('GABLE · end triangular infill '+str(y),[(-4.18,y,5.4),(4.18,y,5.4),(0,y,6.4)],plaster,.08)
# Side walls hold shelves and blackboard / screen, naturally lower than ridge.
for side in (-1,1):
    box('WALL · plaster long side '+str(side),(side*4.16,0,1.7),(.19,13.28,3.4),plaster,.02)
    for yy in (-5.2,-2.6,0,2.6,5.2):
        box('WALL · oak vertical wainscot '+str((side,yy)),(side*4.03,yy,.78),(.10,.12,1.56),walnut,.012)
    box('WALL · panel upper trim '+str(side),(side*4.05,0,1.58),(.14,13.15,.10),walnut,.018)
    box('WALL · panel bottom trim '+str(side),(side*4.05,0,.17),(.14,13.15,.11),walnut,.018)

# Roof planes are meshed rectangles with real hole for skylight on the LEFT.
# u=0 at outer eave, u=1 at central ridge.
def roof_pt(side,u,v):
    xx=side*(4.36*(1-u))
    zz=3.55+(6.35-3.55)*u
    return (xx,v,zz)

def roof_quad(label,side,u0,u1,v0,v1):
    p=[roof_pt(side,u0,v0),roof_pt(side,u1,v0),roof_pt(side,u1,v1),roof_pt(side,u0,v1)]
    polygon(label,p,slate,.16)

# Subdivide the left roof around u=0.27..0.68, v=-4.8..-2.65
for side in (1,-1):
    if side==1:
        roof_quad('ROOF · right slate plane',side,0,1,-6.85,6.85)
    else:
        roof_quad('ROOF · left slate front',side,0,1,-6.85,-4.8)
        roof_quad('ROOF · left slate rear',side,0,1,-2.65,6.85)
        roof_quad('ROOF · left skylight outer strip',side,0,.27,-4.8,-2.65)
        roof_quad('ROOF · left skylight inner strip',side,.68,1,-4.8,-2.65)

# Eaves and the old timber trusses.
rod('ROOF · ancient ridge beam',roof_pt(1,1,-6.85),roof_pt(1,1,6.85),.18,walnut)
for side in (-1,1):
    rod('ROOF · eave beam '+str(side),roof_pt(side,0,-6.85),roof_pt(side,0,6.85),.13,walnut)
    for yy in (-5.9,-2.8,.3,3.4,6.0):
        rod('RAFTER · side %s %s'%(side,yy),roof_pt(side,.02,yy),roof_pt(side,.995,yy),.105,walnut)
    for yy in (-6.25,6.25):
        rod('CROSS BRACE '+str((side,yy)),(side*3.85,yy,3.2),(side*.4,yy,6.05),.07,oak)

# Actual glass-filled skylight opening, flush with roof plane.
# Exact four corners match the opening boundary.
frame=[roof_pt(-1,u,v) for u,v in [(.27,-4.8),(.68,-4.8),(.68,-2.65),(.27,-2.65)]]
polygon('SKYLIGHT · transparent panes',frame,glass,.026)
for i,(a,b) in enumerate(zip(frame,frame[1:]+frame[:1])):
    rod('SKYLIGHT · bronze mullion %s'%i,a,b,.065,brass)
rod('SKYLIGHT · cross rail U',roof_pt(-1,.27,-3.72),roof_pt(-1,.68,-3.72),.045,brass)
rod('SKYLIGHT · cross rail V',roof_pt(-1,.475,-4.8),roof_pt(-1,.475,-2.65),.046,brass)
for i in range(12):
    u=random.uniform(.32,.62);v=random.uniform(-4.65,-2.85)
    xyz=roof_pt(-1,u,v)
    sphere('SKYLIGHT · tiny highlight '+str(i),(xyz[0]-.018,xyz[1],xyz[2]+.05),(.02,.025,.013),ivory,8,6)

# Arched rear dormer impression from inside.
box('WINDOW · rear stone sill',(0,-6.54,2.1),(2.6,.25,.16),lightwood,.035)
for xx in (-1.28,1.28):box('WINDOW · rear dark mullion '+str(xx),(xx,-6.55,3.28),(.12,.12,2.3),walnut,.03)
box('WINDOW · rear upper lintel',(0,-6.55,4.45),(2.7,.12,.15),walnut,.02)
polygon('WINDOW · rear glazed opening',[(-1.2,-6.61,2.2),(1.2,-6.61,2.2),(1.2,-6.61,4.35),(-1.2,-6.61,4.35)],glass,.026)
rod('WINDOW · rear crossbar',(-1.25,-6.73,3.3),(1.25,-6.73,3.3),.045,walnut)

# Soft, asymmetrical furniture.
curved_rug()
box('DAYBED · carved frame',(-1.95,.0,.34),(2.65,2.8,.55),walnut,.12,2)
box('DAYBED · linen mattress',(-1.95,0,.71),(2.42,2.62,.26),ivory,.14,3)
box('DAYBED · low rail',(-3.23,.0,.89),(.15,2.68,.9),walnut,.06)
for xx in (-2.73,-2.03):cush('DAYBED · pillow', (xx,-.8,.94),(.45,.42,.17),fabric)
draped_blanket('DAYBED · fallen linen throw',(-2.05,.48,.9),2.45,1.8,blue)

for i,(x,y,colour) in enumerate([(1.22,1.45,blue),(2.7,2.45,fabric),(.5,3.45,rose)]):
    bean=sphere('BEANBAG · sculpted seat '+str(i),(x,y,.43),(.68,.84,.48),colour,32,20)
    for v in bean.data.vertices:
        z=v.co.z
        v.co.z=z-.14*(max(0,-z))
        v.co.x+=.08*math.sin(2.0*v.co.y)
    draped_blanket('BEANBAG · throw '+str(i),(x,y,.83),.75,.65,ivory if i==1 else fabric)

# Movable-style school blackboard on right wall. The geometry is freestanding.
box('CHALKBOARD · oak rim',(3.81,3.7,2.8),(.15,3.1,2.35),walnut,.035)
box('CHALKBOARD · green slate',(3.7,3.7,2.8),(.045,2.88,2.1),chalk,.013)
box('CHALKBOARD · chalk ledge',(3.59,3.72,1.64),(.32,3.14,.08),oak,.02)
# 3D chalk constellations on board plane.
stars=[(2.8,3.26),(3.36,3.73),(4.0,3.18),(4.6,4.06),(4.93,2.92)]
for i,(yy,zz) in enumerate(stars):
    sphere('CHALKBOARD · star dot '+str(i),(3.665,yy,zz),(.014,.04,.04),ivory,8,6)
for i in range(len(stars)-1):
    rod('CHALKBOARD · constellation line '+str(i),(3.659,stars[i][0],stars[i][1]),(3.659,stars[i+1][0],stars[i+1][1]),.009,ivory,8)

# Cinema screen, facing center, opposite chalkboard, with rod and dark frame.
box('CINEMA · vintage screen housing',(3.83,-2.75,3.1),(.20,3.75,2.8),walnut,.035)
box('CINEMA · cream projection surface',(3.682,-2.75,3.1),(.045,3.52,2.5),ivory,.01)
box('CINEMA · black border',(3.653,-2.75,3.1),(.017,3.62,2.6),ink,.0)
box('CINEMA · lit fabric panel',(3.630,-2.75,3.1),(.013,3.46,2.45),ivory,.0)

# Projector tripod, body and lens. It is decorative until wired to JS UI.
for a,ang in enumerate((0,2.094,4.188)):
    rod('PROJECTOR · tripod leg '+str(a),(.45,-1.9,.86),(.45+.38*math.cos(ang),-1.9+.38*math.sin(ang),.03),.032,metal)
box('PROJECTOR · housing',(.45,-1.9,.98),(.78,.52,.37),metal,.08)
cylinder('PROJECTOR · focusing lens',(.92,-1.9,1.0),.15,.22,brass,24,(0,math.pi/2,0),.01)
cylinder('PROJECTOR · convex glass',(1.05,-1.9,1.0),.095,.025,glass,24,(0,math.pi/2,0))

# Telescope on tripod pointing toward skylight.
for a,ang in enumerate((0,2.094,4.188)):
    rod('TELESCOPE · tripod leg '+str(a),(-1.65,-4.6,.98),(-1.65+.54*math.cos(ang),-4.6+.54*math.sin(ang),.04),.042,walnut)
rod('TELESCOPE · pivot',(-1.65,-4.6,.88),(-1.65,-4.6,1.5),.07,brass)
ax=Vector((-.42,.16,.9)).normalized()
a=Vector((-1.65,-4.6,1.54));b=a+ax*1.8
rod('TELESCOPE · optical barrel',a,b,.18,metal,24)
rod('TELESCOPE · ocular lens',a-ax*.20,a+ax*.1,.065,brass)
rod('TELESCOPE · front objective rim',b-ax*.07,b+ax*.12,.20,brass)
sphere('TELESCOPE · objective reflection',b, (.14,.14,.14),glass,16,10)

# Sturdy bookcase, with books made as individually adjustable objects.
box('BOOKCASE · carved frame',(-.3,5.93,1.25),(3.05,.65,2.5),walnut,.09)
for i in range(3):box('BOOKCASE · oak shelf '+str(i),(-.3,5.51, .50+i*.56),(2.82,.75,.09),oak,.012)
for i in range(44):
    row=i//15; col=i%15
    sx=.095+random.random()*.065
    h=.30+random.random()*.18
    x=-1.56+col*.177
    obj=box('BOOK · art volume %02d'%i,(x,5.41,h/2+.56*row+.50),(sx,.27,h),bookmats[i%len(bookmats)],.007)
    obj.rotation_euler[1]=random.uniform(-.028,.028)

# Side cabinet, drawers, map and inkwork.
box('ARCHIVE CABINET · aged walnut',(2.72,5.4,.62),(1.75,.8,1.25),walnut,.06)
for j in range(3):
    box('ARCHIVE CABINET · small drawer '+str(j),(2.72,5.0+j*.37,.37),(.92,.075,.22),oak,.012)
    cylinder('ARCHIVE CABINET · brass knob '+str(j),(2.72,4.95+j*.37,.37),.045,.07,brass,12,(math.pi/2,0,0))

# Ceiling lamps and reading stand with real light objects in GLB? lights kept preview-only.
cylinder('LAMP · brass desk base',(-2.0,4.1,.1),.25,.11,brass,20)
rod('LAMP · bent stem',(-2.0,4.1,.13),(-2.0,4.1,1.28),.035,brass)
sphere('LAMP · milky glass shade',(-2.0,4.1,1.28),(.28,.28,.17),ivory)

# Optional textual plaques for visual orientation.
lettering('STUDY PLAQUE','STARLIGHT ATTIC',(-1.25,6.5,2.7),.22,walnut,(math.pi/2,0,0))

# Preview ONLY camera and lamps, not exported in .glb.
def preview_light(name, loc, energy, color, kind='POINT', size=3):
    data=bpy.data.lights.new(name,kind)
    data.energy=energy
    data.color=color
    if kind=='AREA':data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data)
    preview_col.objects.link(ob)
    ob.location=loc
    return ob
preview_light('Warm chandelier preview',(0,0,4.9),680,(1,.79,.55),'AREA',7)
preview_light('Skylight preview',(-2.5,-3.5,7.2),570,(.72,.84,1),'AREA',5)
preview_light('Bookcase lighting preview',(-1,5.1,3.7),110,(1,.72,.45))

camdata=bpy.data.cameras.new('Camera · entrance view')
cam=bpy.data.objects.new('Camera · entrance view',camdata)
preview_col.objects.link(cam)
cam.location=(2.5,9,3.2)
target=Vector((-.55,-.9,2.3))
cam.rotation_euler=(target-Vector(cam.location)).to_track_quat('-Z','Y').to_euler()
camdata.lens=24
bpy.context.scene.camera=cam
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.samples=48
bpy.context.scene.render.resolution_x=1440
bpy.context.scene.render.resolution_y=900
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.world.color=(.34,.32,.29)

# Save editable Blender file, then export only the ATTIC_EXPORT collection.
blend_path=os.path.join(OUT,'starlight_attic.blend')
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.object.select_all(action='DESELECT')
for ob in main_col.objects:
    if ob.type in {'MESH','EMPTY'}: ob.select_set(True)
try:
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'starlight_attic.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
    print('GLB export successful')
except Exception as exc:
    print('GLB export failed; .blend is saved. Details:',str(exc))
print('Created:',blend_path)
print('Output folder:',OUT)
