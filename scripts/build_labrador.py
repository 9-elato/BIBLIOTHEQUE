# -*- coding: utf-8 -*-
"""
아스날 응원 / UFC 래브라도 캐릭터 — Blender 4.3 이상
=======================================================
실행: Blender > Scripting > Open > 파일 열기 > Run Script

모델 구성:
  - 크림색 래브라도: 동그란 머리, 처진 귀, 검은 타원형 눈, 작은 미소
  - 빨간 UFC 스냅백 (뒤로 쓴 스타일)
  - 붉은 축구 유니폼: 흰 3줄 마크 + Emirates / FLY BETTER
       * 아스날 '방패' 문양은 일부러 넣지 않습니다.
  - 빨강/흰색 목도리 + 대포(캐넌) 모티프
  - 검정/흰색 축구공(실제 12각/20각 패널) + 붉은 대포 모티프
  - 오른손 검정 UFC MMA 장갑 / 왼손은 축구공을 잡는 포즈

출력: C:/output/Labrador_Arsenal/ (원본 및 미리보기)
웹 모델: public/models/labrador_arsenal.glb
첨부 Blender 스크립트 기반: 웹용 면 수, 애니메이션 피벗, 재질별 병합 적용.
    Labrador_Arsenal_UFC.blend : 수정 가능한 Blender 원본
    Labrador_Arsenal_UFC.png   : Cycles 정면 렌더
    Labrador_Arsenal_UFC.glb   : Three.js 등에서 사용할 3D 모델

주의: 실행 시 현재 Blender 장면을 초기화합니다. 미저장 파일은 먼저 저장하세요.
참고 이미지를 바탕으로 한 간결한 절차적 3D 모델입니다. 참조 사진을
완전히 복제하는 포토그래메트리 결과는 아닙니다.
"""
import bpy
import math
import os
from math import sin, cos, pi
from mathutils import Vector

# 0. 사용자가 조절하는 옵션 ---------------------------------------------
OUTPUT_DIR = os.path.abspath("C:/output/Labrador_Arsenal")
SAVE_BLEND = True
RENDER_PNG = True       # 빠른 모델 확인만 할 때 False
EXPORT_GLB = True
RENDER_SIZE = 700
RENDER_SAMPLES = 24
PASTEL_BG = True
ADD_UFC_CAP = True
ADD_YELLOW_FX = False

# 모델 디자인 색상: 6자리 sRGB HEX
FUR_HEX   = "FFE0B6"   # 크림 래브라도
EAR_HEX   = "F9DFBD"   # 귀 안쪽보다 살짝 어두운 털
RED_HEX   = "B31226"   # 붉은 유니폼
WHITE_HEX = "FFF9F1"
BLACK_HEX = "24252B"

# 1. 장면 및 재질 -------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Cream Labrador - Football and UFC"


def linear_rgba(h):
    h = h.lstrip('#')
    vals = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return tuple((v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4)
                 for v in vals) + (1.0,)


def mat(name, hx, rough=.68, metallic=0., sheen=.06):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    rgba = linear_rgba(hx)
    m.diffuse_color = rgba
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = rgba
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Sheen Weight'].default_value = sheen
    return m

fur         = mat('Fur / warm cream', FUR_HEX, .80, sheen=.12)
ear_fur     = mat('Fur / folded ear', EAR_HEX, .85)
muzzle      = mat('Fur / ivory muzzle', WHITE_HEX, .82)
blush       = mat('Cheeks / delicate cream', 'FFE3D3', .87)
eye_mat     = mat('Eyes / glossy black', '141315', .27)
nose_mat    = mat('Nose / espresso', '3D3431', .34)
smile_mat   = mat('Smile / soft dark line', '3C302C', .48)
jersey_red  = mat('Uniform / red fabric', RED_HEX, .83, sheen=.18)
jersey_wht  = mat('Uniform / white details', WHITE_HEX, .86, sheen=.12)
scarf_red   = mat('Scarf / red knit', 'B91425', .93, sheen=.20)
scarf_cream = mat('Scarf / cream knit', 'F8F0E6', .92, sheen=.21)
cap_red     = mat('Cap / red fabric', 'AB091C', .9, sheen=.14)
cap_black   = mat('Cap / adjustable strap', '3A373B', .62)
glove_black = mat('Gloves / matte charcoal', BLACK_HEX, .71)
glove_pad   = mat('Gloves / protective cushion', '34353C', .69)
glove_red   = mat('Gloves / wrist band', 'C02A32', .73)
letter_mat  = mat('Lettering / ivory', 'FFFDF6', .50)
ball_white  = mat('Ball / white panels', 'F6F5F1', .51)
ball_black  = mat('Ball / charcoal panels', '27282A', .47)
fx_yellow   = mat('Small cheer sparkles', 'FFCE51', .72)
floor_mat   = mat('Studio / pastel turquoise', '80CED3', .93)

root = bpy.data.objects.new('LABRADOR_ROOT | Export model', None)
bpy.context.collection.objects.link(root)
root.empty_display_type = 'CIRCLE'
root.empty_display_size = .2


def model(obj, name):
    obj.name = name
    obj.parent = root
    return obj


def smooth(obj):
    if obj.type == 'MESH':
        for face in obj.data.polygons:
            face.use_smooth = True
    return obj


def sphere(name, xyz, size, material, segments=24, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings,
                                         location=xyz)
    o = bpy.context.object
    o.scale = size
    o.data.materials.append(material)
    return model(smooth(o), name)


def box(name, xyz, dims, material, roundness=.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz)
    o = bpy.context.object
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if roundness > 0:
        m = o.modifiers.new('Soft round edges', 'BEVEL')
        m.width = roundness
        m.segments = 3
        o.modifiers.new('Normals', 'WEIGHTED_NORMAL')
    return model(smooth(o), name)


def geometry(name, verts, faces, materials, ids=None, subsurf=0):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    for m in materials:
        me.materials.append(m)
    if ids is not None:
        for face, idx in zip(me.polygons, ids):
            face.material_index = idx
    smooth(o)
    if subsurf:
        mod = o.modifiers.new('Smooth surface', 'SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf
    return model(o, name)


def line(name, points, radius, material, closed=False):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 6
    data.bevel_depth = radius
    data.bevel_resolution = 1
    sp = data.splines.new('BEZIER')
    sp.bezier_points.add(len(points)-1)
    for p, xyz in zip(sp.bezier_points, points):
        p.co = xyz
        p.handle_left_type = 'AUTO'
        p.handle_right_type = 'AUTO'
    sp.use_cyclic_u = closed
    o = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(o)
    data.materials.append(material)
    return model(o, name)


def label(name, content, x, y, z, height, material, angle=0.):
    """-Y에서 보는 정면 글씨. 이후 GLB를 위해 메시로 변환합니다."""
    data = bpy.data.curves.new(name, 'FONT')
    data.resolution_u = 2
    data.body = content
    font_path='C:/Windows/Fonts/timesbd.ttf' if content=='Emirates' else 'C:/Windows/Fonts/arialbd.ttf'
    if os.path.exists(font_path):data.font=bpy.data.fonts.load(font_path,check_existing=True)
    if content in ['UFC','FLY BETTER']:data.shear=.12
    data.align_x = 'CENTER'
    data.align_y = 'CENTER'
    data.size = height
    data.extrude = .0012
    data.bevel_depth = 0
    data.materials.append(material)
    o = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(o)
    o.location = (x,y,z)
    o.rotation_euler = (pi/2, 0, angle)
    return model(o, name)


def orient_faces_outward(verts, faces):
    fixed = []
    for face in faces:
        a,b,c = [Vector(verts[k]) for k in face[:3]]
        normal = (b-a).cross(c-a)
        center = sum((Vector(verts[k]) for k in face), Vector()) / len(face)
        fixed.append(tuple(face if normal.dot(center) > 0 else tuple(reversed(face))))
    return fixed

# 2. 폭신한 꼬리 (몸 뒤, 오른쪽에 보이는 곡선 볼륨) --------------------
tail = [
    (.43,.37,.77,.095,.12),
    (.66,.46,.71,.18,.20),
    (.96,.52,.70,.30,.31),
    (1.26,.55,.84,.40,.38),
    (1.45,.54,1.05,.39,.37),
    (1.55,.50,1.27,.32,.31),
    (1.57,.46,1.45,.23,.23),
    (1.55,.42,1.58,.12,.14),
    (1.51,.41,1.64,.013,.022),
]
N = 24
verts, faces = [], []
for i,(x,y,z,rx,ry) in enumerate(tail):
    p = tail[max(0,i-1)]
    q = tail[min(len(tail)-1,i+1)]
    tangent = Vector((q[0]-p[0],0,q[2]-p[2])).normalized()
    normal = Vector((tangent.z,0,-tangent.x))
    for j in range(N):
        th=2*pi*j/N
        fac=1+.015*sin(6*th+i*.12)
        v=Vector((x,y,z))+normal*(rx*cos(th)*fac)+Vector((0,ry*sin(th)*fac,0))
        verts.append(tuple(v))
for i in range(len(tail)-1):
    for j in range(N):
        k=i*N+j
        n=i*N+(j+1)%N
        faces.append((k,n,n+N,k+N))
faces += [tuple(reversed(range(N))), tuple(range((len(tail)-1)*N, len(verts)))]
geometry('One-piece curved Labrador tail', verts, faces, [fur], subsurf=1)

# 3. 몸통과 짧은 발 --------------------------------------------------
sphere('Main torso / golden cream', (0,.040,.96),(.62,.49,.78),fur)
# The jersey encloses the belly; no pale overlay through the fabric.
for s,side in [(-1,'L'),(1,'R')]:
    sphere('Short hindleg '+side,(s*.34,-.03,.27),(.27,.29,.31),fur)
    sphere('Rounded paw '+side,(s*.34,-.22,.17),(.29,.31,.17),fur)
    # 발가락 음영은 뾰족한 손가락이 아닌 짧은 곡선으로
    for j in (-1,1):
        line('Tiny paw crease %s %s'%(side,j),
             [(s*.34+j*.08,-.486,.13), (s*.34+j*.08,-.480,.17)],
             .004,ear_fur)

# 4. 유니폼: 방패 로고 없음!  -----------------------------------------
# 부드러운 빨간 상의와 흰색 소매/밑단, 작은 3줄 로고
sphere('Red jersey main', (0,-.10,1.13),(.648,.503,.69),jersey_red)
for s,side in [(-1,'L'),(1,'R')]:
    arm=sphere('Cream arm '+side,(s*.72,-.18,1.16),(.239,.252,.395),fur)
    arm.rotation_euler[1]=-s*.19
    sleeve=sphere('White uniform sleeve '+side,
                  (s*.63,-.075,1.45),(.288,.273,.235),jersey_wht)
    sleeve.rotation_euler[1]=-s*.18
    cuff=sphere('Red cuff '+side,(s*.78,-.205,1.28),(.208,.230,.084),jersey_red)
    cuff.rotation_euler[1]=-s*.15
    for j in range(3):
        x=s*(.57+.070*j)
        # 팔 위쪽 붉은 3줄: 정면 -Y에 부착
        line('Shoulder accent %s %d'%(side,j),
             [(x,-.294,1.58),(x+s*.027,-.315,1.72)], .012,jersey_red)

# 두 줄 흰색 하단 밴드
for z,h in [(.618,.055),(.703,.025)]:
    box('White jersey lower stripe %.3f'%z,(0,-.542,z),(.95,.029,h),jersey_wht,.009)

# 상의 왼쪽 가슴 - 흰색 Adidas의 삼각 3줄 마크 (문자로 대체하지 않음)
for j,(x,z,l) in enumerate([(-.30,1.425,.100),(-.236,1.455,.135),(-.172,1.483,.164)]):
    b=box('Three-bar brand icon %d'%j,(x,-.606,z),(.041,.016,l),jersey_wht,.004)
    b.rotation_euler[1]=-.22

# 전면 문구: 방패형 Arsenal 클럽 마크는 의도적으로 없음.
label('Jersey sponsor Emirates','Emirates',0,-.632,1.118,.30,letter_mat)
label('Jersey sponsor FLY BETTER','FLY BETTER',0,-.639,.936,.145,letter_mat)

# 5. 매우 큰 둥근 머리와 래브라도 특유의 처진 귀 --------------------
head=sphere('Giant round Labrador head',(0,-.03,2.37),(.98,.715,.77),fur,48,28)
# 눈/입 특징이 작은 중심에 모이도록, 볼은 부드러운 크림 볼륨.
for s,side in [(-1,'L'),(1,'R')]:
    ear=sphere('Soft floppy hanging ear '+side,
               (s*.965,-.022,2.318),(.315,.245,.545),ear_fur,32,20)
    ear.rotation_euler[1]=s*.20
    sphere('Drooping ear bottom '+side,
           (s*1.007,-.072,2.06),(.290,.210,.242),ear_fur)
    sphere('Cheek volume '+side,
           (s*.685,-.490,2.138),(.290,.200,.230),fur)
    sphere('Shiny black oval eye '+side,
           (s*.373,-.694,2.47),(.114,.087,.160),eye_mat)

sphere('Soft muzzle',(0,-.661,2.151),(.428,.218,.223),muzzle)
sphere('Small round brown-black nose',(0,-.870,2.239),(.130,.094,.078),nose_mat)
# 눈썹 없이 얇은 w형 곡선 웃음 (혀 돌출 없음)
line('Smiling mouth left', [(-.180,-.852,2.114),(-.140,-.876,2.050),
       (-.067,-.876,2.044),(0,-.878,2.075)], .012,smile_mat)
line('Smiling mouth right',[(0,-.878,2.075),(.067,-.876,2.044),
       (.140,-.876,2.050),(.180,-.852,2.114)], .012,smile_mat)

# 6. 빨간 UFC 스냅백 (귀는 자유롭게 아래로 보임) --------------------
if ADD_UFC_CAP:
    # 위로 갈수록 좁아지는 돔 형태; 카메라가 보는 전면에 조절 띠
    cap_rows=[
        (2.875,.860,.625),
        (2.965,.845,.613),
        (3.120,.756,.553),
        (3.255,.583,.426),
        (3.364,.351,.268),
        (3.418,.080,.075),
    ]
    Ncap=32
    vv,ff=[],[]
    for z,rx,ry in cap_rows:
        for j in range(Ncap):
            t=2*pi*j/Ncap
            vv.append((rx*cos(t),-.018+ry*sin(t),z))
    for i in range(len(cap_rows)-1):
        for j in range(Ncap):
            k=i*Ncap+j
            n=i*Ncap+(j+1)%Ncap
            # 바닥의 카메라 쪽 중앙 부분에는 조절 띠가 위치함.
            ff.append((k,n,n+Ncap,k+Ncap))
    ff.append(tuple(range((len(cap_rows)-1)*Ncap,len(vv))))
    geometry('Red snapback cap crown',vv,ff,[cap_red],subsurf=1)
    # 모자의 뒤쪽을 앞으로 쓴 상태: 조절 띠가 이마 중앙에 보임
    box('Black cap adjustment strap',(0,-.648,2.946),(.405,.048,.096),cap_black,.028)
    for x in [-.15,-.09,-.03,.03,.09,.15]:
        sphere('Small strap hole %+.2f'%x,(x,-.685,2.946),
               (.012,.004,.012),eye_mat,16,10)
    # 캡 모자 챙은 화면 오른쪽으로 삐져나오도록 위치
    brim=sphere('Sideways red cap brim',(.80,-.10,2.93),(.405,.245,.063),cap_red)
    brim.rotation_euler[2]=.16
    label('Cap UFC lettering','UFC',.485,-.573,3.135,.25,letter_mat)

# 7. 목도리: 실제 둥근 목 + 전면 아래로 늘어진 끝 ---------------------
# 큰 머리 아래(약 z=1.68)에서 두툼하게 둘러진 목도리
nr,ns=48,12
vv,ff,ids=[],[],[]
for i in range(nr):
    a=2*pi*i/nr
    for j in range(ns):
        t=2*pi*j/ns
        r=.615+.101*cos(t)
        vv.append((r*cos(a),(.457+.096*cos(t))*sin(a)-.035,
                   1.685+.102*sin(t)))
for i in range(nr):
    for j in range(ns):
        k=i*ns+j; n=i*ns+(j+1)%ns
        nk=((i+1)%nr)*ns+j
        nn=((i+1)%nr)*ns+(j+1)%ns
        ff.append((k,nk,nn,n))
        ids.append(0 if (i//9)%2==0 else 1)
geometry('Thick red white striped knit scarf ring',vv,ff,
         [scarf_red,scarf_cream],ids,0)

# 긴 목도리 끝은 오른쪽 가슴 앞으로 늘어뜨림
box('Hanging scarf tail',(.376,-.657,1.179),(.345,.13,.825),scarf_red,.065)
for z in [1.43,1.19,.91]:
    box('Ivory scarf horizontal band %.2f'%z,(.376,-.711,z),
        (.344,.025,.14),scarf_cream,.022)
for k in range(6):
    x=.243+k*.053
    line('Knitted white fringe %d'%k,[(x,-.706,.772),(x,-.705,.664)],
         .016,scarf_cream)

# 목도리의 '대포' 상징만 표시 (방패 로고 없이 자유롭게 쓸 수 있음)
def cannon_symbol(prefix, x, y, z, scale, color):
    line(prefix+' / cannon barrel',[
        (x-scale*.55,y,z+scale*.18),
        (x+scale*.60,y,z+scale*.18)],scale*.057,color)
    line(prefix+' / cannon side',[(x+scale*.55,y,z+scale*.18),
                                (x+scale*.70,y,z+scale*.08)],scale*.041,color)
    line(prefix+' / cannon handle',[(x-scale*.30,y,z+scale*.09),
                                  (x-scale*.47,y,z-scale*.14)],scale*.048,color)
    cx=x-scale*.05;cz=z-scale*.08
    line(prefix+' / cannon wheel',[(cx+scale*.21*cos(i*2*pi/16),y-.02,cz+scale*.21*sin(i*2*pi/16)) for i in range(16)],scale*.022,color,True)
    for i in range(6):
        a=i*pi/3
        line(prefix+' / wheel spoke '+str(i),[(cx,y-.022,cz),(cx+scale*.19*cos(a),y-.022,cz+scale*.19*sin(a))],scale*.014,color)

cannon_symbol('Scarf emblem',.376,-.727,.999,.19,scarf_cream)

# 8. 오른쪽의 UFC 장갑. 왼팔은 맨손으로 축구공을 잡음 ---------------
# 오른팔은 따로 조금 높이 들어올린 주먹 디자인
sphere('Right arm raised forearm',(.750,-.30,1.35),(.216,.235,.390),fur)
sphere('Black glove right fist',(.848,-.470,1.665),(.218,.192,.218),glove_black)
sphere('Black glove raised knuckles',(.852,-.573,1.706),
       (.204,.123,.143),glove_pad)
box('UFC glove red wristband',(.827,-.415,1.477),
    (.349,.285,.106),glove_red,.035)
box('UFC glove black strap',(.828,-.427,1.423),
    (.342,.284,.052),glove_black,.025)
for i in range(3):
    sphere('Glove finger protector %d'%i,(.727+.085*i,-.557,1.537),
           (.053,.074,.056),glove_black,24,16)
label('UFC lettering on glove','UFC',.852,-.721,1.686,.16,letter_mat)

# 9. 정확한 패널 축구공: 정이십면체 절두로 흰 육각형+검정 오각형 ---
BALL_CENTER=Vector((-1.000,-.560,1.03))
BALL_RADIUS=.367
# 표준 정이십면체의 꼭짓점을 가져와 1/3 지점에서 절두
# bpy primitive ico_sphere_add는 vertex=12/face=20 (subdivisions=1).
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1.0)
template=bpy.context.object
base_v=[v.co.copy() for v in template.data.vertices]
base_f=[tuple(p.vertices) for p in template.data.polygons]
bpy.data.objects.remove(template,do_unlink=True)

edges={}
for f in base_f:
    for a,b in ((f[0],f[1]),(f[1],f[2]),(f[2],f[0])):
        edges.setdefault(a,set()).add(b)
        edges.setdefault(b,set()).add(a)

# 각 방향성을 가진 변마다 '절두된 꼭짓점' 하나씩 총 60개
new_v=[]
index={}
for a in sorted(edges):
    for b in sorted(edges[a]):
        index[(a,b)]=len(new_v)
        vec=(base_v[a]*2+base_v[b])/3
        new_v.append(tuple(vec.normalized()))

ball_faces=[]
ball_ids=[]
# 원래 삼각형 -> 흰색 육각형 20개
for a,b,c in base_f:
    face=[index[(a,b)],index[(b,a)],index[(b,c)],
          index[(c,b)],index[(c,a)],index[(a,c)]]
    ball_faces.append(face)
    ball_ids.append(0)

# 원래 꼭짓점 -> 검정 오각형 12개, 접평면에서 정렬
for a, neighbours in edges.items():
    axis=base_v[a].normalized()
    ref=Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))
    tangent1=axis.cross(ref).normalized()
    tangent2=axis.cross(tangent1).normalized()
    neighbours=sorted(neighbours,
        key=lambda b:math.atan2((base_v[b]-base_v[a]).dot(tangent2),
                                (base_v[b]-base_v[a]).dot(tangent1)))
    ball_faces.append([index[(a,b)] for b in neighbours])
    ball_ids.append(1)

# 바깥쪽 노멀 방향 보정. 좌표의 원점이 공 중심이므로 비교가 쉬움.
ball_faces=orient_faces_outward(new_v,ball_faces)
ball=sphere('Temp ball scaler dummy',(0,0,-100),(.01,)*3,fur,8,6)
bpy.data.objects.remove(ball,do_unlink=True)
new_v=[tuple(BALL_CENTER+Vector(v)*BALL_RADIUS) for v in new_v]
soccer=geometry('Classic 32-panel football',new_v,ball_faces,
                [ball_white,ball_black],ball_ids,0)
bevel=soccer.modifiers.new('Tiny panel-rounding bevel','BEVEL')
bevel.width=.007
bevel.segments=2
soccer.modifiers.new('Football weighted normals','WEIGHTED_NORMAL')

# 앞쪽에 작은 빨간 대포 심볼 (모델링 시 축구공과 맞닿도록 배치)
cannon_symbol('Football cannon',-1.005,-.933,1.040,.23,jersey_red)
# 공을 부드럽게 안고 있는 왼손
sphere('Left soft hand holding soccer ball',(-.688,-.490,1.257),
       (.219,.205,.210),fur)

# Reference-image refinement: continuous plush silhouette and soft equipment.
def remove_named(prefix):
    for obj in list(root.children_recursive):
        if obj.name.startswith(prefix): bpy.data.objects.remove(obj,do_unlink=True)
remove_named('Cheek volume');remove_named('Soft muzzle');remove_named('Drooping ear bottom')
for obj in root.children_recursive:
    n=obj.name
    if n.startswith('Giant round'):
        obj.scale=(1.04,.76,.80)
    if n.startswith('Soft floppy'):
        obj.location.y=-.20;obj.location.z=2.32
        obj.scale=(.29,.24,.50);obj.rotation_euler[1]=(-1 if obj.location.x<0 else 1)*-.24
    if n.startswith('Shiny black oval'):
        obj.scale=(.14,.075,.175);obj.location.y=-.752;obj.location.z=2.44
    if n.startswith('Small round brown'):
        obj.location=(0,-.80,2.31);obj.scale=(.16,.09,.10)
    if n.startswith('One-piece curved'):
        for v in obj.data.vertices:
            v.co.x=.43+(v.co.x-.43)*.70
            v.co.z=.6+(v.co.z-.6)*.65
            v.co.y=.37+(v.co.y-.37)*.7
remove_named('Smiling mouth')
line('Smiling mouth left',[(-.30,-.744,2.18),(-.23,-.774,2.105),(-.12,-.793,2.10),(0,-.804,2.15)],.014,smile_mat)
line('Smiling mouth right',[(0,-.804,2.15),(.12,-.793,2.10),(.23,-.774,2.105),(.30,-.744,2.18)],.014,smile_mat)
for side in ['L','R']:
    leg=bpy.data.objects.get('Short hindleg '+side);paw=bpy.data.objects.get('Rounded paw '+side)
    bpy.ops.object.select_all(action='DESELECT');leg.select_set(True);paw.select_set(True)
    bpy.context.view_layer.objects.active=leg;bpy.ops.object.join()
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    remesh=leg.modifiers.new('Continuous plush foot','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.035
    bpy.ops.object.modifier_apply(modifier=remesh.name)
    soft=leg.modifiers.new('Soft paw transition','SMOOTH');soft.factor=.7;soft.iterations=3
    bpy.ops.object.modifier_apply(modifier=soft.name)
    dec=leg.modifiers.new('Foot web budget','DECIMATE');dec.ratio=.45
    bpy.ops.object.modifier_apply(modifier=dec.name);smooth(leg)
# Shirt with a broad, curved hem instead of floating straight strips.
remove_named('Red jersey main');remove_named('White jersey lower stripe')
rows=[(.52,.60,.43),(.56,.66,.48),(.65,.67,.49),(.95,.66,.50),(1.25,.62,.48),(1.50,.51,.41),(1.69,.40,.34)]
vv=[];ff=[]
for z,rx,ry in rows:
    for j in range(48):
        a=j*2*pi/48;vv.append((rx*cos(a),-.1+ry*sin(a),z))
for i in range(len(rows)-1):
    for j in range(48):ff.append((i*48+j,i*48+(j+1)%48,(i+1)*48+(j+1)%48,(i+1)*48+j))
geometry('Red jersey tailored body',vv,ff,[jersey_red],subsurf=1)
for z in [.57,.65]:
    line('Curved ivory jersey hem '+str(z),[(.665*cos(j*2*pi/48),-.1+.495*sin(j*2*pi/48),z) for j in range(48)],.018,jersey_wht,True)
# Rear-facing snapback aperture, a thicker strap and stitched panel seams.
cap=bpy.data.objects.get('Red snapback cap crown')
for v in cap.data.vertices:v.co.z=2.875+(v.co.z-2.875)*1.25
bpy.context.view_layer.objects.active=cap
for mod in list(cap.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
solid=cap.modifiers.new('Sewn cap thickness','SOLIDIFY');solid.thickness=.025
bpy.ops.object.modifier_apply(modifier=solid.name)
cutter=sphere('temporary cap aperture',(0,-.64,2.98),(.34,.34,.31),fur,32,20)
mod=cap.modifiers.new('Actual rear adjustment opening','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
bpy.context.view_layer.objects.active=cap;bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.data.objects.remove(cutter,do_unlink=True)
remove_named('Black cap adjustment');remove_named('Small strap hole')
box('Black cap adjustment strap',(0,-.692,2.953),(.60,.065,.105),cap_black,.032)
for x in [-.22,-.132,-.044,.044,.132,.22]:sphere('Small strap hole '+str(x),(x,-.731,2.953),(.013,.005,.014),eye_mat,12,8)
sphere('Cap top covered button',(0,-.018,3.57),(.085,.08,.036),cap_red,20,12)
for a in [-2.8,-2.15,-.85,.1,1.3]:
    line('Cap panel seam '+str(a),[(rx*cos(a),-.018+ry*sin(a),2.883+(z-2.875)*1.25) for z,rx,ry in cap_rows],.003,cap_red)
cap_label=bpy.data.objects.get('Cap UFC lettering');cap_label.location=(.49,-.586,3.19);cap_label.rotation_euler[1]=.14
brim=bpy.data.objects.get('Sideways red cap brim');brim.location=(.82,.07,2.91);brim.rotation_euler[1]=.45
# Keep lettering clear of the scarf and give the scarf a loose diagonal drape.
for obj in list(root.children_recursive):
    if obj.name.startswith(('Hanging scarf','Ivory scarf','Knitted white fringe','Scarf emblem')):
        obj.location.x+=.17+(1.6-obj.location.z)*.12
        obj.rotation_euler[1]=-.12
        if obj.name.startswith('Knitted white fringe'):obj.data.bevel_depth=.026
    if obj.name.startswith(('Black glove','UFC glove','Glove finger','UFC lettering')):
        obj.location.x=.85+(obj.location.x-.85)*1.17
        obj.location.z=1.6+(obj.location.z-1.6)*1.17
        obj.scale*=1.17
for i in range(4):
    sphere('Glove finger padded knuckle '+str(i),(.64+i*.115,-.58,1.83-abs(i-1.5)*.03),(.078,.11,.10),glove_black,16,12)
# Round the ball without losing black pentagons and white hexagons.
for mod in list(soccer.modifiers):soccer.modifiers.remove(mod)
mod=soccer.modifiers.new('Round panel tessellation','SUBSURF');mod.subdivision_type='SIMPLE';mod.levels=2
bpy.context.view_layer.objects.active=soccer;bpy.ops.object.modifier_apply(modifier=mod.name)
for v in soccer.data.vertices:v.co=BALL_CENTER+(v.co-BALL_CENTER).normalized()*BALL_RADIUS
for k,face in enumerate(ball_faces):
    points=[]
    for i,a in enumerate(face):
        va=Vector(new_v[a])-BALL_CENTER;vb=Vector(new_v[face[(i+1)%len(face)]])-BALL_CENTER
        for t in [0,.25,.5,.75]:points.append(tuple(BALL_CENTER+va.lerp(vb,t).normalized()*(BALL_RADIUS+.001)))
    line('Football panel seam '+str(k),points,.0025,ball_black,True)
for obj in root.children_recursive:
    if obj.type=='MESH' and not obj.data.uv_layers:
        uv=obj.data.uv_layers.new(name='SurfaceUV')
        for poly in obj.data.polygons:
            for index in poly.loop_indices:
                v=obj.data.vertices[obj.data.loops[index].vertex_index].co
                uv.data[index].uv=(v.x*.5+.5,v.z*.5+.5)
# Thin stitching uses short linear curve segments instead of dense swept tubes.
for obj in root.children_recursive:
    if obj.type=='CURVE' and obj.name.startswith(('Football panel seam','Curved ivory jersey hem','Cap panel seam','Football cannon','Scarf emblem')):
        obj.data.resolution_u=1;obj.data.bevel_resolution=0
        for spline in obj.data.splines:
            for point in spline.bezier_points:
                point.handle_left_type='VECTOR';point.handle_right_type='VECTOR'
# Shared tiny normal map survives GLB export (unlike Blender-only noise nodes).
import random
random.seed(19)
image=bpy.data.images.new('Fine textile and plush grain',width=128,height=128)
pixels=[]
for y in range(128):
    for x in range(128):
        nx=(random.random()-.5)*.16;ny=(random.random()-.5)*.16
        pixels.extend((.5+nx,.5+ny,1,1))
image.colorspace_settings.name='Non-Color';image.pixels=pixels;image.pack()
for material in [fur,ear_fur,jersey_red,jersey_wht,scarf_red,scarf_cream,cap_red]:
    nodes=material.node_tree.nodes;links=material.node_tree.links
    tex=nodes.new('ShaderNodeTexImage');tex.image=image
    uv=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeVectorMath');mapping.operation='SCALE';mapping.inputs[3].default_value=7
    links.new(uv.outputs['UV'],mapping.inputs[0]);links.new(mapping.outputs[0],tex.inputs['Vector'])
    normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.12
    links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
# Less washed-out lighting keeps the jersey crimson and the fur warm cream.

# Match the fox's sculpted, continuous silhouettes while retaining Labrador anatomy.
remove_named('Soft floppy hanging ear')
for side,sign in [('L',-1),('R',1)]:
    profiles=[(2.86,.77,-.04,.025,.025),(2.75,.94,-.12,.20,.16),(2.53,1.055,-.22,.27,.21),(2.28,1.07,-.29,.255,.215),(2.06,1.02,-.32,.18,.17),(1.96,.99,-.31,.035,.04)]
    vertices=[];faces=[];segments=24
    for z,cx,cy,rx,ry in profiles:
        for j in range(segments):
            a=j*2*pi/segments
            vertices.append((sign*cx+rx*cos(a),cy+ry*sin(a),z))
    for i in range(len(profiles)-1):
        for j in range(segments):
            k=i*segments+j;n=i*segments+(j+1)%segments
            faces.append((k,k+segments,n+segments,n))
    faces.append(tuple(reversed(range(segments))))
    faces.append(tuple(range((len(profiles)-1)*segments,len(vertices))))
    geometry('Sculpted floppy ear '+side,vertices,faces,[ear_fur],subsurf=1)
    line('Soft inner ear fold '+side,[(sign*.89,-.29,2.64),(sign*.92,-.43,2.38),(sign*.94,-.44,2.16)],.009,fur)
# Keep the shoulder stripes on the white sleeve, following its curved surface.
remove_named('Shoulder accent')
for sign,side in [(-1,'L'),(1,'R')]:
    for j in range(3):
        sleeve=bpy.data.objects.get('White uniform sleeve '+side)
        bpy.context.view_layer.update()
        u=(j-1)*.23;r=math.sqrt(1-u*u)
        points=[tuple(sleeve.matrix_world@Vector((u,-r*cos(a)*1.012,r*sin(a)*1.012))) for a in [.15,.4,.65]]
        line('Inset shoulder stripe '+side+str(j),points,.008,jersey_red)
# Replace stacked rectangular scarf blocks with a padded, striped continuous drape.
for prefix in ['Hanging scarf','Ivory scarf','Knitted white fringe','Scarf emblem']:remove_named(prefix)
vertices=[];faces=[];ids=[];rows=32;cols=8
for back in [False,True]:
    for i in range(rows+1):
        t=i/rows;cx=.46+.18*t;cy=-.40-.30*sin(t*pi*.6);z=1.74-1.07*t
        for j in range(cols+1):
            u=2*j/cols-1
            y=cy+(.055 if back else -.055-.025*(1-u*u))
            vertices.append((cx+u*.175,y,z+.02*u*sin(t*pi)))
stride=cols+1;layer=(rows+1)*stride
for back in [False,True]:
    offset=layer if back else 0
    for i in range(rows):
        for j in range(cols):
            k=offset+i*stride+j
            faces.append((k+stride,k+stride+1,k+1,k) if not back else (k,k+1,k+stride+1,k+stride));ids.append((i//5)%2)
for i in range(rows):
    for j in [0,cols]:
        k=i*stride+j;faces.append((k,k+stride,k+stride+layer,k+layer));ids.append((i//5)%2)
for i in [0,rows]:
    for j in range(cols):
        k=i*stride+j;faces.append((k,k+layer,k+layer+1,k+1));ids.append((i//5)%2)
geometry('Hanging scarf sculpted striped drape',vertices,faces,[scarf_red,scarf_cream],ids,subsurf=1)
for j in range(5):
    fringe=sphere('Knitted white fringe rounded '+str(j),(.50+j*.067,-.69,.61),(.035,.065,.105),scarf_cream,16,10)
    fringe.rotation_euler[1]=-.10
cannon_symbol('Scarf emblem woven',.59,-.78,1.0,.16,scarf_cream)
# Short ribbed knit rows add relief without a dense strand simulation.
for i in range(16):
    t=(i+.5)/16;cx=.46+.18*t;cy=-.40-.30*sin(t*pi*.6)-.082;z=1.74-1.07*t
    line('Scarf knit rib '+str(i),[(cx-.14,cy+.012,z),(cx,cy,z+.005),(cx+.14,cy+.012,z)],.0025,scarf_red if int(t*32)//5%2==0 else scarf_cream)
# Slightly oval eyes and discreet nostrils, matching the example's small features.
for obj in root.children_recursive:
    if obj.name.startswith('Shiny black oval'):obj.scale=(.125,.068,.172)
    if obj.name.startswith('Black glove right fist'):
        for v in obj.data.vertices:
            v.co.x=math.copysign(abs(v.co.x)**.82,v.co.x)
            v.co.z=math.copysign(abs(v.co.z)**.86,v.co.z)
for sign in [-1,1]:sphere('Nose nostril '+str(sign),(sign*.075,-.88,2.285),(.018,.009,.012),smile_mat,12,8)
# Newly sculpted surfaces need their own UVs for the shared grain texture.
for obj in root.children_recursive:
    if obj.type=='MESH' and not obj.data.uv_layers:
        uv=obj.data.uv_layers.new(name='SurfaceUV')
        for loop in obj.data.loops:
            v=obj.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(v.x*.5+.5,v.z*.5+.5)

exec(compile(open(os.path.join(os.path.dirname(__file__),'labrador_sculpt.py'),encoding='utf-8-sig').read(),'labrador_sculpt.py','exec'))

# 10. 노란 응원 표시 (렌더 소품, GLB 내보내기에서는 제외) -----------
fx_objects=[]
if ADD_YELLOW_FX:
    for i,params in enumerate([
        ((1.243,-.79,1.95),(1.370,-.79,2.09),(1.310,-.79,1.86)),
        ((1.380,-.79,1.79),(1.533,-.79,1.845),(1.405,-.79,1.724)),
        ((1.365,-.79,1.63),(1.485,-.79,1.59),(1.393,-.79,1.55)),
    ]):
        ob=geometry('Cheer sparkle / not exported %d'%i,list(params),
                    [(0,1,2)],[fx_yellow])
        fx_objects.append(ob)

# 11. 스튜디오 렌더 설정 ----------------------------------------------
def aim(ob, xyz):
    ob.rotation_euler=(Vector(xyz)-ob.location).to_track_quat('-Z','Y').to_euler()

if PASTEL_BG:
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.019))
    floor=bpy.context.object
    floor.name='STUDIO FLOOR / not in GLB'
    floor.data.materials.append(floor_mat)

world=bpy.data.worlds.new('Soft ambient studio')
world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.80,.77,.72,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7
scene.world=world

bpy.ops.object.camera_add(location=(.08,-10.4,2.95))
cam=bpy.context.object
cam.name='Front orthographic mascot camera'
aim(cam,(.10,0,1.92))
cam.data.type='ORTHO'
cam.data.ortho_scale=4.45
scene.camera=cam

for name,pos,power,size in [
    ('Large softbox',(-3.3,-4.1,6.1),650,5),
    ('Right fill',(3.4,-4.1,3.8),330,4),
    ('Rear rim',(2.0,3.1,4.5),460,4),
]:
    bpy.ops.object.light_add(type='AREA',location=pos)
    ob=bpy.context.object
    ob.name=name
    ob.data.energy=power
    ob.data.shape='DISK'
    ob.data.size=size
    aim(ob,(0,0,1.8))

scene.render.engine='CYCLES'
scene.cycles.samples=RENDER_SAMPLES
scene.cycles.use_denoising=True
scene.render.resolution_x=RENDER_SIZE
scene.render.resolution_y=RENDER_SIZE
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=not PASTEL_BG
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=-.15

for area in (bpy.context.screen.areas if bpy.context.screen else []):
    if area.type=='VIEW_3D':
        sp=area.spaces.active
        sp.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
        sp.region_3d.view_location=(0,0,1.92)
        sp.region_3d.view_distance=6
        sp.shading.color_type='MATERIAL'

# 12. 저장 및 GLB (문자/곡선을 메시화해서 웹 호환성 향상) -------------
# 글씨(FONT)와 굽은 장식(CURVE)은 glTF에서 보이는 메시가 되도록 변환.
# 변환 후에도 Blender에서는 각 부분별로 이동/수정할 수 있습니다.
for obj in list(root.children_recursive):
    if obj.type in {'CURVE','FONT'}:
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH')

# Web export: stable animation pivots and material batches; no studio geometry.
regions = {name: [] for name in ['Body','LegL','LegR','ArmL','ArmR','Tail','Football']}
for obj in list(root.children_recursive):
    if obj.type != 'MESH' or obj in fx_objects: continue
    n = obj.name
    region = 'Body'
    if n.startswith(('Short hindleg','Rounded paw','Tiny paw crease')):
        region = 'LegL' if ' L' in n else 'LegR'
    elif n.startswith(('Classic 32-panel','Football cannon','Football panel seam')): region = 'Football'
    elif n.startswith('One-piece curved'): region = 'Tail'
    elif n.startswith(('Right arm raised','Black glove','UFC glove','Glove finger','UFC lettering')) or n == 'Cream arm R': region = 'ArmR'
    elif n.startswith('Left soft hand') or n == 'Cream arm L': region = 'ArmL'
    regions[region].append(obj)
pivots={'Body':(0,0,0),'LegL':(-.34,0,.42),'LegR':(.34,0,.42),'ArmL':(-.63,-.075,1.45),'ArmR':(.63,-.075,1.45),'Tail':(.43,.37,.77),'Football':(-1,-.56,1.03)}
for name,objects in regions.items():
    pivot=bpy.data.objects.new('Labrador'+name,None)
    bpy.context.collection.objects.link(pivot);pivot.parent=root;pivot.location=pivots[name]
    batches={}
    for obj in objects:
        bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
        for modifier in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        key=tuple(m.name for m in obj.data.materials)
        batches.setdefault(key,[]).append(obj)
    for index,objects in enumerate(batches.values()):
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join();obj=bpy.context.object;matrix=obj.matrix_world.copy()
        obj.parent=pivot;obj.matrix_world=matrix;obj.name=name+'_material_'+str(index)

os.makedirs(OUTPUT_DIR,exist_ok=True)
base=os.path.join(OUTPUT_DIR,'Labrador_Arsenal_UFC')
scene.render.filepath=base+'.png'

bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
bpy.context.view_layer.objects.active=root

if SAVE_BLEND:
    bpy.ops.wm.save_as_mainfile(filepath=base+'.blend')
if RENDER_PNG:
    bpy.ops.render.render(write_still=True)
if EXPORT_GLB:
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    for o in root.children_recursive:
        if o not in fx_objects:
            o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=os.path.abspath('public/models/labrador_arsenal.glb'),export_format='GLB',
                               use_selection=True,export_apply=True)

print('\n=== CREAM LABRADOR FINISHED ===')
print('Directory:',OUTPUT_DIR)
print('Blender:',base+'.blend' if SAVE_BLEND else 'disabled')
print('Render:',base+'.png' if RENDER_PNG else 'F12')
print('Three.js GLB:',os.path.abspath('public/models/labrador_arsenal.glb') if EXPORT_GLB else 'disabled')
print('No Arsenal shield crest is used on jersey.\n')
