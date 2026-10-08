"""02 Stone: a heap of matcha on slate bursts into a slow-motion, backlit cloud."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import numpy as np
from mathutils import Vector

from common import area, args, camera, ease, lerp, link, mat, points_object, render_frames, reset, set_points, world_color
from props import matcha_material, mound, slate

o = args()
reset(o['samples'], o['scale'], motion_blur=True)
world_color((0.0, 0.0, 0.0), 0.0)
slate(wet=False)

BURST = 22
heap = mound('Heap', 0.03, 0.017, (0, 0, 0), seed=11)

N = 60000
rng = np.random.default_rng(2)
r = np.sqrt(rng.random(N)) * 0.03
th = rng.random(N) * 2 * np.pi
h = 0.017 * np.clip(1 - r / 0.03, 0, 1) ** 1.35 * rng.random(N) ** 0.3
start = np.stack([np.cos(th) * r, np.sin(th) * r, h], 1)
u = rng.random(N) * 2 * np.pi
v = np.arccos(1 - rng.random(N) * 1.1)
dirs = np.stack([np.sin(v) * np.cos(u), np.sin(v) * np.sin(u), np.cos(v) * 0.9 + 0.3], 1)
dirs /= np.linalg.norm(dirs, axis=1, keepdims=True)
speed = 0.015 + rng.random(N) ** 2.2 * 0.2
ph = rng.random(N) * 100
size = 0.00006 + rng.random(N) ** 6 * 0.00028
cloud = points_object('Cloud', N, matcha_material('CloudMat', (0.26, 0.5, 0.05)))

# rim/back lights invisible to camera
back = area('Back', (0, 0.35, 0.16), (0, 0, 0.04), size=(0.25, 0.25), energy=14, color=(1.0, 0.93, 0.78))
back.visible_camera = False
side = area('Side', (-0.35, 0.05, 0.25), (0, 0, 0.06), size=(0.08, 0.3), energy=5, color=(0.85, 1.0, 0.8))
side.visible_camera = False
area('Fill', (0.2, -0.4, 0.3), (0, 0, 0.03), size=(0.3, 0.3), energy=1.2, color=(1.0, 0.95, 0.88))

dust = bpy.data.collections.new('Dust')
for ob in (cloud, heap):
    dust.objects.link(ob)
for L in (back, side):
    L.light_linking.receiver_collection = dust
cam = camera(lens=100, fstop=5.6)
focus = bpy.data.objects.new('Focus', None); link(focus)
cam.data.dof.focus_object = focus


def update(scene, *_):
    f = scene.frame_current_final
    t = max(0.0, (f - BURST) / 30.0)
    k = 1 - np.exp(-t * 2.6)
    p = start + dirs * (speed * k)[:, None]
    swirl = t * 0.6
    p[:, 0] += np.sin(p[:, 2] * 60 + ph + swirl) * 0.006 * k
    p[:, 1] += np.cos(p[:, 0] * 55 + ph * 0.7 + swirl) * 0.006 * k
    p[:, 2] += np.sin(p[:, 1] * 50 + ph * 1.3) * 0.003 * k - 0.004 * t * t
    p[:, 2] = np.maximum(p[:, 2], 0.0002)
    set_points(cloud, p, size * (1.0 if f >= BURST - 1 else 0.0))
    heap.scale = (1, 1, 1 - 0.55 * ease((f - BURST + 1) / 8))

    c = ease(f / 150)
    a = lerp(-0.2, 0.22, c)
    dist = lerp(0.5, 0.72, c)
    cam.location = (math.sin(a) * dist, -math.cos(a) * dist, lerp(0.05, 0.1, c))
    tgt = Vector((0, 0, lerp(0.03, 0.075, c)))
    cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
    focus.location = (0, 0, lerp(0.015, 0.05, c))


bpy.app.handlers.frame_change_pre.append(update)
render_frames(o, 'powder')
