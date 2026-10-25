import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { cormorant, montserrat } from "./fonts";
import T from "./timeline.json";

const COLORS = {
  forest: "#0F2A1C",
  deep: "#07140D",
  gold: "#E3B856",
  sun: "#F6C453",
  cream: "#F3EAD3",
  paper: "#F4EEDC",
};

// ---------- timing ----------
const S = (sec: number) => Math.round(sec * T.fps);
const OUT = Easing.bezier(0.16, 1, 0.3, 1); // expo-out: fast arrival, long settle
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
// 0 → 1 over [start, start + dur] seconds, clamped
const prog = (frame: number, start: number, dur: number, easing = OUT) =>
  interpolate(frame, [S(start), S(start + dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
const mask = (image: string): React.CSSProperties => ({ WebkitMaskImage: image, maskImage: image });

// ---------- the seal, layer by layer ----------
// Every layer is a 1600 px transparent PNG aligned to the same square, exported from the seal's
// source (brand/jtcsii/src/layers.mjs), so stacking them rebuilds the seal exactly.
const Layer: React.FC<{ name: string; style?: React.CSSProperties }> = ({ name, style }) => (
  <Img
    src={staticFile(`layers/${name}.png`)}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
  />
);

const MED_R = 25.6; // medallion radius, % of the layer square
const SUN_ORIGIN = "50% 54%"; // the sun's centre in the layer square

// camera scale: the medallion fills the frame while it is built, then the camera pulls back to
// the whole seal and drifts in while it holds
const cameraScale = (frame: number) => {
  if (frame < S(T.pullback)) return interpolate(frame, [S(T.ring), S(T.pullback)], [0.93, 0.86], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < S(T.pullback + 1.7)) return interpolate(frame, [S(T.pullback), S(T.pullback + 1.7)], [0.86, 0.555], { easing: IN_OUT, extrapolateRight: "clamp" });
  return interpolate(frame, [S(T.pullback + 1.7), S(T.showcase)], [0.555, 0.58], { extrapolateRight: "clamp" });
};

const SealStage: React.FC = () => {
  const frame = useCurrentFrame();
  const sky = prog(frame, T.sky, 1.0, IN_OUT);
  const bump = interpolate(frame, [S(T.impact), S(T.impact) + 3, S(T.impact) + 26], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const weave = 360 * prog(frame, T.weave, 1.4, IN_OUT);
  const rim = 180 * prog(frame, T.rim, 1.1, IN_OUT);
  const rope = 180 * prog(frame, T.rope, 1.3, IN_OUT);
  const palay = interpolate(prog(frame, T.palay, 1.3), [0, 1], [12, 84]);
  const name = 178 * prog(frame, T.name, 1.1, IN_OUT);
  const motto = 106 * prog(frame, T.motto, 1.1, IN_OUT);
  const sweep = prog(frame, T.impact + 0.05, 1.3, IN_OUT);
  const ringDraw = prog(frame, T.ring, 1.0, IN_OUT);
  const twoSided = (from: number, deg: number) =>
    `conic-gradient(from ${from}deg at 50% 50%, #000 ${deg - 3}deg, transparent ${deg}deg ${360 - deg}deg, #000 ${363 - deg}deg)`;

  return (
    <AbsoluteFill>
      {/* warm light behind the seal, growing with the sun */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(246,196,83,0.22), rgba(246,196,83,0) 42%)",
          opacity: prog(frame, T.sun, 2.2) * 0.8 + bump * 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 800,
          top: 540 - 800,
          width: 1600,
          height: 1600,
          scale: cameraScale(frame) * (1 + bump * 0.012),
          translate: `0px ${Math.sin(frame / 40) * 3}px`,
        }}
      >
        {/* the outer seal, assembled after the pull-back */}
        <Layer name="disc" style={{ opacity: prog(frame, T.disc, 0.9), scale: interpolate(prog(frame, T.disc, 1.2), [0, 1], [0.97, 1]) }} />
        <Layer name="rim" style={mask(twoSided(0, rim))} />
        <Layer name="ornaments" style={{ opacity: prog(frame, T.ornaments, 0.6), scale: interpolate(prog(frame, T.ornaments, 0.8), [0, 1], [0.95, 1]) }} />
        <Layer name="rope" style={mask(twoSided(180, rope))} />
        <Layer name="palayL" style={mask(`linear-gradient(to top, #000 ${palay}%, transparent ${palay + 7}%)`)} />
        <Layer name="palayR" style={mask(`linear-gradient(to top, #000 ${palay}%, transparent ${palay + 7}%)`)} />

        {/* the medallion window: everything inside moves within the circle */}
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${MED_R}% at 50% 50%)` }}>
          <Layer name="medBack" style={{ opacity: prog(frame, T.ring + 0.3, 0.8) }} />
          <Layer name="sky" style={{ clipPath: `inset(0% ${100 - (50 - MED_R + MED_R * sky)}% 0% 0%)` }} />
          <Layer name="sky" style={{ clipPath: `inset(0% 0% 0% ${50 + MED_R - MED_R * sky}%)` }} />
          <Layer name="sunGlow" style={{ opacity: prog(frame, T.sun, 1.4) }} />
          {T.rayOrder.map((ray, k) => {
            const start = T.rays + k * T.rayStep;
            return (
              <Layer
                key={ray}
                name={`ray${ray}`}
                style={{
                  transformOrigin: SUN_ORIGIN,
                  scale: interpolate(prog(frame, start, 0.8), [0, 1], [0.22, 1]),
                  opacity: prog(frame, start, 0.25),
                }}
              />
            );
          })}
          <Layer
            name="sunDisc"
            style={{
              opacity: prog(frame, T.sun, 0.5),
              translate: `0px ${(1 - prog(frame, T.sun, 1.5)) * 280}px`,
            }}
          />
          <Layer name="mountains" style={{ translate: `0px ${(1 - prog(frame, T.mountains, 1.4)) * 460}px` }} />
          {[0, 1, 2, 3].map((i) => {
            const start = T.terraces + i * T.terraceStep;
            return (
              <Layer
                key={i}
                name={`terrace${i}`}
                style={{ opacity: prog(frame, start, 0.3), translate: `0px ${(1 - prog(frame, start, 0.95)) * 300}px` }}
              />
            );
          })}
          <Layer
            name="bridge"
            style={{
              opacity: prog(frame, T.bridge, 0.4),
              clipPath: `inset(0% ${50 - 27 * prog(frame, T.bridge, 1.5, IN_OUT)}% 0% ${50 - 27 * prog(frame, T.bridge, 1.5, IN_OUT)}%)`,
              translate: `0px ${(1 - prog(frame, T.bridge, 1.5)) * 70}px`,
            }}
          />
          <Layer name="medShade" style={{ opacity: sky }} />
        </div>

        {/* a single gold line draws the medallion's edge before anything else */}
        <svg viewBox="-250 -250 500 500" style={{ position: "absolute", inset: 0, opacity: 1 - prog(frame, T.weave + 1.1, 0.4) }}>
          <circle
            r={129}
            fill="none"
            stroke={COLORS.sun}
            strokeWidth={1.3}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ringDraw}
            transform="rotate(-90)"
          />
        </svg>
        <Layer name="weave" style={mask(`conic-gradient(from 0deg at 50% 50%, #000 ${Math.max(0, weave - 12)}deg, transparent ${weave}deg)`)} />

        {/* lettering */}
        <Layer name="name" style={mask(`conic-gradient(from -89deg at 50% 50%, #000 ${name - 5}deg, transparent ${name}deg)`)} />
        <Layer name="place" style={{ opacity: prog(frame, T.place, 0.8), filter: `blur(${(1 - prog(frame, T.place, 0.8)) * 6}px)` }} />
        <Layer name="year" style={{ opacity: prog(frame, T.year, 0.8), filter: `blur(${(1 - prog(frame, T.year, 0.8)) * 6}px)` }} />
        <Layer
          name="motto"
          style={mask(`conic-gradient(from ${230 - motto}deg at 50% 50%, transparent 0deg, #000 5deg, #000 ${motto + 5}deg, transparent ${motto + 5}deg)`)}
        />
        <Layer name="gloss" style={{ opacity: prog(frame, T.impact - 0.3, 0.8) }} />

        {/* light sweeping across the finished gold */}
        <div style={{ position: "absolute", inset: 0, clipPath: "circle(49.6% at 50% 50%)", overflow: "hidden", mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "60%",
              left: `${interpolate(sweep, [0, 1], [-70, 115])}%`,
              background: "linear-gradient(105deg, rgba(255,236,190,0) 0%, rgba(255,240,205,0.42) 50%, rgba(255,236,190,0) 100%)",
              opacity: sweep > 0 && sweep < 1 ? 1 : 0,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- type ----------
const OpeningLine: React.FC<{ text: string; start: number; end: number }> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, start, 0.9);
  const outP = prog(frame, end - 0.45, 0.45, IN_OUT);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: cormorant,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 72,
          color: COLORS.cream,
          letterSpacing: `${interpolate(inP, [0, 1], [0.06, 0.01])}em`,
          opacity: inP * (1 - outP),
          translate: `0px ${(1 - inP) * 16 - outP * 10}px`,
          filter: `blur(${(1 - inP) * 8 + outP * 6}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ n: string; title: string; sub: string; start: number; end: number }> = ({ n, title, sub, start, end }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, start, 0.7);
  const outP = prog(frame, end - 0.35, 0.35, IN_OUT);
  const shown = inP * (1 - outP);
  return (
    <div style={{ position: "absolute", left: 130, bottom: 120, opacity: shown }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontFamily: montserrat, fontWeight: 600, fontSize: 20, color: COLORS.gold, letterSpacing: "0.12em" }}>{n}</span>
        <span style={{ height: 1.5, width: interpolate(inP, [0, 1], [0, 54]), background: COLORS.gold }} />
        <span
          style={{
            fontFamily: montserrat,
            fontWeight: 600,
            fontSize: 22,
            color: COLORS.gold,
            letterSpacing: "0.32em",
            translate: `${(1 - inP) * -14}px 0px`,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontFamily: cormorant,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 46,
          color: COLORS.cream,
          marginTop: 10,
          translate: `${(1 - inP) * -20}px 0px`,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

// ---------- atmosphere ----------
const Dust: React.FC<{ count?: number }> = ({ count = 70 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const big = random(`big-${i}`) > 0.86;
        const size = big ? 6 + random(`s-${i}`) * 8 : 1.2 + random(`s-${i}`) * 2.4;
        const speed = 0.25 + random(`v-${i}`) * 0.6;
        const x = random(`x-${i}`) * 1920 + Math.sin(frame / 60 + i) * 12;
        const y = (((random(`y-${i}`) * 1180 - frame * speed) % 1180) + 1180) % 1180 - 50;
        const twinkle = 0.45 + 0.55 * Math.sin(frame / (12 + random(`t-${i}`) * 20) + i * 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "#F7DA92",
              opacity: (big ? 0.12 : 0.55) * twinkle,
              filter: big ? "blur(3px)" : undefined,
              boxShadow: big ? undefined : "0 0 6px rgba(247,218,146,0.8)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="1920" height="1080">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ strength: number }> = ({ strength }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// ---------- showcase ----------
const Header: React.FC<{ n: string; title: string; p: number }> = ({ n, title, p }) => (
  <div style={{ position: "absolute", left: 130, top: 110, display: "flex", alignItems: "center", gap: 18, opacity: p }}>
    <span style={{ fontFamily: montserrat, fontWeight: 600, fontSize: 20, color: "#A97C22", letterSpacing: "0.14em" }}>{n}</span>
    <span style={{ height: 1.5, width: 54 * p, background: "#A97C22" }} />
    <span style={{ fontFamily: montserrat, fontWeight: 600, fontSize: 20, color: COLORS.forest, letterSpacing: "0.32em" }}>{title}</span>
  </div>
);

// the running footer belongs to the paper itself; each scene only brings its page number
const RunningFooter: React.FC = () => (
  <div style={{ position: "absolute", left: 130, bottom: 96, fontFamily: montserrat, fontWeight: 600, fontSize: 16, letterSpacing: "0.24em", color: "rgba(15,42,28,0.55)" }}>
    JOSE T. CUYOS SR. II INTEGRATED SCHOOL · BRAND IDENTITY
  </div>
);

const Footer: React.FC<{ page: string; p: number }> = ({ page, p }) => (
  <div style={{ position: "absolute", right: 130, bottom: 96, fontFamily: montserrat, fontWeight: 600, fontSize: 16, letterSpacing: "0.2em", color: "rgba(15,42,28,0.55)", opacity: p }}>
    {page}
  </div>
);

// Enter and leave, relative to the scene's own Sequence. Each scene's Sequence runs OVERLAP
// seconds past its slot, so it is still leaving while the next one arrives: no empty frames.
const OVERLAP = 0.45;
const useSceneP = (dur: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = interpolate(frame, [0.05 * fps, 0.95 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  const outP = interpolate(frame, [(dur - 0.3) * fps, (dur + 0.2) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: IN_OUT });
  return { frame, fps, inP, outP };
};

const LockupScene: React.FC<{ dur: number }> = ({ dur }) => {
  const { inP, outP } = useSceneP(dur);
  return (
    <AbsoluteFill>
      <Header n="01" title="THE LOGO" p={inP * (1 - outP)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("logo-horizontal.png")}
          style={{
            width: 1440,
            opacity: inP * (1 - outP),
            translate: `0px ${(1 - inP) * 40 - outP * 40}px`,
            scale: interpolate(inP, [0, 1], [0.98, 1]),
          }}
        />
      </AbsoluteFill>
      <Footer page="01 / 03" p={inP * (1 - outP)} />
    </AbsoluteFill>
  );
};

const VersionCard: React.FC<{ img: string; bg: string; title: string; sub: string; dark?: boolean; delay: number; outP: number }> = ({ img, bg, title, sub, dark, delay, outP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [(0.1 + delay) * fps, (1.0 + delay) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
  return (
    <div
      style={{
        width: 440,
        height: 600,
        borderRadius: 20,
        background: bg,
        boxShadow: "0 30px 60px rgba(15,42,28,0.18), 0 6px 14px rgba(15,42,28,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 54,
        opacity: p * (1 - outP),
        translate: `0px ${(1 - p) * 90 - outP * 50}px`,
        border: dark ? "none" : "1px solid rgba(15,42,28,0.08)",
      }}
    >
      <Img src={staticFile(img)} style={{ width: 330, height: 330 }} />
      <div style={{ fontFamily: montserrat, fontWeight: 700, fontSize: 22, letterSpacing: "0.3em", color: dark ? COLORS.gold : COLORS.forest, marginTop: 44 }}>{title}</div>
      <div style={{ fontFamily: cormorant, fontStyle: "italic", fontWeight: 600, fontSize: 32, color: dark ? COLORS.cream : "#2E5E3A", marginTop: 10 }}>{sub}</div>
    </div>
  );
};

const VersionsScene: React.FC<{ dur: number }> = ({ dur }) => {
  const { inP, outP } = useSceneP(dur);
  return (
    <AbsoluteFill>
      <Header n="02" title="VERSIONS" p={inP * (1 - outP)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 56, paddingTop: 30 }}>
        <VersionCard img="seal.png" bg={COLORS.forest} title="3D" sub="Screens & social media" dark delay={0} outP={outP} />
        <VersionCard img="seal-flat.png" bg="#EFE5CA" title="FLAT" sub="Signage & embroidery" delay={0.12} outP={outP} />
        <VersionCard img="seal-mono.png" bg="#FFFFFF" title="ONE COLOR" sub="Memos, stamps & photocopies" delay={0.24} outP={outP} />
      </AbsoluteFill>
      <Footer page="02 / 03" p={inP * (1 - outP)} />
    </AbsoluteFill>
  );
};

const MarkScene: React.FC<{ dur: number }> = ({ dur }) => {
  const { frame, fps, inP, outP } = useSceneP(dur);
  const sizes = [320, 200, 128, 76];
  return (
    <AbsoluteFill>
      <Header n="03" title="THE MARK" p={inP * (1 - outP)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 56 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
          {sizes.map((size, i) => {
            const p = interpolate(frame, [(0.12 + i * 0.1) * fps, (1.0 + i * 0.1) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
            return (
              <div
                key={size}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size * 0.23,
                  background: `radial-gradient(circle at 35% 30%, #1E4A33, ${COLORS.forest} 70%)`,
                  boxShadow: "0 24px 48px rgba(15,42,28,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: p * (1 - outP),
                  translate: `0px ${(1 - p) * 60 - outP * 40}px`,
                  scale: interpolate(p, [0, 1], [0.9, 1]),
                }}
              >
                <Img src={staticFile("mark.png")} style={{ width: size * 0.86, height: size * 0.86 }} />
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: cormorant, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#2E5E3A", opacity: inP * (1 - outP) }}>
          Icons, IDs & social avatars
        </div>
      </AbsoluteFill>
      <Footer page="03 / 03" p={inP * (1 - outP)} />
    </AbsoluteFill>
  );
};

// ---------- end card ----------
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (sec: number, dur: number, easing = OUT) =>
    interpolate(frame, [sec * fps, (sec + dur) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
  const iris = t(0, 1.0, IN_OUT);
  const seal = t(0.35, 1.6);
  const sweep = t(1.0, 1.3, IN_OUT);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris * 120}% at 50% 42%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, #173D29, ${COLORS.deep} 75%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(246,196,83,0.18), rgba(246,196,83,0) 35%)", opacity: seal }} />
      <Dust count={50} />
      <div style={{ position: "absolute", left: 960 - 290, top: 120, width: 580, height: 580, opacity: seal, scale: interpolate(seal, [0, 1], [0.92, 1]) }}>
        <Img src={staticFile("seal.png")} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: "circle(49.6% at 50% 50%)", overflow: "hidden", mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "60%",
              left: `${interpolate(sweep, [0, 1], [-70, 115])}%`,
              background: "linear-gradient(105deg, rgba(255,236,190,0) 0%, rgba(255,240,205,0.4) 50%, rgba(255,236,190,0) 100%)",
              opacity: sweep > 0 && sweep < 1 ? 1 : 0,
            }}
          />
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", top: 740 }}>
        <div style={{ fontFamily: cormorant, fontStyle: "italic", fontWeight: 600, fontSize: 60, color: COLORS.cream, opacity: t(1.1, 1.0), translate: `0px ${(1 - t(1.1, 1.0)) * 18}px` }}>
          Together we bridge, Together we succeed
        </div>
        <div style={{ fontFamily: montserrat, fontWeight: 700, fontSize: 24, letterSpacing: "0.24em", color: COLORS.gold, marginTop: 30, opacity: t(1.5, 1.0) }}>
          JOSE T. CUYOS SR. II INTEGRATED SCHOOL
        </div>
        <div style={{ fontFamily: montserrat, fontWeight: 600, fontSize: 18, letterSpacing: "0.34em", color: "rgba(243,234,211,0.7)", marginTop: 16, opacity: t(1.8, 1.0) }}>
          ROSARIO, AGUSAN DEL SUR · EST. 2012
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- the teaser ----------
export const Teaser: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = prog(frame, T.showcase, 0.8, IN_OUT);
  const onPaper = frame >= S(T.showcase) && frame < S(T.end + 1);
  const fadeOut = prog(frame, T.fadeOut, T.duration - T.fadeOut, IN_OUT);
  const showcaseScenes: [number, number, React.FC<{ dur: number }>][] = [
    [T.showcase, T.versions, LockupScene],
    [T.versions, T.mark, VersionsScene],
    [T.mark, T.end, MarkScene],
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.deep }}>
      <Audio src={staticFile("sound.wav")} />

      {/* dark stage: cold open, the build, the seal */}
      <Sequence durationInFrames={S(T.showcase + 1)} premountFor={fps}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #173A28 0%, ${COLORS.deep} 72%)` }} />
        <Dust />
        <SealStage />
        {T.lines.map((line) => (
          <OpeningLine key={line.text} {...line} />
        ))}
        {T.captions.map((c) => (
          <Caption key={c.n} {...c} />
        ))}
        <Vignette strength={0.55} />
      </Sequence>

      {/* paper wipes in from the left with a gold edge, and carries the showcase */}
      <Sequence from={S(T.showcase)} durationInFrames={S(T.end - T.showcase + 1.2)} premountFor={fps}>
        <AbsoluteFill style={{ clipPath: `inset(0% ${100 - wipe * 100}% 0% 0%)` }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #FBF7EA, ${COLORS.paper} 70%)` }} />
          <RunningFooter />
          {showcaseScenes.map(([start, end, Scene]) => (
            <Sequence key={start} from={S(start - T.showcase)} durationInFrames={S(end - start + OVERLAP)} premountFor={fps}>
              <Scene dur={end - start} />
            </Sequence>
          ))}
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 4,
            left: `${wipe * 100}%`,
            background: COLORS.sun,
            boxShadow: "0 0 30px rgba(246,196,83,0.8)",
            opacity: wipe > 0 && wipe < 1 ? 1 : 0,
          }}
        />
      </Sequence>

      <Sequence from={S(T.end)} premountFor={fps}>
        <EndCard />
        <Vignette strength={0.5} />
      </Sequence>

      <Grain opacity={onPaper ? 0.07 : 0.1} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
