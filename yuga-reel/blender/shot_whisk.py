"""03 Ritual: a chasen whisks matcha to a fine foam in a raku chawan, soft window light."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import numpy as np
from mathutils import Vector

from common import area, args, camera, ease, lerp, link, mat, points_object, render_frames, reset, set_points, smooth, world_color

o = args()
reset(o['samples'], o['scale'], motion_blur=True)
world_color((0.006, 0.005, 0.004), 1.0)
rng = np.random.default_rng(4)

W0, W1 = 18, 150
LIQ_Z = 0.052

# ---- linen table ----
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
table = bpy.context.active_object
m = mat('Linen', (0.06, 0.05, 0.04), rough=0.85, **{'Sheen Weight': 0.4})
nt = m.node_tree; p = nt.nodes['Principled BSDF']
tc = nt.nodes.new('ShaderNodeTexCoord')
w1 = nt.nodes.new('ShaderNodeTexWave'); w1.bands_direction = 'X'; w1.inputs['Scale'].default_value = 900; w1.inputs['Distortion'].default_value = 2
w2 = nt.nodes.new('ShaderNodeTexWave'); w2.bands_direction = 'Y'; w2.inputs['Scale'].default_value = 900; w2.inputs['Distortion'].default_value = 2
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 30
for n in (w1, w2, nz):
    nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
mx = nt.nodes.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'
nt.links.new(w1.outputs['Fac'], mx.inputs[0]); nt.links.new(w2.outputs['Fac'], mx.inputs[1])
bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.3; bump.inputs['Distance'].default_value = 0.0005
nt.links.new(mx.outputs[0], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], p.inputs['Normal'])
cr = nt.nodes.new('ShaderNodeValToRGB')
cr.color_ramp.elements[0].color = (0.018, 0.015, 0.012, 1); cr.color_ramp.elements[1].color = (0.045, 0.036, 0.027, 1)
nt.links.new(nz.outputs['Fac'], cr.inputs['Fac']); nt.links.new(cr.outputs[0], p.inputs['Base Color'])
table.data.materials.append(m)

# ---- chawan (lathe) ----
prof_out = [(0.022, 0.0), (0.026, 0.0), (0.027, 0.008), (0.035, 0.009), (0.05, 0.02), (0.058, 0.04), (0.061, 0.06), (0.0615, 0.068)]
prof_in = [(0.0575, 0.068), (0.0565, 0.06), (0.054, 0.042), (0.046, 0.025), (0.032, 0.016), (0.0, 0.014)]
prof = prof_out + [(0.0597, 0.0695)] + prof_in
SEG = 160
verts = []
for i in range(SEG):
    a = 2 * math.pi * i / SEG
    wob = 1 + 0.012 * math.sin(a * 3 + 0.5) + 0.006 * math.sin(a * 7)
    for r, z in prof:
        verts.append((math.cos(a) * r * wob, math.sin(a) * r * wob, z * (1 + 0.01 * math.sin(a * 2))))
faces = []
P = len(prof)
for i in range(SEG):
    j = (i + 1) % SEG
    for k in range(P - 1):
        faces.append((i * P + k, j * P + k, j * P + k + 1, i * P + k + 1))
me = bpy.data.meshes.new('Chawan'); me.from_pydata(verts, [], faces); me.update()
bowl = link(bpy.data.objects.new('Chawan', me)); smooth(bowl)
sub = bowl.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2
gm = mat('Raku', (0.02, 0.017, 0.015), rough=0.22, **{'Coat Weight': 0.6, 'Coat Roughness': 0.08})
nt = gm.node_tree; p = nt.nodes['Principled BSDF']
tc = nt.nodes.new('ShaderNodeTexCoord')
n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 25; n1.inputs['Detail'].default_value = 8
nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
cr = nt.nodes.new('ShaderNodeValToRGB')
cr.color_ramp.elements[0].position = 0.45; cr.color_ramp.elements[0].color = (0.012, 0.011, 0.01, 1)
cr.color_ramp.elements[1].position = 0.7; cr.color_ramp.elements[1].color = (0.11, 0.06, 0.03, 1)
nt.links.new(n1.outputs['Fac'], cr.inputs['Fac']); nt.links.new(cr.outputs[0], p.inputs['Base Color'])
vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.feature = 'DISTANCE_TO_EDGE'; vor.inputs['Scale'].default_value = 140
nt.links.new(tc.outputs['Object'], vor.inputs['Vector'])
cmp = nt.nodes.new('ShaderNodeMath'); cmp.operation = 'LESS_THAN'; cmp.inputs[1].default_value = 0.03
nt.links.new(vor.outputs['Distance'], cmp.inputs[0])
b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = 0.15; b.inputs['Distance'].default_value = 0.0002
nt.links.new(cmp.outputs[0], b.inputs['Height'])
nt.links.new(b.outputs['Normal'], p.inputs['Coat Normal'])
n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 300
nt.links.new(tc.outputs['Object'], n2.inputs['Vector'])
b2 = nt.nodes.new('ShaderNodeBump'); b2.inputs['Strength'].default_value = 0.25; b2.inputs['Distance'].default_value = 0.0003
nt.links.new(n2.outputs['Fac'], b2.inputs['Height']); nt.links.new(b2.outputs['Normal'], p.inputs['Normal'])
bowl.data.materials.append(gm)

# ---- the tea ----
bpy.ops.mesh.primitive_circle_add(vertices=160, radius=0.0552, fill_type='TRIFAN', location=(0, 0, LIQ_Z))
tea = bpy.context.active_object
tm = mat('Tea', (0.08, 0.16, 0.02), rough=0.05, **{'Sheen Weight': 0.0, 'Sheen Tint': (0.9, 1.0, 0.7), 'Subsurface Weight': 0.3,
                                                    'Subsurface Radius': (0.2, 0.5, 0.08), 'Subsurface Scale': 0.004})
nt = tm.node_tree; p = nt.nodes['Principled BSDF']
foam = nt.nodes.new('ShaderNodeValue'); foam.name = 'foam'
tc = nt.nodes.new('ShaderNodeTexCoord')
col = nt.nodes.new('ShaderNodeMix'); col.data_type = 'RGBA'
col.inputs['A'].default_value = (0.05, 0.1, 0.015, 1); col.inputs['B'].default_value = (0.36, 0.6, 0.1, 1)
nt.links.new(foam.outputs[0], col.inputs['Factor'])
nt.links.new(col.outputs['Result'], p.inputs['Base Color'])
rmix = nt.nodes.new('ShaderNodeMapRange'); rmix.inputs['To Min'].default_value = 0.04; rmix.inputs['To Max'].default_value = 0.55
nt.links.new(foam.outputs[0], rmix.inputs['Value']); nt.links.new(rmix.outputs[0], p.inputs['Roughness'])
nt.links.new(foam.outputs[0], p.inputs['Sheen Weight'])
fv = nt.nodes.new('ShaderNodeTexVoronoi'); fv.inputs['Scale'].default_value = 2200; fv.feature = 'SMOOTH_F1'
nt.links.new(tc.outputs['Object'], fv.inputs['Vector'])
fn = nt.nodes.new('ShaderNodeTexNoise'); fn.inputs['Scale'].default_value = 400; fn.inputs['Detail'].default_value = 6
nt.links.new(tc.outputs['Object'], fn.inputs['Vector'])
hsum = nt.nodes.new('ShaderNodeMath'); hsum.operation = 'ADD'
nt.links.new(fv.outputs['Distance'], hsum.inputs[0]); nt.links.new(fn.outputs['Fac'], hsum.inputs[1])
fb = nt.nodes.new('ShaderNodeBump'); fb.inputs['Distance'].default_value = 0.0002
nt.links.new(hsum.outputs[0], fb.inputs['Height'])
nt.links.new(foam.outputs[0], fb.inputs['Strength'])
# ripples radiating from the whisk
wh = bpy.data.objects.new('WhiskPivot', None); link(wh)
tcw = nt.nodes.new('ShaderNodeTexCoord'); tcw.object = wh
ln = nt.nodes.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
nt.links.new(tcw.outputs['Object'], ln.inputs[0])
phase = nt.nodes.new('ShaderNodeValue'); phase.name = 'phase'
m1 = nt.nodes.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; m1.inputs[1].default_value = 900
nt.links.new(ln.outputs['Value'], m1.inputs[0])
m2 = nt.nodes.new('ShaderNodeMath'); m2.operation = 'SUBTRACT'
nt.links.new(m1.outputs[0], m2.inputs[0]); nt.links.new(phase.outputs[0], m2.inputs[1])
sn = nt.nodes.new('ShaderNodeMath'); sn.operation = 'SINE'; nt.links.new(m2.outputs[0], sn.inputs[0])
fall = nt.nodes.new('ShaderNodeMath'); fall.operation = 'MULTIPLY'; fall.inputs[1].default_value = -60
nt.links.new(ln.outputs['Value'], fall.inputs[0])
ex = nt.nodes.new('ShaderNodeMath'); ex.operation = 'EXPONENT'; nt.links.new(fall.outputs[0], ex.inputs[0])
rip = nt.nodes.new('ShaderNodeMath'); rip.operation = 'MULTIPLY'
nt.links.new(sn.outputs[0], rip.inputs[0]); nt.links.new(ex.outputs[0], rip.inputs[1])
ripamt = nt.nodes.new('ShaderNodeValue'); ripamt.name = 'ripamt'
rb = nt.nodes.new('ShaderNodeBump'); rb.inputs['Distance'].default_value = 0.0006
nt.links.new(rip.outputs[0], rb.inputs['Height']); nt.links.new(ripamt.outputs[0], rb.inputs['Strength'])
nt.links.new(fb.outputs['Normal'], rb.inputs['Normal'])
nt.links.new(rb.outputs['Normal'], p.inputs['Normal'])
tea.data.materials.append(tm)

# undissolved powder clumps floating before whisking
CL = 400
clumps = points_object('Clumps', CL, mat('Clump', (0.07, 0.15, 0.015), rough=1.0))
cpos = np.zeros((CL, 3)); ca = rng.random(CL) * 2 * np.pi; cr_ = np.sqrt(rng.random(CL)) * 0.025
cpos[:, 0] = np.cos(ca) * cr_; cpos[:, 1] = np.sin(ca) * cr_; cpos[:, 2] = LIQ_Z + 0.0003
csz = 0.0004 + rng.random(CL) * 0.0012

# bubbles: coarse first, finer as the foam builds
NB = 1600
bubbles = points_object('Bubbles', NB, mat('Bubble', (0.55, 0.75, 0.3), rough=0.05, **{'Transmission Weight': 0.6, 'IOR': 1.33}))
ba = rng.random(NB) * 2 * np.pi; br = np.sqrt(rng.random(NB)) * 0.052
bat = rng.random(NB); bsz = 0.00025 + rng.random(NB) ** 3 * 0.001

# ---- chasen ----
bamboo = mat('Bamboo', (0.42, 0.3, 0.14), rough=0.35, **{'Coat Weight': 0.3})
tine_m = mat('Tine', (0.6, 0.48, 0.28), rough=0.4, **{'Subsurface Weight': 0.3, 'Subsurface Radius': (0.8, 0.6, 0.3), 'Subsurface Scale': 0.002})
chasen = bpy.data.objects.new('Chasen', None); link(chasen)
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.0105, depth=0.07, location=(0, 0, 0.062))
handle = bpy.context.active_object; handle.data.materials.append(bamboo); handle.parent = chasen; smooth(handle)
bv = handle.modifiers.new('bv', 'BEVEL'); bv.width = 0.002; bv.segments = 4
bpy.ops.mesh.primitive_torus_add(major_radius=0.0108, minor_radius=0.0012, location=(0, 0, 0.075))
node = bpy.context.active_object; node.data.materials.append(bamboo); node.parent = chasen
cu = bpy.data.curves.new('Tines', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.00035; cu.bevel_resolution = 2
for i in range(110):
    a = 2 * math.pi * i / 110 + (rng.random() - 0.5) * 0.02
    outer = i % 2 == 0
    rt = 0.031 if outer else 0.018
    pts = []
    for k in range(9):
        t = k / 8
        rr = 0.0095 + (rt - 0.0095) * math.sin(t * math.pi / 2) ** 1.3
        if outer and t > 0.85:
            rr -= (t - 0.85) * 0.03
        pts.append((math.cos(a) * rr, math.sin(a) * rr, 0.028 - t * 0.05))
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for spt, (x, y, z) in zip(sp.points, pts):
        spt.co = (x, y, z, 1)
tines = bpy.data.objects.new('Tines', cu); link(tines); tines.parent = chasen
cu.materials.append(tine_m)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.008, depth=0.012, location=(0, 0, 0.024))
core = bpy.context.active_object; core.data.materials.append(tine_m); core.parent = chasen

# ---- chashaku resting by the bowl ----
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.085, -0.05, 0.0025))
sc = bpy.context.active_object; sc.scale = (0.18, 0.009, 0.0025); sc.rotation_euler[2] = math.radians(-58)
sc.data.materials.append(bamboo)
bv = sc.modifiers.new('bv', 'BEVEL'); bv.width = 0.002; bv.segments = 4

# ---- light: soft window from the left, gentle back rim ----
area('Window', (-0.7, 0.25, 0.55), (0, 0, 0.05), size=(0.9, 0.6), energy=11, color=(1.0, 0.95, 0.86))
area('Rim', (0.35, 0.45, 0.25), (0, 0, 0.06), size=(0.3, 0.1), energy=2.5, color=(0.9, 1.0, 0.85))
area('Bounce', (0.4, -0.4, 0.3), (0, 0, 0.04), size=(0.4, 0.4), energy=0.4, color=(1, 0.9, 0.8))

cam = camera(lens=70, fstop=4.5)
focus = bpy.data.objects.new('Focus', None); link(focus)
cam.data.dof.focus_object = focus


def whisk_xy(f):
    ramp = np.interp(f, [W0, W0 + 25, W1 - 20, W1], [0, 1, 1, 0.3])
    ph = (f - W0) * 0.62 * (0.4 + ramp * 0.6)
    return math.sin(ph) * 0.026 * ramp + math.sin(f / 9) * 0.004, math.sin(ph * 2) * 0.01 * ramp + math.cos(f / 13) * 0.005, ramp


def update(scene, *_):
    f = scene.frame_current_final
    x, y, ramp = whisk_xy(f)
    lift = ease((f - (W1 - 6)) / 32)
    chasen.location = (x, y, LIQ_Z + 0.004 + lift * 0.12)
    chasen.rotation_euler = (math.sin(f * 0.7) * 0.08 * ramp + lift * 0.3, math.cos(f * 0.6) * 0.08 * ramp, f * 0.05)
    wh.location = (x, y, LIQ_Z)
    fm = ease((f - W0 - 5) / (W1 - W0))
    tm.node_tree.nodes['foam'].outputs[0].default_value = fm
    tm.node_tree.nodes['phase'].outputs[0].default_value = f * 1.6
    tm.node_tree.nodes['ripamt'].outputs[0].default_value = 0.35 * ramp * (1 - lift)
    swirl = lerp(0, 2.6, ease((f - W0) / (W1 + 40 - W0)))
    tea.rotation_euler[2] = swirl
    # clumps dissolve
    cv = max(0.0, 1 - fm * 2.5)
    set_points(clumps, cpos, csz * cv)
    # bubbles
    appear = np.clip((f - (W0 + 8 + bat * 70)) / 8, 0, 1)
    fade = np.clip(1 - (fm - (0.55 + bat * 0.35)) / 0.1, 0.25, 1)
    rr = bsz * appear * fade * lerp(1.1, 0.4, fm)
    pos = np.stack([np.cos(ba + swirl * 0.9) * br, np.sin(ba + swirl * 0.9) * br, np.full(NB, LIQ_Z + 0.0001)], 1)
    set_points(bubbles, pos, rr)

    c = ease(f / 200)
    cam.location = (lerp(-0.03, 0.02, c), lerp(-0.2, -0.17, c), lerp(0.66, 0.56, c))
    tgt = Vector((0.004, -0.03, 0.0))
    cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
    focus.location = (0, 0, LIQ_Z)


bpy.app.handlers.frame_change_pre.append(update)
render_frames(o, 'whisk')
