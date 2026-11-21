# Fuse the cheek and ear roots into a single softly blended plush surface.
head=bpy.data.objects.get('Giant round Labrador head')
ears=[o for o in root.children_recursive if o.name.startswith('Sculpted floppy ear')]
# Give the lower face a full, rounded cheek/jaw rather than a wide flat oval.
for vertex in head.data.vertices:
    p=vertex.co
    lower=max(0,min(1,(-p.z+.30)/.90))
    p.z-=.10*lower
    p.x*=1+.065*lower
    if p.y<0:p.y-=.055*lower*(1-min(1,abs(p.x)))
for obj in root.children_recursive:
    if obj.name.startswith('Smiling mouth'):obj.location.y-=.045
# Lower ears hang slightly in front of the cheeks while their roots stay tucked in.
for ear in ears:
    for vertex in ear.data.vertices:
        fall=max(0,min(1,(2.80-vertex.co.z)/.65))
        vertex.co.y-=.18*fall
        vertex.co.z-=.15*fall**1.7
        center=math.copysign(1.04,vertex.co.x)
        vertex.co.x=center+(vertex.co.x-center)*(1-.03*fall)
        vertex.co.x+=math.copysign(.06*sin(pi*fall),vertex.co.x)
bpy.ops.object.select_all(action='DESELECT')
for obj in [head]+ears:
    bpy.context.view_layer.objects.active=obj
    for modifier in list(obj.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(True)
bpy.context.view_layer.objects.active=head;bpy.ops.object.join()
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
remesh=head.modifiers.new('Blend cheek and floppy ear roots','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.033
bpy.ops.object.modifier_apply(modifier=remesh.name)
soft=head.modifiers.new('Plush root smoothing','SMOOTH');soft.factor=.65;soft.iterations=4
bpy.ops.object.modifier_apply(modifier=soft.name)
dec=head.modifiers.new('Preserve silhouette web budget','DECIMATE');dec.ratio=.28
bpy.ops.object.modifier_apply(modifier=dec.name)
head.data.materials.clear();head.data.materials.append(fur)
for polygon in head.data.polygons:polygon.material_index=0;polygon.use_smooth=True
# A shallow sculpted valley separates each hanging ear from its cheek.
# The root remains fused; no dark painted outline or disconnected ear sphere.
for vertex in head.data.vertices:
    world=head.matrix_world@vertex.co;x,y,z=world
    if y<-.22 and 2.00<z<2.80:
        t=(z-2.00)/.8;edge=.88+.12*(1-t)
        valley=math.exp(-((abs(x)-edge)/.055)**2)*(sin(pi*t)**.65)
        vertex.co.y+=.115*valley
        if abs(x)>1.08:vertex.co.y-=.035*sin(pi*t)
# Short, sparse plush fibres add a soft silhouette without a costly hair system.
head.data.update();rng=random.Random(81);fv=[];ffib=[]
for face in rng.sample(list(head.data.polygons),min(650,len(head.data.polygons))):
    center=head.matrix_world@face.center
    normal=(head.matrix_world.to_3x3()@face.normal).normalized()
    tangent=normal.cross(Vector((0,0,1)))
    if tangent.length<.01:tangent=normal.cross(Vector((0,1,0)))
    tangent.normalize();bitangent=normal.cross(tangent)
    tip=center+normal*(.009+rng.random()*.008)
    for direction in (tangent,bitangent):
        k=len(fv);fv.extend((tuple(center-direction*.004),tuple(center+direction*.004),tuple(tip)))
        ffib.append((k,k+1,k+2))
geometry('Cream plush short surface fibres',fv,ffib,[fur])
# Keep the underside tips full and round, with a clear dropped silhouette.
# A knitted wrap sags at the front; its cross-section varies like loosely folded wool.
for prefix in ['Thick red white striped','Hanging scarf','Knitted white fringe','Scarf emblem']:remove_named(prefix)
vv=[];ff=[];ids=[];rings=64;cross=12
for i in range(rings):
    a=i*2*pi/rings;front=max(0,-sin(a));h=1.77-.25*front+.045*cos(3*a+.4)
    radius=.17+.025*sin(2*a+.4)
    for j in range(cross):
        t=j*2*pi/cross
        # Soft lengthwise tuck along the front of the loosely wrapped knit.
        tuck=.18*front*math.exp(-((math.atan2(sin(t-pi),cos(t-pi))-.20)/.30)**2)
        fold=1+.10*cos(2*t+a)+.06*sin(3*a)-tuck
        vv.append(((.65+radius*fold*cos(t))*cos(a),-.025+(.46+radius*fold*cos(t))*sin(a),h+radius*.9*sin(t)))
for i in range(rings):
    for j in range(cross):
        k=i*cross+j;n=i*cross+(j+1)%cross;nk=((i+1)%rings)*cross+j;nn=((i+1)%rings)*cross+(j+1)%cross
        ff.append((k,nk,nn,n));ids.append((i//8)%2)
geometry('Thick red white striped relaxed knit wrap',vv,ff,[scarf_red,scarf_cream],ids,subsurf=1)
# Swept elliptical wool cross-sections replace the front/back sheet construction.
# Rounded edges stay padded through a single gravity-led bend; no hard ribbon twist.
rows=36;cross=16;vv=[];ff=[];ids=[]
def scarf_center(t):
    return (.49+.13*t+.055*sin(2*pi*t),-.53-.19*sin(pi*t*.8)-.07*sin(2*pi*t),1.70-1.08*t)
def scarf_point(t,u,back=False):
    x,y,z=scarf_center(t)
    width=.20+.018*sin(pi*t)
    depth=.105+.02*sin(pi*t)
    roll=.16*sin(pi*t)-.08
    return (x+width*u,y+(1 if back else -1)*depth*math.sqrt(max(0,1-u*u))+width*u*roll,z+.025*u*sin(pi*t))
for i in range(rows+1):
    t=i/rows;x,y,z=scarf_center(t)
    # Soft gathered fold near the shoulder; free end has a gently rounded hem.
    hem=.72+.28*min(1,min(t,1-t)*18)
    width=(.20+.018*sin(pi*t))*hem
    depth=(.105+.02*sin(pi*t))*hem
    for j in range(cross):
        a=2*pi*j/cross;u=cos(a)
        gather=.018*sin(3*a+.6)*math.exp(-((t-.18)/.2)**2)
        vv.append((x+width*u,y+depth*sin(a)+.025*u*sin(pi*t)+gather,z+.025*u*sin(pi*t)))
for i in range(rows):
    for j in range(cross):
        k=i*cross+j;n=i*cross+(j+1)%cross
        ff.append((k,n,n+cross,k+cross));ids.append((i//6)%2)
ff.append(tuple(reversed(range(cross))));ids.append(0)
ff.append(tuple(rows*cross+j for j in range(cross)));ids.append(1)
scarf_mesh=geometry('Hanging scarf soft wool drape',vv,ff,[scarf_red,scarf_cream],ids,subsurf=1)
uv=scarf_mesh.data.uv_layers.new(name='KnitAlongDrape')
for polygon in scarf_mesh.data.polygons:
    for li in polygon.loop_indices:
        row,col=divmod(scarf_mesh.data.loops[li].vertex_index,cross)
        uv.data[li].uv=(col/cross*.55,row/rows*.95)
for i in range(5):
    x,y,z=scarf_point(1,(i-2)*.37)
    limb('Knitted white fringe curled '+str(i),[(x,y+.03,z+.025,.028,.028),(x+.012,y+.015,z-.045,.032,.032),(x+.025,y+.025,z-.10,.025,.025),(x+.021,y+.035,z-.12,.008,.008)],scarf_cream,10)
ex,ey,ez=scarf_point(.65,0)
cannon_symbol('Scarf emblem knit',ex,ey-.045,ez,.16,scarf_cream)

# Keep the raised glove in front of the longer ear rather than intersecting it.
for obj in root.children_recursive:
    if obj.name.startswith(('Black glove','UFC glove','Glove finger','UFC lettering')):obj.location.y-=.12
    elif obj.name=='Cream arm R':
        for vertex in obj.data.vertices:
            vertex.co.y-=.12*max(0,min(1,(vertex.co.z-1.30)/.25))
