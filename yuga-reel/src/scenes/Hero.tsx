import React, {useEffect, useMemo, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {AbsoluteFill, continueRender, delayRender, interpolate, random, useCurrentFrame} from 'remotion';
import {C, EASE_IN_OUT, EASE_OUT, F, clamp, loadFonts} from '../theme';
import {RevealLine} from '../components/Type';

// Wrap-around label, drawn once to a canvas. Front panel sits at u = 0.5.
const drawLabel = () => {
  const W = 4096;
  const H = 1600;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  // deep matcha lacquer
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1C3320');
  bg.addColorStop(1, '#14261A');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // fine paper/lacquer texture
  for (let i = 0; i < 60000; i++) {
    g.fillStyle = `rgba(255,255,255,${random(`n${i}`) * 0.025})`;
    g.fillRect(random(`x${i}`) * W, random(`y${i}`) * H, 2, 2);
  }
  // gold bands
  g.fillStyle = '#C9A86A';
  g.fillRect(0, 70, W, 6);
  g.fillRect(0, 92, W, 2);
  g.fillRect(0, H - 76, W, 6);
  g.fillRect(0, H - 94, W, 2);

  const cx = W / 2;
  // cream paper panel
  g.fillStyle = '#EFE9DB';
  g.fillRect(cx - 430, 190, 860, H - 380);
  g.strokeStyle = '#C9A86A';
  g.lineWidth = 4;
  g.strokeRect(cx - 405, 215, 810, H - 430);

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1C3320';
  g.font = '300 52px Inter';
  g.letterSpacing = '26px';
  g.fillText('CEREMONIAL', cx + 13, 330);
  // vertical 悠雅
  g.letterSpacing = '0px';
  g.font = '600 300px "Shippori Mincho"';
  g.fillText('悠', cx, 590);
  g.fillText('雅', cx, 900);
  // seal
  g.fillStyle = '#B3342A';
  g.fillRect(cx + 210, 860, 90, 90);
  g.fillStyle = '#EFE9DB';
  g.font = '600 60px "Shippori Mincho"';
  g.fillText('茶', cx + 255, 907);
  // wordmark
  g.fillStyle = '#1C3320';
  g.font = '500 120px "Cormorant Garamond"';
  g.letterSpacing = '40px';
  g.fillText('YUGA', cx + 20, 1120);
  g.letterSpacing = '12px';
  g.font = '300 38px Inter';
  g.fillText('MATCHA  ·  30 G', cx + 6, 1230);

  // back side: vertical gold text
  g.fillStyle = 'rgba(201,168,106,0.9)';
  g.font = 'italic 300 64px "Cormorant Garamond"';
  g.letterSpacing = '4px';
  for (const u of [0.06, 0.94]) {
    g.save();
    g.translate(u * W, H / 2);
    g.rotate(-Math.PI / 2);
    g.fillText('shade-grown · stone-milled · whisked slowly', 0, 0);
    g.restore();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const PUFF = 2600;

const Tin: React.FC<{label: THREE.Texture}> = ({label}) => {
  const frame = useCurrentFrame();
  const {camera, gl, scene} = useThree();

  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl, scene]);

  const bodyMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({map: label, roughness: 0.42, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.18}),
    [label],
  );
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#C8A464', metalness: 1, roughness: 0.26}), []);
  const darkGold = useMemo(() => new THREE.MeshStandardMaterial({color: '#8E7040', metalness: 1, roughness: 0.4}), []);
  const powderMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#8DB33A', roughness: 1, emissive: '#2B4410', emissiveIntensity: 0.5}), []);

  const puffGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PUFF * 3), 3));
    return g;
  }, []);
  const puffMat = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    const c = cv.getContext('2d')!;
    const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, 64, 64);
    return new THREE.PointsMaterial({
      size: 0.05,
      map: new THREE.CanvasTexture(cv),
      color: '#B5D46A',
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
  }, []);

  // Timeline
  const spin = interpolate(frame, [0, 185], [-2.2, 0.18], {...clamp, easing: EASE_OUT});
  const lidUp = interpolate(frame, [96, 128], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const lidDown = interpolate(frame, [150, 172], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const lid = lidUp * (1 - lidDown);
  const cam = interpolate(frame, [0, 120], [0, 1], {...clamp, easing: EASE_IN_OUT});

  camera.position.set(
    interpolate(cam, [0, 1], [1.2, 0]),
    interpolate(cam, [0, 1], [2.1, 0.9]),
    interpolate(cam, [0, 1], [3.6, 11.5]),
  );
  camera.lookAt(0, interpolate(cam, [0, 1], [1.0, -0.8]), 0);

  // Matcha puff escaping as the lid lifts
  const pt = Math.max(0, frame - 104) / 30;
  const pos = puffGeo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < PUFF; i++) {
    const a = random(`pa${i}`) * Math.PI * 2;
    const r0 = Math.sqrt(random(`pr${i}`)) * 0.9;
    const up = (0.5 + random(`pu${i}`) * 1.6) * (1 - Math.exp(-pt * 1.6));
    const out = (0.2 + random(`po${i}`) * 1.2) * (1 - Math.exp(-pt * 1.2));
    pos.setXYZ(
      i,
      Math.cos(a) * (r0 + out) + Math.sin(pt * 2 + i) * 0.05 * pt,
      1.1 + up,
      Math.sin(a) * (r0 + out),
    );
  }
  pos.needsUpdate = true;
  puffMat.opacity = interpolate(frame, [104, 116, 175], [0, 0.55, 0], clamp);

  return (
    <group position={[0, -0.65, 0]}>
      <directionalLight position={[3.5, 4, 4]} intensity={2.2} color="#FFE6BE" />
      <directionalLight position={[-4, 2, -3]} intensity={3.5} color="#D8F0B0" />
      <directionalLight position={[4, 1, -4]} intensity={2.5} color="#FFF1D6" />
      <ambientLight intensity={0.15} />
      <group rotation={[0, spin, 0]}>
        {/* body */}
        <mesh material={bodyMat} rotation={[0, Math.PI, 0]}>
          <cylinderGeometry args={[1, 1, 2.2, 160, 1, true]} />
        </mesh>
        <mesh material={darkGold} position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.025, 16, 160]} />
        </mesh>
        <mesh material={darkGold} position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 96]} />
        </mesh>
        {/* matcha inside, revealed when the lid lifts */}
        <mesh material={powderMat} position={[0, 1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.97, 96]} />
        </mesh>
        {/* lid */}
        <group position={[0, 1.1 + lid * 0.75, 0]} rotation={[lid * 0.12, 0, lid * -0.18]}>
          <mesh material={goldMat} position={[0, 0.14, 0]}>
            <cylinderGeometry args={[1.035, 1.035, 0.32, 160]} />
          </mesh>
          <mesh material={darkGold} position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.72, 0.012, 12, 120]} />
          </mesh>
          <mesh material={goldMat} position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.035, 0.03, 16, 160]} />
          </mesh>
        </group>
      </group>
      <points geometry={puffGeo} material={puffMat} frustumCulled={false} />
    </group>
  );
};

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const [label, setLabel] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('label texture'));
  useEffect(() => {
    loadFonts().then(() => {
      setLabel(drawLabel());
      continueRender(handle);
    });
  }, [handle]);

  const glow = interpolate(frame, [0, 60], [0, 1], clamp);
  const sweep = interpolate(frame, [130, 175], [-30, 130], clamp);
  return (
    <AbsoluteFill style={{background: '#070B08'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 40% at 50% 46%, rgba(120,160,70,${0.32 * glow}) 0%, rgba(30,50,25,${0.4 * glow}) 45%, rgba(7,11,8,0) 80%)`,
        }}
      />
      {/* plinth */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1250,
          bottom: 0,
          background: 'linear-gradient(180deg, #1A2219 0%, #0A0E0A 60%)',
          opacity: interpolate(frame, [40, 110], [0, 1], clamp),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: 1280,
          width: 600,
          height: 90,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.85), rgba(0,0,0,0) 70%)',
          opacity: interpolate(frame, [40, 110], [0, 1], clamp),
        }}
      />
      {label && (
        <ThreeCanvas width={1080} height={1920} camera={{fov: 28, near: 0.1, far: 100}} gl={{antialias: true, alpha: true}}>
          <Tin label={label} />
        </ThreeCanvas>
      )}
      {/* specular sweep across the frame */}
      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,245,220,0.18) ${sweep}%, transparent ${sweep + 12}%)`,
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.8) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center'}}>
        <RevealLine
          text="CEREMONIAL GRADE"
          at={70}
          size={26}
          family={F.sans}
          tracking="0.5em"
          color={C.gold}
          style={{paddingLeft: '0.5em'}}
        />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 280, textAlign: 'center'}}>
        <RevealLine text="A quiet ritual," at={78} size={96} />
        <RevealLine text="kept in a tin." at={92} size={96} italic color={C.froth} />
      </div>
    </AbsoluteFill>
  );
};
