# Fuse the cheek and ear roots into a single softly blended plush surface.
head=bpy.data.objects.get('Giant round Labrador head')
ears=[o for o in root.children_recursive if o.name.startswith('Sculpted floppy ear')]
# Lower ears hang slightly in front of the cheeks while their roots stay tucked in.
for ear in ears:
    for vertex in ear.data.vertices:
        fall=max(0,min(1,(2.80-vertex.co.z)/.65))
        vertex.co.y-=.14*fall
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
    a=i*2*pi/rings;front=max(0,-sin(a));h=1.75-.15*front+.025*cos(3*a+.4)
    radius=.14+.018*sin(2*a+.4)
    for j in range(cross):
        t=j*2*pi/cross
        vv.append(((.65+radius*cos(t))*cos(a),-.025+(.46+radius*cos(t))*sin(a),h+radius*.9*sin(t)))
for i in range(rings):
    for j in range(cross):
        k=i*cross+j;n=i*cross+(j+1)%cross;nk=((i+1)%rings)*cross+j;nn=((i+1)%rings)*cross+(j+1)%cross
        ff.append((k,nk,nn,n));ids.append((i//8)%2)
geometry('Thick red white striped relaxed knit wrap',vv,ff,[scarf_red,scarf_cream],ids,subsurf=1)
# A padded scarf end with changing width, uneven folds and a curled lower hem.
rows=32;cols=8;vv=[];ff=[];ids=[]
def scarf_point(t,u,back=False):
    cx=.48+.20*t+.035*sin(t*2*pi)
    cy=-.43-.30*sin(t*pi*.65)-.022*sin(t*3*pi)
    width=.17+.018*sin(t*pi*2+.5)
    z=1.70-1.08*t+.016*sin(t*3*pi)+.035*u*sin(t*pi*1.5)
    y=cy+(.07 if back else -.085-.027*(1-u*u))+.035*u*sin(t*2*pi)+.010*sin(u*pi*2+t*pi*2)
    return (cx+width*u,y,z)
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
geometry('Hanging scarf soft wool drape',vv,ff,[scarf_red,scarf_cream],ids,subsurf=1)
for i in range(5):
    x,y,z=scarf_point(1,(i-2)*.37)
    limb('Knitted white fringe curled '+str(i),[(x,y+.03,z+.025,.028,.028),(x+.012,y+.015,z-.045,.032,.032),(x+.025,y+.025,z-.10,.025,.025),(x+.021,y+.035,z-.12,.008,.008)],scarf_cream,10)
cannon_symbol('Scarf emblem knit',.59,-.844,1.00,.16,scarf_cream)
