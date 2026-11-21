# Separate overlapping ears and a broad, softly flattened round head.
head=bpy.data.objects.get('Giant round Labrador head')
ears=[o for o in root.children_recursive if o.name.startswith('Sculpted floppy ear')]
# Give the lower face a full, rounded cheek/jaw rather than a wide flat oval.
for vertex in head.data.vertices:
    p=vertex.co
    lower=max(0,min(1,(-p.z+.30)/.90))
    p.z-=.085*lower
    p.z+=.12*lower*min(1,abs(p.x))**2
    p.x*=1+.045*lower
    if p.y<0:p.y-=.055*lower*(1-min(1,abs(p.x)))
for obj in root.children_recursive:
    if obj.name.startswith('Smiling mouth'):obj.location.y-=.045
# Lower ears hang slightly in front of the cheeks while their roots stay tucked in.
for ear in ears:
    for vertex in ear.data.vertices:
        fall=max(0,min(1,(2.80-vertex.co.z)/.65))
        # Thicken the hanging lobe around its centre without detaching its root.
        cy=-.04-.29*fall
        vertex.co.y=cy+(vertex.co.y-cy)*(1+.65*fall)
        vertex.co.y-=.24*fall
        vertex.co.z=2.85+(vertex.co.z-.15*fall**1.7-2.85)*.78
        center=math.copysign(1.04,vertex.co.x)
        vertex.co.x=center+(vertex.co.x-center)*(1-.03*fall)
        vertex.co.x+=math.copysign(.07*sin(pi*fall)-.10*fall,vertex.co.x)
# Keep each ear independent: its narrow root overlaps the cheek, its lobe stays free.
for ear in ears:
    ear.data.materials.clear();ear.data.materials.append(fur)
    for polygon in ear.data.polygons:polygon.material_index=0;polygon.use_smooth=True
bpy.ops.object.select_all(action='DESELECT')
head.select_set(True);bpy.context.view_layer.objects.active=head
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
# The head remains an uninterrupted broad rounded surface with a gently flat chin.
for vertex in head.data.vertices:
    if vertex.co.z<-.68:vertex.co.z=-.68+(vertex.co.z+.68)*.45
head.data.materials.clear();head.data.materials.append(fur)
for polygon in head.data.polygons:polygon.material_index=0;polygon.use_smooth=True
# Short, sparse plush fibres add a soft silhouette without a costly hair system.
head.data.update();rng=random.Random(81);fv=[];ffib=[]
for face in rng.sample(list(head.data.polygons),min(800,len(head.data.polygons))):
    center=head.matrix_world@face.center
    normal=(head.matrix_world.to_3x3()@face.normal).normalized()
    tangent=normal.cross(Vector((0,0,1)))
    if tangent.length<.01:tangent=normal.cross(Vector((0,1,0)))
    tangent.normalize();bitangent=normal.cross(tangent)
    tip=center+normal*(.004+rng.random()*.004)
    for direction in (tangent,bitangent):
        k=len(fv);fv.extend((tuple(center-direction*.0015),tuple(center+direction*.0015),tuple(tip)))
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
        vv.append(((.65+radius*.62*fold*cos(t))*cos(a),-.025+(.46+radius*.62*fold*cos(t))*sin(a),h+radius*.9*sin(t)))
for i in range(rings):
    for j in range(cross):
        k=i*cross+j;n=i*cross+(j+1)%cross;nk=((i+1)%rings)*cross+j;nn=((i+1)%rings)*cross+(j+1)%cross
        ff.append((k,nk,nn,n));ids.append((i//8)%2)
geometry('Thick red white striped relaxed knit wrap',vv,ff,[scarf_red,scarf_cream],ids,subsurf=1)
# Broad knitted cloth folds over the shoulder, then opens under its own weight.
# Flattened rounded sections preserve wool thickness without a tubular silhouette.
rows=36;cross=16;vv=[];ff=[];ids=[]
def scarf_center(t):
    return (.46+.20*t+.04*sin(2*pi*t),-.52-.28*(1-math.exp(-13*t))+.045*t-.045*sin(2*pi*t),1.73-1.09*t**1.15)
def scarf_point(t,u,back=False):
    x,y,z=scarf_center(t)
    width=.16+.085*(1-math.exp(-5*t))
    depth=.057+.025*math.exp(-((t-.15)/.16)**2)
    crease=.075*cos(pi*u+.5*sin(pi*t))*math.exp(-((t-.28)/.40)**2)
    return (x+width*u,y+crease+(1 if back else -1)*depth,z+.035*u*sin(pi*t))
for i in range(rows+1):
    t=i/rows;x,y,z=scarf_center(t)
    # Soft gathered fold near the shoulder; free end has a gently rounded hem.
    hem=.94+.06*min(1,min(t,1-t)*30)
    width=(.16+.085*(1-math.exp(-5*t)))*hem
    depth=(.057+.025*math.exp(-((t-.15)/.16)**2))*hem
    for j in range(cross):
        a=2*pi*j/cross
        u=math.copysign(abs(cos(a))**.65,cos(a))
        v=math.copysign(abs(sin(a))**.65,sin(a))
        crease=.075*cos(pi*u+.5*sin(pi*t))*math.exp(-((t-.28)/.40)**2)
        vv.append((x+width*u,y+depth*v+crease,z+.035*u*sin(pi*t)))
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

# Low-profile real yarn loops: readable knit relief even in soft studio lighting.
# One shared mesh, two existing yarn materials, no per-stitch draw calls.
yarn_vertices=[];yarn_faces=[];yarn_ids=[]
for row in range(24):
    t=.08+row*.036
    for col in range(10):
        u=(col-4.5)*.18
        start=len(yarn_vertices)
        for du,dt in [(-.055,-.012),(-.057,.001),(0,.014),(.057,.001),(.055,-.012)]:
            x,y,z=scarf_point(t+dt,u+du)
            yarn_vertices.extend(((x-.002,y-.018,z),(x+.002,y-.018,z)))
        for section in range(4):
            a=start+section*2
            yarn_faces.append((a,a+1,a+3,a+2));yarn_ids.append((int(t*rows)//6)%2)
geometry('Hanging scarf raised yarn stitches',yarn_vertices,yarn_faces,[scarf_red,scarf_cream],yarn_ids)

# Keep the raised glove in front of the longer ear rather than intersecting it.
for obj in root.children_recursive:
    if obj.name.startswith(('Black cap adjustment','Small strap hole')):obj.location.y+=.095
    if obj.name.startswith(('Black glove','UFC glove','Glove finger','UFC lettering')):obj.location.y-=.12
    elif obj.name=='Cream arm R':
        for vertex in obj.data.vertices:
            vertex.co.y-=.12*max(0,min(1,(vertex.co.z-1.30)/.25))

# Enlarge the complete football (panels, seams and crest) together, then refit the palm.
# Broader short legs and slightly wider stance; keep the soles on the same floor.
for obj in root.children_recursive:
    if obj.name.startswith('Short hindleg'):
        sign=-1 if obj.name.endswith('L') else 1
        for vertex in obj.data.vertices:
            vertex.co.x=sign*.39+(vertex.co.x-sign*.34)*1.13
    elif obj.name.startswith('Tiny paw crease'):
        for spline in obj.data.splines:
            for point in spline.bezier_points:
                sign=-1 if point.co.x<0 else 1
                point.co.x=sign*.39+(point.co.x-sign*.34)*1.13
ball_center=Vector((-1,-.56,1.03))
ball_shift=Vector((0,-.08,-.04))
ball_transform=Matrix.Translation(ball_center+ball_shift) @ Matrix.Scale(1.35,4) @ Matrix.Translation(-ball_center)
bpy.context.view_layer.update()
for obj in root.children_recursive:
    if obj.name.startswith(('Classic 32-panel','Football cannon','Football panel seam')):
        obj.matrix_world=ball_transform @ obj.matrix_world
    elif obj.name=='Cream arm L':
        for vertex in obj.data.vertices:
            p=vertex.co;weight=max(0,min(1,(-p.y-.25)/.50))
            target=ball_center+(p-ball_center)*1.35+ball_shift
            p+=weight*(target-p)
            # Flatten the contact patch against the ball's upper hemisphere.
            offset=p-(ball_center+ball_shift)
            if weight>.5 and p.z>1.05 and offset.length<.50:
                p[:]=tuple(ball_center+ball_shift+offset.normalized()*.493)
    elif obj.name.startswith('Left soft hand finger crease'):
        obj.matrix_world=ball_transform @ obj.matrix_world
