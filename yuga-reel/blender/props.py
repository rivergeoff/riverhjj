"""Reusable photoreal props: the YUGA tin, slate surface, matcha mound."""
import math
import os

import bpy
import numpy as np

from common import TEX, image_node, link, mat, noise_bump, smooth

R = 0.04       # tin radius (m)
H = 0.11       # body height
LID_H = 0.032


def tube(name, r, h, seg=256, z0=0.0):
    verts, faces, uvs = [], [], []
    for i in range(seg + 1):
        u = i / seg
        a = 2 * math.pi * u
        x, y = -r * math.sin(a), r * math.cos(a)
        verts += [(x, y, z0), (x, y, z0 + h)]
    for i in range(seg):
        a, b = 2 * i, 2 * i + 2
        faces.append((a, b, b + 1, a + 1))
        uvs.append([(i / seg, 0), ((i + 1) / seg, 0), ((i + 1) / seg, 1), (i / seg, 1)])
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    uvl = me.uv_layers.new(name='UVMap')
    for f, uv in zip(me.polygons, uvs):
        for li, co in zip(f.loop_indices, uv):
            uvl.data[li].uv = co
    me.update()
    ob = bpy.data.objects.new(name, me)
    smooth(ob)
    me.validate()
    return link(ob)


def gold_material():
    m = mat('Gold', (0.83, 0.62, 0.33), rough=0.24, metal=1.0, Anisotropic=0.55)
    noise_bump(m, scale=900.0, strength=0.04, detail=2.0, distance=0.0002)
    return m


def tin_material():
    m = mat('Label', rough=0.3, **{'Coat Weight': 0.8, 'Coat Roughness': 0.12})
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    col = image_node(m, os.path.join(TEX, 'label.png'))
    rough = image_node(m, os.path.join(TEX, 'label_rough.png'), non_color=True)
    nt.links.new(col.outputs[0], p.inputs['Base Color'])
    # paper areas: rough, no coat. lacquer: glossy with coat
    nt.links.new(rough.outputs[0], p.inputs['Roughness'])
    inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    nt.links.new(rough.outputs[0], inv.inputs[1])
    nt.links.new(inv.outputs[0], p.inputs['Coat Weight'])
    return m


def build_tin(origin=(0, 0, 0)):
    gold = gold_material()
    body = tube('TinBody', R, H)
    body.data.materials.append(tin_material())
    parts = [body]
    for z in (0.0006, H - 0.0006):
        bpy.ops.mesh.primitive_torus_add(major_radius=R + 0.0002, minor_radius=0.0011, major_segments=192, minor_segments=16, location=(0, 0, z))
        t = bpy.context.active_object; t.data.materials.append(gold); smooth(t); parts.append(t)
    bpy.ops.mesh.primitive_circle_add(vertices=128, radius=R, fill_type='NGON', location=(0, 0, 0.0001))
    base = bpy.context.active_object; base.data.materials.append(gold); parts.append(base)
    # matcha visible inside when the lid lifts
    powder = mat('PowderTop', (0.22, 0.42, 0.04), rough=1.0, **{'Sheen Weight': 0.6, 'Sheen Tint': (0.7, 0.9, 0.4)})
    noise_bump(powder, scale=400, strength=0.35, distance=0.0008)
    bpy.ops.mesh.primitive_circle_add(vertices=128, radius=R - 0.001, fill_type='NGON', location=(0, 0, H - 0.006))
    pt = bpy.context.active_object; pt.data.materials.append(powder); parts.append(pt)

    tin = bpy.data.objects.new('Tin', None); link(tin)
    tin.location = origin
    for p in parts:
        p.parent = tin

    # lid with rounded edges
    lid = bpy.data.objects.new('Lid', None); link(lid)
    lid.parent = tin
    lid.location = (0, 0, H - 0.008)
    bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=R + 0.0012, depth=LID_H, location=(0, 0, 0))
    cap = bpy.context.active_object
    cap.location = (0, 0, LID_H / 2)
    cap.data.materials.append(gold)
    bv = cap.modifiers.new('bevel', 'BEVEL'); bv.width = 0.0018; bv.segments = 6; bv.limit_method = 'ANGLE'
    smooth(cap)
    bpy.ops.object.shade_auto_smooth() if hasattr(bpy.ops.object, 'shade_auto_smooth') else None
    cap.parent = lid
    bpy.ops.mesh.primitive_torus_add(major_radius=R * 0.72, minor_radius=0.0005, major_segments=192, minor_segments=8, location=(0, 0, LID_H + 0.0001))
    ring = bpy.context.active_object; ring.data.materials.append(gold); ring.parent = lid
    return tin, lid


def slate(size=3.0, wet=True):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    fl = bpy.context.active_object
    m = mat('Slate', (0.02, 0.022, 0.022), rough=0.45, **{'Specular IOR Level': 0.04})
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    # colour variation
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 6; n1.inputs['Detail'].default_value = 10
    nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (0.012, 0.014, 0.014, 1)
    cr.color_ramp.elements[1].color = (0.05, 0.05, 0.048, 1)
    nt.links.new(n1.outputs['Fac'], cr.inputs['Fac'])
    nt.links.new(cr.outputs[0], p.inputs['Base Color'])
    # wet patches: glossy pools
    n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 3; n2.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], n2.inputs['Vector'])
    rr = nt.nodes.new('ShaderNodeMapRange')
    rr.inputs['From Min'].default_value = 0.45; rr.inputs['From Max'].default_value = 0.6
    rr.inputs['To Min'].default_value = 0.75; rr.inputs['To Max'].default_value = 0.35 if wet else 0.6
    nt.links.new(n2.outputs['Fac'], rr.inputs['Value'])
    nt.links.new(rr.outputs[0], p.inputs['Roughness'])
    # cleft texture
    n3 = nt.nodes.new('ShaderNodeTexNoise'); n3.inputs['Scale'].default_value = 60; n3.inputs['Detail'].default_value = 12
    n3.inputs['Roughness'].default_value = 0.7
    nt.links.new(tc.outputs['Object'], n3.inputs['Vector'])
    b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = 0.35; b.inputs['Distance'].default_value = 0.002
    nt.links.new(n3.outputs['Fac'], b.inputs['Height'])
    nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
    fl.data.materials.append(m)
    return fl


def matcha_material(name='Matcha', color=(0.2, 0.42, 0.035)):
    m = mat(name, color, rough=1.0, **{'Sheen Weight': 0.8, 'Sheen Roughness': 0.4, 'Sheen Tint': (0.75, 0.95, 0.45),
                                        'Subsurface Weight': 0.15, 'Subsurface Radius': (0.3, 0.6, 0.1), 'Subsurface Scale': 0.002})
    return m


def mound(name, radius, height, loc, seed=1, res=180):
    """Displaced grid forming a soft heap of powder."""
    rng = np.random.default_rng(seed)
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=res, y_subdivisions=res, size=radius * 2.6, location=loc)
    ob = bpy.context.active_object
    me = ob.data
    co = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    r = np.hypot(co[:, 0], co[:, 1])
    ang = np.arctan2(co[:, 1], co[:, 0])
    wob = 1 + 0.12 * np.sin(ang * 3 + seed) + 0.06 * np.sin(ang * 7 + 2 * seed)
    rn = r / (radius * wob)
    h = height * np.clip(1 - rn, 0, 1) ** 1.35
    h += height * 0.02 * rng.standard_normal(len(r)) * (rn < 1)
    co[:, 2] = np.where(rn < 1, np.maximum(h, 0.0), -0.002)
    me.vertices.foreach_set('co', co.ravel()); me.update()
    import bmesh
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.001 and math.hypot(v.co.x, v.co.y) > radius * 1.35], context='VERTS')
    bm.to_mesh(me); bm.free(); me.update()
    smooth(ob)
    m = matcha_material(name + 'Mat')
    noise_bump(m, scale=900, strength=0.5, distance=0.0004)
    me.materials.append(m)
    return ob
