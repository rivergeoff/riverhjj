"""Hero: the YUGA tin on wet slate. Camera pulls back from the lid while the tin turns to camera;
the lid lifts and a breath of matcha escapes."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import numpy as np

from common import area, args, camera, ease, ease_out, emission_mat, lerp, link, mat, points_object, render_frames, reset, set_points, spot, world_color
from props import H, R, build_tin, matcha_material, mound, slate

o = args()
reset(o['samples'], o['scale'], motion_blur=False)
world_color((0.004, 0.006, 0.005), 1.0)

slate()
tin, lid = build_tin()
mound('Heap', 0.03, 0.014, (0.062, -0.045, 0), seed=3)
mound('Heap2', 0.01, 0.004, (0.035, -0.08, 0), seed=7, res=80)

# loose grains scattered on the slate
rng = np.random.default_rng(5)
grains = points_object('Grains', 6000, matcha_material('GrainMat'))
gp = np.zeros((6000, 3))
ang = rng.random(6000) * 2 * np.pi
rad = 0.03 + rng.gamma(1.6, 0.025, 6000)
gp[:, 0] = 0.062 + np.cos(ang) * rad
gp[:, 1] = -0.045 + np.sin(ang) * rad * 0.8
gp[:, 2] = 0.0002
set_points(grains, gp, 0.00015 + rng.random(6000) ** 3 * 0.0004)

# dark backdrop wall with a pool of light
bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0.9, 1.0), rotation=(math.radians(90), 0, 0))
wall = bpy.context.active_object
wall.data.materials.append(mat('Wall', (0.012, 0.02, 0.014), rough=0.9))
spot('WallPool', (0.0, -0.3, 0.6), (0.0, 0.9, 0.25), energy=14, color=(0.85, 1.0, 0.7), angle=26, blend=1.0)

# lighting: large warm key, cool rims, top fill, plus a softbox card for the gold to reflect
area('Key', (-0.45, -0.38, 0.35), (0, 0, 0.06), size=(0.35, 0.35), energy=9, color=(1.0, 0.86, 0.68))
area('RimL', (-0.32, 0.32, 0.18), (0, 0, 0.07), size=(0.04, 0.5), energy=26, color=(0.85, 1.0, 0.78))
area('RimR', (0.32, 0.30, 0.2), (0, 0, 0.07), size=(0.04, 0.5), energy=32, color=(1.0, 0.95, 0.85))
area('Top', (0, 0.05, 0.6), (0, 0, 0), size=(0.3, 0.3), energy=1.5, color=(1.0, 0.95, 0.9))
# flag the rims: they only light the tin and the lid (light linking)
tin_only = bpy.data.collections.new('TinOnly')
for ob in bpy.data.objects:
    if ob.type == 'MESH' and ob.parent is not None and (ob.parent.name in ('Tin', 'Lid')):
        tin_only.objects.link(ob)
for name in ('RimL', 'RimR'):
    bpy.data.objects[name].light_linking.receiver_collection = tin_only
# powder breath from the open tin
PUFF = 5000
puff = points_object('Puff', PUFF, matcha_material('PuffMat', (0.3, 0.55, 0.06)))
pa = rng.random(PUFF) * 2 * np.pi
pr = np.sqrt(rng.random(PUFF)) * R * 0.9
pu = 0.01 + rng.gamma(1.5, 0.03, PUFF)
po = 0.004 + rng.gamma(1.2, 0.02, PUFF)
pph = rng.random(PUFF) * 100
psz = 0.0001 + rng.random(PUFF) ** 4 * 0.0003

cam = camera(lens=90, fstop=2.4)
focus = bpy.data.objects.new('Focus', None); link(focus)
cam.data.dof.focus_object = focus


def per_frame(f):
    t = f / 30.0
    tin.rotation_euler[2] = lerp(-2.4, 0.12, ease_out(f / 185))
    up = ease((f - 96) / 32) * (1 - ease((f - 150) / 22))
    lid.location[2] = H - 0.008 + up * 0.045
    lid.rotation_euler = (up * 0.12, 0, up * -0.2)
    lid.location[0] = up * 0.006

    pt = max(0.0, (f - 104) / 30)
    k = 1 - np.exp(-pt * 1.4)
    pos = np.zeros((PUFF, 3))
    curl = 0.012 * k
    pos[:, 0] = np.cos(pa) * (pr + po * k) + np.sin(pu * 90 + pt * 1.5 + pph) * curl
    pos[:, 1] = np.sin(pa) * (pr + po * k) + np.cos(pu * 70 + pt * 1.2 + pph) * curl
    pos[:, 2] = H - 0.004 + pu * k * (0.4 + 0.6 * np.minimum(1, pph / 50))
    rad = psz * (1.0 if f > 104 else 0.0) * max(0.0, 1 - max(0.0, (f - 150) / 40))
    set_points(puff, pos, np.full(PUFF, 0.0) + rad)

    c = ease(f / 120)
    cam.location = (lerp(0.07, 0.0, c), lerp(-0.26, -0.82, c), lerp(0.15, 0.13, c))
    target = np.array([0, 0, lerp(0.112, 0.035, c)])
    d = target - np.array(cam.location)
    from mathutils import Vector
    cam.rotation_euler = Vector(d).to_track_quat('-Z', 'Y').to_euler()
    focus.location = (0, -R, lerp(0.112, 0.06, c))


render_frames(o, 'hero', per_frame)
