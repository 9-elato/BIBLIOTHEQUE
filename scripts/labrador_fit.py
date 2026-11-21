"""Shared, reversible proportion deformation for measured multi-view fitting."""
import numpy as np

DEFAULT_FIT=dict(head_width=1.,head_height=1.,body_width=1.,body_height=1.,
                 leg_height=1.,depth=1.,ear_length=1.,ear_width=1.)

def fitted_points(points,params,ear=False):
    p=points.copy();z=p[:,2].copy()
    if ear:
        top=z.max();cx=p[:,0].mean()
        p[:,2]=top+(z-top)*params['ear_length']
        p[:,0]=cx+(p[:,0]-cx)*params['ear_width'];z=p[:,2].copy()
    blend=np.clip((z-1.5)/.45,0,1)
    p[:,0]*=params['body_width']*(1-blend)+params['head_width']*blend
    p[:,1]*=params['depth']
    p[:,2]=np.minimum(z,.6)*params['leg_height']+np.clip(z-.6,0,1.1)*params['body_height']+np.maximum(z-1.7,0)*params['head_height']
    return p

def capture_meshes(root):
    result=[]
    for obj in root.children_recursive:
        if obj.type!='MESH':continue
        points=np.array([tuple(obj.matrix_world@v.co) for v in obj.data.vertices])
        if not len(points):continue
        size=np.ptp(points,axis=0)
        ear=obj.name.startswith('Sculpted floppy ear') or (obj.name.startswith('Body_material') and size[0]<.8 and points[:,2].min()>1.7 and points[:,2].max()<3.1 and size[2]>.4)
        result.append((obj,points,obj.matrix_world.inverted(),ear))
    return result

def apply_fit(captured,params):
    from mathutils import Vector
    for obj,points,inverse,ear in captured:
        fitted=fitted_points(points,params,ear)
        for vertex,point in zip(obj.data.vertices,fitted):vertex.co=inverse@Vector(point)
        obj.data.update()
