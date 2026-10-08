import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, EASE_IN_OUT, clamp} from '../theme';
import {Chapter, RevealLine} from '../components/Type';

const N = 16000;
const BURST = 22;

const vert = /* glsl */ `
  attribute float size;
  attribute float alpha;
  attribute vec3 tint;
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (2300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = alpha;
    vTint = tint;
  }
`;
const frag = /* glsl */ `
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vTint, a);
  }
`;

type P = {mound: THREE.Vector3; dir: THREE.Vector3; speed: number; ph: number; size: number; col: THREE.Color; a: number; cloud: boolean};

const palette = ['#5E8A22', '#7FA23A', '#9DBF4E', '#B8D46A', '#476E1A', '#D7E89A'];

const useParticles = () =>
  useMemo<P[]>(() => {
    const arr: P[] = [];
    for (let i = 0; i < N; i++) {
      const cloud = i % 23 === 0;
      const r = Math.sqrt(random(`r${i}`)) * 1.25;
      const th = random(`t${i}`) * Math.PI * 2;
      const h = (1 - r / 1.25) ** 1.4 * 0.95 * random(`h${i}`);
      const mound = new THREE.Vector3(Math.cos(th) * r, -1.0 + h, Math.sin(th) * r);
      // burst direction: mostly upward and outward
      const u = random(`u${i}`) * Math.PI * 2;
      const v = Math.acos(1 - random(`v${i}`) * 1.3);
      const dir = new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v) * 0.9 + 0.25, Math.sin(v) * Math.sin(u)).normalize();
      const c = new THREE.Color(palette[Math.floor(random(`c${i}`) * palette.length)]);
      arr.push({
        mound,
        dir,
        speed: (cloud ? 0.9 : 0.5) + random(`s${i}`) ** 1.8 * 2.3,
        ph: random(`p${i}`) * 100,
        size: cloud ? 0.25 + random(`z${i}`) * 0.4 : 0.006 + random(`z${i}`) ** 3 * 0.03,
        col: c,
        a: cloud ? 0.07 : 0.6 + random(`a${i}`) * 0.4,
        cloud,
      });
    }
    return arr;
  }, []);

const Cloud: React.FC = () => {
  const frame = useCurrentFrame();
  const parts = useParticles();
  const camera = useThree((s) => s.camera);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(N), 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(N), 1));
    g.setAttribute('tint', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false}),
    [],
  );

  // Slow-motion time: a sharp burst that decelerates into a lingering, drifting cloud.
  const t = Math.max(0, (frame - BURST) / 30);
  const prog = 1 - Math.exp(-t * 2.4);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const size = geo.getAttribute('size') as THREE.BufferAttribute;
  const alpha = geo.getAttribute('alpha') as THREE.BufferAttribute;
  const tint = geo.getAttribute('tint') as THREE.BufferAttribute;
  const pre = interpolate(frame, [0, BURST], [0, 1], clamp);

  for (let i = 0; i < N; i++) {
    const p = parts[i];
    const d = p.speed * prog;
    const swirl = t * 0.55;
    let x = p.mound.x + p.dir.x * d;
    let y = p.mound.y + p.dir.y * d - t * t * 0.03;
    let z = p.mound.z + p.dir.z * d;
    // curl-ish turbulence that grows as the cloud slows
    x += Math.sin(y * 1.7 + p.ph + swirl) * 0.22 * prog;
    z += Math.cos(x * 1.5 + p.ph * 0.7 + swirl) * 0.22 * prog;
    y += Math.sin(z * 1.3 + p.ph * 1.3 + swirl) * 0.12 * prog;
    // tiny tremble just before the burst
    if (frame < BURST) y += Math.sin(frame * 2 + p.ph) * 0.004 * pre;
    pos.setXYZ(i, x, y, z);
    // backlight: particles higher and further back catch more light
    const lit = THREE.MathUtils.clamp(0.95 + y * 0.25 - z * 0.15, 0.5, 1.9);
    tint.setXYZ(i, p.col.r * lit, p.col.g * lit, p.col.b * lit);
    size.setX(i, p.size * (p.cloud ? 1 + prog * 1.5 : 1));
    alpha.setX(i, p.cloud ? p.a * (0.4 + prog * 1.4) : p.a * (1 - prog * 0.25));
  }
  pos.needsUpdate = true;
  size.needsUpdate = true;
  alpha.needsUpdate = true;
  tint.needsUpdate = true;

  // Camera: low macro angle, slow dolly-in and arc
  const k = interpolate(frame, [0, 150], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const ang = interpolate(k, [0, 1], [-0.25, 0.25]);
  const dist = interpolate(k, [0, 1], [3.6, 6.2]);
  camera.position.set(Math.sin(ang) * dist, interpolate(k, [0, 1], [-0.45, 0.35]), Math.cos(ang) * dist);
  camera.lookAt(0, interpolate(k, [0, 1], [-0.75, 0.25]), 0);

  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

export const Powder: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [BURST - 2, BURST + 4, BURST + 30], [0, 1, 0.35], clamp);
  return (
    <AbsoluteFill style={{background: '#040805'}}>
      {/* backlight halo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 34% at 50% 52%, rgba(225,238,170,${0.22 + flash * 0.3}) 0%, rgba(90,130,50,${
            0.12 + flash * 0.1
          }) 35%, rgba(4,8,5,0) 72%)`,
        }}
      />
      {/* surface the mound sits on */}
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(18,26,16,0.9) 63%, #050805 100%)', opacity: 0.8}}
      />
      <ThreeCanvas width={1080} height={1920} camera={{fov: 30, near: 0.1, far: 100, position: [0, 0, 6]}} gl={{antialias: true, alpha: true}}>
        <Cloud />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.75) 100%)'}} />
      <Chapter num="02" label="STONE" />
      <div style={{position: 'absolute', left: 90, bottom: 300}}>
        <RevealLine text="Stone-milled" at={44} size={104} />
        <RevealLine text="to a fine whisper." at={60} size={104} italic color={C.froth} />
      </div>
    </AbsoluteFill>
  );
};
