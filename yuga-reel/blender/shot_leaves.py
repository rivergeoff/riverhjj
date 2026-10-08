"""01 Shade: a backlit sprig of young tea leaves with dew, dappled light through shade cloth."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import numpy as np
from mathutils import Euler, Vector

from common import TEX, args, camera, ease, emission_mat, image_node, lerp, link, mat, render_frames, reset, smooth, world_color

o = args()
reset(o['samples'], o['scale'], motion_blur=False)
rng = np.random.default_rng(8)

# soft green sky
wn = bpy.context.scene.world.node_tree
bg = wn.nodes['Background']
grad_tc = wn.nodes.new('ShaderNodeTexCoord')
sep = wn.nodes.new('ShaderNodeSeparateXYZ')
wn.links.new(grad_tc.outputs['Generated'], sep.inputs[0])
ramp = wn.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.004, 0.012, 0.004, 1)
ramp.color_ramp.elements[1].color = (0.12, 0.17, 0.05, 1)
wn.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
wn.links.new(ramp.outputs[0], bg.inputs[0])
bg.inputs[1].default_value = 1.0


def leaf_material(name, tint=1.0, coat=0.25):
    m = mat(name, rough=0.32 if coat else 0.6, **{'Coat Weight': coat, 'Coat Roughness': 0.15})
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    col = image_node(m, os.path.join(TEX, 'leaf_col.png'))
    bmp = image_node(m, os.path.join(TEX, 'leaf_bump.png'), non_color=True)
    hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Value'].default_value = tint
    nt.links.new(col.outputs[0], hsv.inputs['Color'])
    nt.links.new(hsv.outputs[0], p.inputs['Base Color'])
    b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = 0.6; b.inputs['Distance'].default_value = 0.0004
    nt.links.new(bmp.outputs[0], b.inputs['Height']); nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
    tr = nt.nodes.new('ShaderNodeBsdfTranslucent')
    nt.links.new(hsv.outputs[0], tr.inputs['Color'])
    mix = nt.nodes.new('ShaderNodeMixShader'); mix.inputs[0].default_value = 0.35
    out = nt.nodes['Material Output']
    nt.links.new(p.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return m


def leaf(name, L, W, m, fold=0.35, arch=0.12, teeth=28):
    nu, nv = 24, 90
    verts, faces, uvs = [], [], []
    for j in range(nv + 1):
        v = j / nv
        w = W * math.sin(math.pi * v ** 0.75) * (1 - 0.15 * v)
        for i in range(nu + 1):
            u = i / nu * 2 - 1
            ww = w
            if abs(u) > 0.99 and 0.06 < v < 0.96:
                ww *= 1 - 0.05 * ((v * teeth) % 1) ** 2
            x = u * ww
            y = v * L
            z = -fold * abs(u) * ww * 0.5 + arch * L * math.sin(math.pi * v) * 0.5 - 0.08 * L * v * v
            verts.append((x, y, z))
            uvs.append(((u + 1) / 2, v))
    for j in range(nv):
        for i in range(nu):
            a = j * (nu + 1) + i
            faces.append((a, a + 1, a + nu + 2, a + nu + 1))
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces)
    uvl = me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        for li in poly.loop_indices:
            uvl.data[li].uv = uvs[me.loops[li].vertex_index]
    me.update()
    ob = link(bpy.data.objects.new(name, me)); smooth(ob)
    sol = ob.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.0003
    me.materials.append(m)
    return ob


hero_m = leaf_material('LeafHero', 1.0)
dark_m = leaf_material('LeafDark', 0.55, coat=0.0)

# branch
cu = bpy.data.curves.new('Branch', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0016; cu.bevel_resolution = 3
sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
for bp, co in zip(sp.bezier_points, [(-0.02, -0.12, -0.03), (0.0, -0.02, 0.0), (0.012, 0.08, 0.02)]):
    bp.co = co; bp.handle_left_type = bp.handle_right_type = 'AUTO'
branch = link(bpy.data.objects.new('Branch', cu))
cu.materials.append(mat('Stem', (0.12, 0.16, 0.05), rough=0.5))

leaves = []
spec = [  # (y along branch, side angle, length, width, tilt)
    (0.075, 0.2, 0.03, 0.009, 0.3),
    (0.055, -0.9, 0.045, 0.014, 0.5),
    (0.03, 1.1, 0.06, 0.019, 0.45),      # hero leaf (focus)
    (0.0, -1.3, 0.07, 0.022, 0.55),
    (-0.035, 1.4, 0.075, 0.024, 0.6),
    (-0.075, -1.2, 0.08, 0.025, 0.6),
]
for k, (y, side, L, W, tilt) in enumerate(spec):
    lf = leaf(f'Leaf{k}', L, W, hero_m if k < 4 else dark_m, fold=0.5, arch=0.15)
    lf.location = (0.012 * (y / 0.08), y, 0.02 * (y / 0.08))
    lf.rotation_euler = Euler((tilt, 0, side), 'XYZ')
    leaves.append(lf)
hero_leaf = leaves[2]
sprig = link(bpy.data.objects.new('Sprig', None))
sprig.rotation_euler = (math.radians(90), math.radians(-14), math.radians(-20))
for ob in [branch] + leaves:
    ob.parent = sprig

# dew drops on the hero leaf (parented, in leaf space)
dew_m = mat('Dew', (1, 1, 1), rough=0.0, **{'Transmission Weight': 1.0, 'IOR': 1.333})
for (x, y, r) in []:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=(x, y, 0.0))
    d = bpy.context.active_object; d.scale = (1, 1.1, 0.55); smooth(d)
    d.data.materials.append(dew_m)
    d.parent = hero_leaf
    v = y / 0.06
    w = 0.019 * math.sin(math.pi * v ** 0.75) * (1 - 0.15 * v)
    u = x / max(w, 1e-4)
    d.location = (x, y, -0.5 * abs(u) * w * 0.5 + 0.15 * 0.06 * math.sin(math.pi * v) * 0.5 - 0.08 * 0.06 * v * v + r * 0.45)

# out-of-focus foliage behind
for k in range(26):
    lf = leaf(f'Bg{k}', 0.06 + rng.random() * 0.05, 0.02 + rng.random() * 0.01, dark_m, fold=0.4, arch=0.1)
    lf.location = (rng.uniform(-0.35, 0.35), rng.uniform(0.25, 0.9), rng.uniform(-0.25, 0.3))
    lf.rotation_euler = (rng.uniform(0, 1.2), rng.uniform(-0.5, 0.5), rng.uniform(0, 6.28))
# sun glints far behind -> natural bokeh discs
gl = emission_mat('Glint', (0.85, 1.0, 0.45), 5)
for k in range(22):
    yy = rng.uniform(1.2, 2.4)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.003 + rng.random() * 0.004, location=(rng.uniform(-0.18, 0.18) * yy, yy, rng.uniform(-0.3, 0.3) * yy))
    s = bpy.context.active_object; s.data.materials.append(gl)
    s.visible_shadow = False

# backlight sun through shade cloth (gobo with holes)
sun_d = bpy.data.lights.new('Sun', 'SUN'); sun_d.energy = 7.0; sun_d.color = (1.0, 0.9, 0.72); sun_d.angle = math.radians(2)
sun = link(bpy.data.objects.new('Sun', sun_d)); sun.rotation_euler = (math.radians(-55), 0, math.radians(170))
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0.25, 0.35))
gobo = bpy.context.active_object; gobo.rotation_euler = (math.radians(-35), 0, 0)
gm = bpy.data.materials.new('Gobo'); gm.use_nodes = True
nt = gm.node_tree; nt.nodes.clear()
tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9; nz.inputs['Detail'].default_value = 3
mapn = nt.nodes.new('ShaderNodeMapping'); mapn.name = 'drift'
nt.links.new(tc.outputs['Object'], mapn.inputs['Vector']); nt.links.new(mapn.outputs[0], nz.inputs['Vector'])
th = nt.nodes.new('ShaderNodeMath'); th.operation = 'GREATER_THAN'; th.inputs[1].default_value = 0.5
nt.links.new(nz.outputs['Fac'], th.inputs[0])
trn = nt.nodes.new('ShaderNodeBsdfTransparent'); dif = nt.nodes.new('ShaderNodeBsdfDiffuse'); dif.inputs[0].default_value = (0, 0, 0, 1)
mx = nt.nodes.new('ShaderNodeMixShader'); out = nt.nodes.new('ShaderNodeOutputMaterial')
nt.links.new(th.outputs[0], mx.inputs[0]); nt.links.new(dif.outputs[0], mx.inputs[1]); nt.links.new(trn.outputs[0], mx.inputs[2])
nt.links.new(mx.outputs[0], out.inputs['Surface'])
gobo.data.materials.append(gm)
gobo.visible_camera = False; gobo.visible_glossy = False; gobo.visible_transmission = False

fill = bpy.data.lights.new('Fill', 'AREA'); fill.size = 0.3; fill.energy = 0.6; fill.color = (0.85, 1.0, 0.8)
fo = link(bpy.data.objects.new('Fill', fill)); fo.location = (-0.1, -0.25, 0.1)
fo.rotation_euler = (Vector((0, 0.02, 0)) - fo.location).to_track_quat('-Z', 'Y').to_euler()

cam = camera(lens=85, fstop=2.2)
focus = bpy.data.objects.new('Focus', None); link(focus)
focus.parent = hero_leaf; focus.location = (0.004, 0.028, 0.0)
cam.data.dof.focus_object = focus


def update(scene, *_):
    f = scene.frame_current_final
    c = ease(f / 150)
    cam.location = (lerp(0.05, 0.015, c), lerp(-0.42, -0.3, c), lerp(0.0, 0.03, c))
    tgt = Vector((lerp(0.005, 0.01, c), 0.0, lerp(-0.005, 0.03, c)))
    cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sway = math.sin(f / 26) * 0.03
    for k, lf in enumerate(leaves):
        lf.rotation_euler[1] = sway * (1 + k * 0.2)
    gm.node_tree.nodes['drift'].inputs['Location'].default_value = (f * 0.0015, f * 0.0008, 0)


bpy.app.handlers.frame_change_pre.append(update)
render_frames(o, 'leaves')
