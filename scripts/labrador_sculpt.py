# Continuous sculpted limbs and a fitted, backwards cap.
def loft(name, profiles, material, segments=24):
    vv=[];ff=[]
    for x,y,z,rx,ry in profiles:
        for j in range(segments):
            a=j*2*pi/segments;vv.append((x+rx*cos(a),y+ry*sin(a),z))
    for i in range(len(profiles)-1):
        for j in range(segments):
            k=i*segments+j;n=i*segments+(j+1)%segments
            ff.append((k,n,n+segments,k+segments))
    ff += [tuple(reversed(range(segments))),tuple(range((len(profiles)-1)*segments,len(vv)))]
    return geometry(name,vv,ff,[material],subsurf=1)

def limb(name,profiles,material,segments=20):
    vv=[];ff=[]
    for i,(x,y,z,rw,rd) in enumerate(profiles):
        p=Vector((x,y,z));a=Vector(profiles[max(0,i-1)][:3]);b=Vector(profiles[min(len(profiles)-1,i+1)][:3]);t=(b-a).normalized()
        u=t.cross(Vector((0,1,0))).normalized();v=t.cross(u).normalized()
        for j in range(segments):
            angle=j*2*pi/segments;vv.append(tuple(p+u*(rw*cos(angle))+v*(rd*sin(angle))))
    for i in range(len(profiles)-1):
        for j in range(segments):
            k=i*segments+j;n=i*segments+(j+1)%segments;ff.append((k,n,n+segments,k+segments))
    ff += [tuple(reversed(range(segments))),tuple(range((len(profiles)-1)*segments,len(vv)))]
    return geometry(name,vv,ff,[material],subsurf=1)

for prefix in ['Main torso','Short hindleg','Rounded paw','Tiny paw crease','Cream arm','Right arm raised','Left soft hand']:
    remove_named(prefix)
loft('Main torso continuous',[(0,.04,.27,.29,.28),(0,.04,.38,.46,.35),(0,.04,.65,.58,.42),(0,.04,1.03,.58,.43),(0,.04,1.38,.48,.35),(0,.04,1.62,.35,.28)],fur)
for sign,side in [(-1,'L'),(1,'R')]:
    x=sign*.34
    loft('Short hindleg '+side,[(x,-.16,.035,.23,.28),(x,-.17,.065,.28,.32),(x,-.17,.15,.29,.32),(x,-.12,.26,.26,.27),(x,-.02,.40,.22,.21),(x,.02,.61,.22,.22)],fur)
    for dx in [-.085,.085]:
        line('Tiny paw crease '+side+str(dx),[(x+dx,-.46,.08),(x+dx,-.45,.15),(x+dx,-.41,.20)],.004,ear_fur)
limb('Cream arm L',[(-.58,-.09,1.53,.18,.18),(-.72,-.18,1.43,.22,.20),(-.9,-.43,1.34,.21,.17),(-1.10,-.69,1.27,.18,.13),(-1.23,-.86,1.18,.15,.09),(-1.20,-.94,1.07,.10,.065),(-1.16,-.95,1.02,.025,.025)],fur)
limb('Cream arm R',[(.59,-.06,1.52,.18,.18),(.77,-.04,1.34,.21,.20),(.91,-.09,1.18,.21,.20),(1.00,-.20,1.23,.20,.18),(1.00,-.34,1.43,.18,.17),(.98,-.4,1.57,.16,.15)],fur)
# Tailored sleeves follow the upper arms; cuffs no longer float at the elbow.
for prefix in ['White uniform sleeve','Red cuff','Inset shoulder stripe']:remove_named(prefix)
for sign,side in [(-1,'L'),(1,'R')]:
    limb('White uniform sleeve '+side,[(sign*.52,-.05,1.56,.18,.18),(sign*.65,-.11,1.49,.25,.22),(sign*.78,-.20,1.38,.225,.20)],jersey_wht)
    limb('Red cuff '+side,[(sign*.755,-.18,1.40,.232,.205),(sign*.795,-.215,1.365,.232,.205)],jersey_red)
    for j in range(3):
        x=sign*(.57+j*.058)
        line('Inset shoulder stripe '+side+str(j),[(x,-.30,1.56),(x+sign*.06,-.34,1.49)],.008,jersey_red)
# A padded fingerless glove with a broad palm and folded fingers, not a sphere.
for prefix in ['Black glove','Glove finger','UFC glove']:remove_named(prefix)
loft('Black glove right fist',[(.98,-.43,1.48,.16,.12),(.98,-.46,1.56,.20,.15),(.98,-.48,1.70,.23,.18),(.96,-.47,1.85,.22,.17),(.94,-.44,1.92,.16,.12),(.94,-.44,1.94,.09,.08)],glove_black)
box('UFC glove red wristband',(.98,-.43,1.52),(.37,.29,.12),glove_red,.045)
box('UFC glove black strap',(.98,-.43,1.46),(.36,.29,.045),glove_black,.015)
limb('Black glove thumb',[(.77,-.42,1.76,.08,.08),(.74,-.53,1.69,.085,.075),(.81,-.61,1.64,.075,.06),(.86,-.60,1.65,.025,.025)],glove_black,16)
for i in range(3):
    x=.84+i*.09
    line('Glove finger crease '+str(i),[(x,-.57,1.87),(x,-.62,1.83),(x,-.64,1.78)],.006,glove_pad)
label_obj=bpy.data.objects.get('UFC lettering on glove');label_obj.location=(.98,-.673,1.72)
# Subtle crease lines lie on the fingers that curl over the ball.
for i in [-1,1]:
    line('Left soft hand finger crease '+str(i),[(-1.20+i*.035,-.99,1.075),(-1.21+i*.035,-.98,1.13)],.0035,ear_fur)
# Fully fitted cap: deeper crown hugging the skull and rear-facing curved visor.
remove_named('Red snapback cap crown');remove_named('Cap panel seam');remove_named('Cap top covered');remove_named('Sideways red cap brim');remove_named('Cap UFC lettering')
profiles=[(0,-.015,2.80,.96,.68),(0,-.015,2.88,.96,.68),(0,-.015,3.04,.89,.64),(0,-.015,3.23,.73,.53),(0,-.015,3.41,.49,.36),(0,-.015,3.51,.22,.16),(0,-.015,3.54,.035,.03)]
cap=loft('Red snapback cap crown',profiles,cap_red,48)
bpy.context.view_layer.objects.active=cap
for mod in list(cap.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
# The aperture is cut through a solid crown; the head fills the interior.
cutter=sphere('temporary fitted cap aperture',(0,-.67,2.88),(.34,.40,.31),fur,32,20)
mod=cap.modifiers.new('Rear strap opening','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
bpy.context.view_layer.objects.active=cap;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
strap=bpy.data.objects.get('Black cap adjustment strap');strap.location=(0,-.728,2.86)
for obj in root.children_recursive:
    if obj.name.startswith('Small strap hole'):obj.location.y=-.769;obj.location.z=2.86
sphere('Cap top covered button',(0,-.015,3.54),(.085,.075,.036),cap_red,20,12)
for a in [-2.8,-2.2,-.85,.2,1.4]:
    line('Cap panel seam '+str(a),[(rx*cos(a),y+ry*sin(a),z+.006) for x,y,z,rx,ry in profiles[:-1]],.003,cap_red)
# A broad rear brim curves down around the head, with just its right edge visible.
v=[];f=[]
for row in range(3):
    for j in range(17):
        a=-.55+j*pi*.55/16;r=.88+row*.17
        v.append((r*cos(a),.03+r*.76*sin(a),2.96-.03*row-.012*sin(a)))
for row in range(2):
    for j in range(16):k=row*17+j;f.append((k,k+1,k+18,k+17))
brim=geometry('Sideways red cap brim',v,f,[cap_red],subsurf=1)
solid=brim.modifiers.new('Visor thickness','SOLIDIFY');solid.thickness=.045
label('Cap UFC lettering','UFC',.53,-.60,3.13,.25,letter_mat)
# Recalculate normals and UVs on the new closed organic meshes.
import bmesh
for obj in root.children_recursive:
    if obj.type!='MESH':continue
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(obj.data);bm.free()
    if not obj.data.uv_layers:
        uv=obj.data.uv_layers.new(name='SurfaceUV')
        for loop in obj.data.loops:
            p=obj.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(p.x*.5+.5,p.z*.5+.5)
