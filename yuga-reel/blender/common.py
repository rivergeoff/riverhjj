"""Shared Blender helpers for the YUGA photoreal shots (Cycles, physically based)."""
import math
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(ROOT, 'blender', 'tex')


def args():
    """--frames START END  --samples N  --scale PCT  --out DIR"""
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    o = {'start': 1, 'end': 1, 'samples': 96, 'scale': 100, 'out': None, 'step': 1}
    i = 0
    while i < len(a):
        if a[i] == '--frames':
            o['start'], o['end'] = int(a[i + 1]), int(a[i + 2]); i += 3
        elif a[i] == '--samples':
            o['samples'] = int(a[i + 1]); i += 2
        elif a[i] == '--scale':
            o['scale'] = int(a[i + 1]); i += 2
        elif a[i] == '--step':
            o['step'] = int(a[i + 1]); i += 2
        elif a[i] == '--out':
            o['out'] = a[i + 1]; i += 2
        else:
            i += 1
    return o


def reset(samples=96, scale=100, motion_blur=True):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.cycles.device = 'CPU'
    s.cycles.samples = samples
    s.cycles.use_adaptive_sampling = True
    s.cycles.adaptive_threshold = 0.03
    s.render.use_persistent_data = True
    s.cycles.use_auto_tile = False
    s.cycles.use_denoising = True
    s.cycles.denoiser = 'OPENIMAGEDENOISE'
    s.cycles.max_bounces = 6
    s.cycles.diffuse_bounces = 2
    s.cycles.glossy_bounces = 3
    s.cycles.transmission_bounces = 8
    s.cycles.blur_glossy = 0.5
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    s.render.resolution_x = 1080
    s.render.resolution_y = 1920
    s.render.resolution_percentage = scale
    s.render.fps = 30
    s.render.use_motion_blur = motion_blur
    s.render.motion_blur_shutter = 0.5
    s.render.film_transparent = False
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGB'
    s.render.image_settings.color_depth = '8'
    s.view_settings.view_transform = 'AgX'
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast'):
        try:
            s.view_settings.look = look
            break
        except TypeError:
            pass
    s.render.threads_mode = 'AUTO'
    world = bpy.data.worlds.new('World')
    s.world = world
    world.use_nodes = True
    return s


def world_color(rgb, strength=1.0):
    bg = bpy.context.scene.world.node_tree.nodes['Background']
    bg.inputs[0].default_value = (*rgb, 1)
    bg.inputs[1].default_value = strength


def mat(name, color=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    for k, v in kw.items():
        inp = p.inputs.get(k)
        if inp is None:
            continue
        inp.default_value = (*v, 1) if inp.type == 'RGBA' and len(v) == 3 else v
    return m


def nodes(m):
    return m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']


def emission_mat(name, rgb, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = (*rgb, 1)
    e.inputs[1].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(e.outputs[0], o.inputs[0])
    return m


def area(name, loc, target, size=(1, 1), energy=200, color=(1, 1, 1), shape='RECTANGLE', spread=None):
    d = bpy.data.lights.new(name, 'AREA')
    d.shape = shape
    d.size, d.size_y = size
    d.energy = energy
    d.color = color
    if spread is not None:
        d.spread = spread
    o = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    return o


def spot(name, loc, target, energy=500, color=(1, 1, 1), angle=40, blend=0.6, radius=0.1):
    d = bpy.data.lights.new(name, 'SPOT')
    d.energy = energy
    d.color = color
    d.spot_size = math.radians(angle)
    d.spot_blend = blend
    d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    return o


def look_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def camera(lens=85, fstop=2.8, sensor=36):
    c = bpy.data.cameras.new('Cam')
    c.lens = lens
    c.sensor_width = sensor
    c.dof.use_dof = True
    c.dof.aperture_fstop = fstop
    c.dof.aperture_blades = 9
    c.dof.aperture_rotation = 0.2
    o = bpy.data.objects.new('Cam', c)
    bpy.context.scene.collection.objects.link(o)
    bpy.context.scene.camera = o
    return o


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def lerp(a, b, t):
    return a + (b - a) * t


def render_frames(o, shot, per_frame=None):
    s = bpy.context.scene
    out = o['out'] or os.path.join(ROOT, 'renders', shot)
    os.makedirs(out, exist_ok=True)
    for f in range(o['start'], o['end'] + 1, o['step']):
        path = os.path.join(out, f'{f:04d}.png')
        if os.path.exists(path):
            continue
        s.frame_set(f)
        if per_frame:
            per_frame(f)
        s.render.filepath = path
        bpy.ops.render.render(write_still=True)
        print('RENDERED', shot, f, flush=True)


def points_object(name, count, material, radius_attr=True):
    """Mesh whose vertices become render points (Cycles point primitives) via Geometry Nodes."""
    me = bpy.data.meshes.new(name)
    me.vertices.add(count)
    if radius_attr:
        me.attributes.new('radius', 'FLOAT', 'POINT')
    ob = bpy.data.objects.new(name, me)
    link(ob)
    ng = bpy.data.node_groups.new(name + '_gn', 'GeometryNodeTree')
    ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    n = ng.nodes
    gi = n.new('NodeGroupInput'); go = n.new('NodeGroupOutput')
    m2p = n.new('GeometryNodeMeshToPoints')
    rad = n.new('GeometryNodeInputNamedAttribute'); rad.data_type = 'FLOAT'; rad.inputs['Name'].default_value = 'radius'
    sm = n.new('GeometryNodeSetMaterial'); sm.inputs['Material'].default_value = material
    ng.links.new(gi.outputs[0], m2p.inputs['Mesh'])
    ng.links.new(rad.outputs[0], m2p.inputs['Radius'])
    ng.links.new(m2p.outputs[0], sm.inputs['Geometry'])
    ng.links.new(sm.outputs[0], go.inputs[0])
    mod = ob.modifiers.new('pts', 'NODES'); mod.node_group = ng
    return ob


def set_points(ob, pos, radii):
    me = ob.data
    me.vertices.foreach_set('co', pos.astype('float32').ravel())
    me.attributes['radius'].data.foreach_set('value', radii.astype('float32'))
    me.update()


def image_node(m, path, non_color=False):
    nt = m.node_tree
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = bpy.data.images.load(path)
    if non_color:
        t.image.colorspace_settings.name = 'Non-Color'
    return t


def noise_bump(m, scale=40.0, strength=0.2, detail=8.0, distance=0.001):
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = detail
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    b = nt.nodes.new('ShaderNodeBump')
    b.inputs['Strength'].default_value = strength
    b.inputs['Distance'].default_value = distance
    nt.links.new(nz.outputs['Fac'], b.inputs['Height'])
    nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
    return nz, b
