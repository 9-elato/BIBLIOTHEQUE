"""100 actual mesh variants, each rendered front and left; silhouette score only.

This is NOT a perceptual similarity percentage. Colours, texture and the omitted
boxing glove are deliberately outside this metric. All proposals and decisions
are written to JSONL; original geometry is restored before every proposal.
"""
import bpy,os,sys,json,time
import numpy as np
from mathutils import Vector
sys.path.insert(0,os.path.dirname(__file__))
from labrador_fit import DEFAULT_FIT,capture_meshes,apply_fit
folder='C:/output/Labrador_Arsenal/fit100'
os.makedirs(folder,exist_ok=True)
baseline=os.environ.get('LABRADOR_FIT_BASELINE','C:/output/Labrador_Arsenal/before-fit120.blend')
bpy.ops.wm.open_mainfile(filepath=baseline)
scene=bpy.context.scene;root=bpy.data.objects['LABRADOR_ROOT | Export model']
captured=capture_meshes(root)
for obj in scene.objects:
    if obj.type=='MESH' and obj not in root.children_recursive:obj.hide_render=True
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=256;scene.render.resolution_y=256;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.display.shading.light='FLAT';scene.display.shading.show_shadows=False
scene.display.shading.show_cavity=False
scene.camera.data.ortho_scale=5.0

def pixels(path,alpha=False):
    image=bpy.data.images.load(path,check_existing=False)
    a=np.array(image.pixels[:]).reshape(image.size[1],image.size[0],4)[::-1]
    bpy.data.images.remove(image)
    return a[:,:,3 if alpha else 0]>.5

def normalized(mask):
    yy,xx=np.where(mask)
    if not len(xx):raise RuntimeError('Empty rendered silhouette')
    a=mask[yy.min():yy.max()+1,xx.min():xx.max()+1]
    scale=224/max(a.shape);h,w=[max(1,round(v*scale)) for v in a.shape]
    a=a[np.minimum((np.arange(h)/scale).astype(int),a.shape[0]-1)[:,None],np.minimum((np.arange(w)/scale).astype(int),a.shape[1]-1)[None,:]]
    out=np.zeros((256,256),bool);out[(256-h)//2:(256-h)//2+h,(256-w)//2:(256-w)//2+w]=a
    return out

refs={name:pixels(folder+'/'+name+'-mask.png') for name in ['front','left']}
ignore=np.ones((256,256),bool);ignore[85:165,167:240]=False
def evaluate(index):
    scores={}
    for name,point in [('front',(0,-10,2.15)),('left',(10,0,2.15))]:
        scene.camera.location=point;scene.camera.rotation_euler=(Vector((0,0,1.8))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
        path=f'{folder}/{index:03d}-{name}.png';scene.render.filepath=path
        bpy.ops.render.render(write_still=True)
        mask=normalized(pixels(path,True));ref=refs[name]
        valid=ignore if name=='front' else np.ones_like(ignore)
        scores[name]=float(np.logical_and(mask,ref)[valid].sum()/max(1,np.logical_or(mask,ref)[valid].sum()))
    return scores,float(np.mean(list(scores.values())))

rng=np.random.default_rng(20261122)
bounds=dict(head_width=(.78,1.08),head_height=(.84,1.16),body_width=(.86,1.12),body_height=(.88,1.22),leg_height=(.88,1.38),depth=(.80,1.16),ear_length=(.90,1.40),ear_width=(.80,1.25))
best=dict(DEFAULT_FIT);best_score=-1;best_index=0;seen=set()
count=int(os.environ.get('LABRADOR_FIT_COUNT','100'))
with open(folder+'/iterations.jsonl','w',encoding='utf-8') as log:
    for i in range(1,count+1):
        proposal=best.copy()
        if i>1:
            # Fresh proposals, never cosmetic changes to the counter or camera.
            for key in rng.choice(list(bounds),size=2 if i<65 else 1,replace=False):
                low,high=bounds[key];sigma=(high-low)*(.23 if i<35 else .12 if i<70 else .06)
                proposal[key]=float(np.clip(proposal[key]+rng.normal(0,sigma),low,high))
        while tuple(proposal.values()) in seen:
            key=str(rng.choice(list(bounds)));proposal[key]=float(rng.uniform(*bounds[key]))
        seen.add(tuple(proposal.values()))
        apply_fit(captured,proposal)
        scores,score=evaluate(i);accepted=score>best_score
        if accepted:best=proposal.copy();best_score=score;best_index=i
        record=dict(iteration=i,parameters=proposal,view_iou=scores,mean_silhouette_iou=score,accepted=accepted,best_iteration=best_index)
        log.write(json.dumps(record)+'\n');log.flush()
        with open(folder+'/best.json','w') as f:json.dump(dict(parameters=best,mean_silhouette_iou=best_score,iteration=best_index,metric='silhouette IoU, NOT perceptual similarity'),f,indent=2)
        print('FIT_PROGRESS',i,round(score,4),best_index,flush=True)
apply_fit(captured,best)
print('FIT_FINISHED',json.dumps(dict(best=best,score=best_score,index=best_index)),flush=True)
