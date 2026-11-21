# Fuse the cheek and ear roots into a single softly blended plush surface.
head=bpy.data.objects.get('Giant round Labrador head')
ears=[o for o in root.children_recursive if o.name.startswith('Sculpted floppy ear')]
# Give the lower face a full, rounded cheek/jaw rather than a wide flat oval.
for vertex in head.data.vertices:
    p=vertex.co
    lower=max(0,min(1,(-p.z+.30)/.90))
    p.z-=.10*lower
    p.x*=1+.035*lower
    if p.y<0:p.y-=.055*lower*(1-min(1,abs(p.x)))
for obj in root.children_recursive:
    if obj.name.startswith('Smiling mouth'):obj.location.y-=.045
# Lower ears hang slightly in front of the cheeks while their roots stay tucked in.
for ear in ears:
    for vertex in ear.data.vertices:
        fall=max(0,min(1,(2.80-vertex.co.z)/.65))
        vertex.co.y-=.14*fall
        vertex.co.z-=.15*fall**1.7
        center=math.copysign(1.04,vertex.co.x)
        vertex.co.x=center+(vertex.co.x-center)*(1-.12*fall)
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
# A padded scarf end with changing width, uneven folds and a curled lower hem.
rows=32;cols=8;vv=[];ff=[];ids=[]
def scarf_point(t,u,back=False):
    cx=.48+.14*t+.075*sin(t*2*pi)
    cy=-.48-.28*sin(t*pi*.65)-.13*sin(t*pi*2.1)
    width=.205+.028*sin(t*pi*2+.5)
    twist=.65*sin(t*pi*1.8)-.25
    # Rounded, padded edges and a loose longitudinal fold, not a rigid ribbon.
    padding=.025+.075*max(0,1-u*u)**.5
    fold=.055*cos(u*pi*1.5+t*3)*sin(pi*t)
    z=1.71-1.08*t+.045*sin(t*3*pi)+.075*u*sin(t*pi*1.5)
    y=cy+(padding if back else -padding)+width*u*sin(twist)+fold
    return (cx+width*u*cos(twist),y,z)
for back in [False,True]:
    for i in range(rows+1):
        for j in range(cols+1):vv.append(scarf_point(i/rows,2*j/cols-1,back))
stride=cols+1;layer=(rows+1)*stride
for back in [False,True]:
    offset=layer if back else 0
    for i in range(rows):
        for j in range(cols):
            k=offset+i*stride+j
            ff.append((k+stride,k+stride+1,k+1,k) if not back else (k,k+1,k+stride+1,k+stride));ids.append((i//5)%2)
for i in range(rows):
    for j in [0,cols]:
        k=i*stride+j;ff.append((k,k+stride,k+stride+layer,k+layer));ids.append((i//5)%2)
for i in [0,rows]:
    for j in range(cols):
        k=i*stride+j;ff.append((k,k+layer,k+layer+1,k+1));ids.append((i//5)%2)
scarf_mesh=geometry('Hanging scarf soft wool drape',vv,ff,[scarf_red,scarf_cream],ids,subsurf=1)
# Follow the cloth's own coordinates so knit stitches bend with the folds.
uv=scarf_mesh.data.uv_layers.new(name='KnitAlongDrape')
for loop in scarf_mesh.data.loops:
    local=loop.vertex_index%layer
    row,col=divmod(local,stride)
    uv.data[loop.index].uv=(col/cols*.30,row/rows*.95)
for i in range(5):
    x,y,z=scarf_point(1,(i-2)*.37)
    limb('Knitted white fringe curled '+str(i),[(x,y+.03,z+.025,.028,.028),(x+.012,y+.015,z-.045,.032,.032),(x+.025,y+.025,z-.10,.025,.025),(x+.021,y+.035,z-.12,.008,.008)],scarf_cream,10)
ex,ey,ez=scarf_point(.65,0)
cannon_symbol('Scarf emblem knit',ex,ey-.012,ez,.16,scarf_cream)

# Keep the raised glove in front of the longer ear rather than intersecting it.
for obj in root.children_recursive:
    if obj.name.startswith(('Black glove','UFC glove','Glove finger','UFC lettering')):obj.location.y-=.12
    elif obj.name=='Cream arm R':
        for vertex in obj.data.vertices:
            vertex.co.y-=.12*max(0,min(1,(vertex.co.z-1.30)/.25))
