"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The water column.
 *
 * One full-viewport plane that carries the whole descent: surface light and
 * caustics at the top, marine snow through the midwater, bioluminescence in
 * the abyss, and each station's beacon glowing in its own hue. The portrait
 * lives at the surface and sinks away as the dive begins.
 *
 * Everything is procedural in the fragment shader, so the entire ocean is one
 * draw call driven by a handful of uniforms.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uRes;
  uniform float uDepth;      // 0 surface .. 1 abyss floor
  uniform float uDive;       // 0 travelling .. 1 inside a room
  uniform vec2  uPointer;    // -1..1
  uniform vec3  uAccent;     // current station hue
  uniform float uSeed;       // current station index
  uniform sampler2D uPortrait;
  uniform vec2  uCover;      // portrait cover-fit correction
  uniform float uVel;        // depth velocity, signed
  uniform float uKind;       // landmark kind, -1 when no beacon

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y);
  }

  // Bayer 4x4, indexed by BLOCK, so the dither itself is chunky.
  float bayer(vec2 b) {
    int x = int(mod(b.x, 4.0)); int y = int(mod(b.y, 4.0));
    int idx = x + y * 4;
    float m[16];
    m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
    m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
    m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
    m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
    for (int i = 0; i < 16; i++) { if (i == idx) return m[i] / 16.0 - 0.5; }
    return 0.0;
  }

  float lampAt(vec2 uv, vec2 c, vec2 stretchXY, float k, float aspect) {
    vec2 dl = (uv - c) * vec2(aspect, 1.0) * stretchXY;
    return exp(-dot(dl, dl) * k);
  }

  // Classic dappled game-water light.
  float dapple(vec2 uv, float t) {
    float acc = 0.0, amp = 1.0;
    for (int i = 0; i < 3; i++) {
      vec2 p = uv * (2.0 + float(i) * 1.8);
      p.x += t * (0.09 + float(i) * 0.045);
      p.y += sin(t * 0.3 + float(i)) * 0.14;
      float ridge = 1.0 - abs(noise(p) * 2.0 - 1.0);
      acc += pow(ridge, 5.0) * amp;
      amp *= 0.55;
    }
    return acc;
  }

  void main() {
    // ------------------------------------------------------------ pixelate
    // The whole sea renders at chunky block resolution. This is the world the
    // pixel octopus was drawn for.
    float px = max(3.0, floor(min(uRes.x, uRes.y) / 170.0));
    vec2 block = floor(gl_FragCoord.xy / px);
    vec2 uv = (block + 0.5) * px / uRes;
    float aspect = uRes.x / max(uRes.y, 1.0);
    float d = clamp(uDepth, 0.0, 1.0);
    float t = uTime;

    // Wobble the bands like water in an old game.
    uv.x += sin(uv.y * 26.0 + t * 0.7) * 0.0035;

    vec2 suv = vec2(uv.x * aspect, uv.y);

    // ---------------------------------------------------------- water bands
    float band = clamp(d + (1.0 - uv.y) * 0.18 - 0.09, 0.0, 1.0);
    vec3 cSurfA = vec3(0.36, 0.82, 0.78);
    vec3 cSurfB = vec3(0.16, 0.62, 0.72);
    vec3 cMidA  = vec3(0.10, 0.38, 0.66);
    vec3 cMidB  = vec3(0.06, 0.22, 0.52);
    vec3 cDeepA = vec3(0.05, 0.11, 0.38);
    vec3 cDeepB = vec3(0.02, 0.05, 0.22);
    vec3 cAbyss = vec3(0.008, 0.015, 0.08);
    vec3 water = mix(cSurfA, cSurfB, smoothstep(0.0, 0.22, band));
    water = mix(water, cMidA,  smoothstep(0.16, 0.42, band));
    water = mix(water, cMidB,  smoothstep(0.36, 0.62, band));
    water = mix(water, cDeepA, smoothstep(0.55, 0.8, band));
    water = mix(water, cDeepB, smoothstep(0.74, 0.92, band));
    water = mix(water, cAbyss, smoothstep(0.88, 1.0, band));

    // ------------------------------------------------------------ sunlight
    float sun = 1.0 - smoothstep(0.0, 0.5, d);
    // Hard pixel god rays: stepped beams that sway.
    float beamPhase = suv.x * 5.0 + sin(t * 0.14) * 0.7 + uPointer.x * 0.3;
    float beams = step(0.86, sin(beamPhase)) * 0.85
                + step(0.93, sin(beamPhase * 0.53 + 1.7)) * 0.6;
    water += vec3(0.75, 1.0, 0.9) * beams * smoothstep(1.0, 0.15, uv.y) * sun * 0.34;
    // Dappled light, strong near the surface.
    float c = dapple(suv * 1.35, t * 0.5);
    water += vec3(0.85, 1.0, 0.95) * smoothstep(0.55, 1.4, c) * sun * 0.5;

    // ---------------------------------------------------------- marine snow
    float speed = clamp(abs(uVel) * 3.0, 0.0, 1.0);
    for (int i = 0; i < 3; i++) {
      float sc = 9.0 + float(i) * 9.0;
      vec2 g = suv * vec2(sc, sc / (1.0 + speed * 3.5));
      g.y += d * (9.0 + float(i) * 6.0) + t * 0.03 * (1.0 + float(i));
      vec2 id = floor(g);
      float h = hash(id + float(i) * 17.0);
      if (h > 0.9) {
        vec2 cpos = vec2(fract(h * 7.13), fract(h * 3.71)) * 0.6 + 0.2;
        float dot2 = smoothstep(0.18, 0.05, length(fract(g) - cpos));
        water += vec3(0.7, 0.85, 0.95) * dot2 * mix(0.4, 0.16, d) / (1.0 + float(i));
      }
    }

    // ------------------------------------------------------- bioluminescence
    float glow = smoothstep(0.45, 0.85, d);
    for (int i = 0; i < 2; i++) {
      float sc = 12.0 + float(i) * 10.0;
      vec2 g = suv * sc; g.y += d * 6.0;
      vec2 id = floor(g);
      float h = hash(id + float(i) * 29.0);
      if (h > 0.93) {
        vec2 cpos = vec2(fract(h * 5.17), fract(h * 8.31)) * 0.6 + 0.2;
        float tw = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * (1.5 + h * 3.0) + h * 40.0), 3.0);
        float dot2 = smoothstep(0.22, 0.0, length(fract(g) - cpos)) * tw;
        water += mix(uAccent, vec3(0.4, 0.95, 1.0), float(i)) * dot2 * glow * 0.8;
      }
    }

    // ------------------------------------------------------------ the whale
    // Once in a while, something enormous passes behind the midwater.
    float wvis = smoothstep(0.3, 0.5, d) * (1.0 - smoothstep(0.85, 0.97, d));
    if (wvis > 0.001) {
      float wt = fract(t * 0.016 + 0.15);
      vec2 wp = vec2(mix(-0.45, 1.45, wt), 0.66 + sin(t * 0.22) * 0.04);
      vec2 wq = (uv - wp) * vec2(aspect, 1.0);
      // Body: a long ellipse. Tail: a beating fluke behind.
      float bodyM = smoothstep(0.36, 0.33, length(wq * vec2(1.0, 4.6)));
      vec2 tq = wq - vec2(-0.36, 0.0);
      tq.y -= sin(t * 1.1) * 0.02 + tq.x * 0.55;
      float tailM = smoothstep(0.1, 0.08, length(tq * vec2(2.2, 5.0)));
      float fin = smoothstep(0.06, 0.045, length((wq - vec2(0.05, -0.055)) * vec2(4.0, 7.0)));
      float whale = max(bodyM, max(tailM, fin)) * wvis;
      water = mix(water, water * 0.32, whale * 0.9);
      // A thin lit spine where the beacon light catches its back.
      water += uAccent * smoothstep(0.02, 0.0, abs(wq.y - 0.05)) * bodyM * wvis * 0.12;
    }

    // ------------------------------------------------------ station beacons
    float visible = smoothstep(0.06, 0.3, d);
    if (uKind > -0.5 && visible > 0.001) {
      float k = floor(uKind + 0.5);
      float pulse = 0.8 + 0.2 * sin(t * 0.9 + uSeed);
      float lamp = 0.0;
      vec2 base = vec2(0.28, 0.5);
      if (k < 0.5) {
        vec2 q = uv - base;
        q = vec2((q.x + q.y * 0.6) * aspect, (q.y - q.x * 0.3) * 5.5);
        lamp = exp(-dot(q, q) * 9.0) * 1.15;
      } else if (k < 1.5) {
        lamp += lampAt(uv, base + vec2(-0.045, -0.05), vec2(1.0), 260.0, aspect);
        lamp += lampAt(uv, base + vec2(0.05, 0.02), vec2(1.0), 220.0, aspect);
        lamp += lampAt(uv, base + vec2(-0.01, 0.09), vec2(1.0), 300.0, aspect);
      } else if (k < 2.5) {
        lamp += lampAt(uv, base + vec2(-0.07, 0.0), vec2(2.2, 1.0), 130.0, aspect);
        lamp += lampAt(uv, base + vec2(0.07, -0.02), vec2(2.2, 1.0), 130.0, aspect);
      } else if (k < 3.5) {
        lamp += lampAt(uv, vec2(base.x, 0.44), vec2(6.5, 0.75), 26.0, aspect) * 1.2;
        lamp += lampAt(uv, vec2(base.x, 0.26), vec2(1.0), 320.0, aspect)
              * (0.6 + 0.4 * sin(t * 2.4));
      } else if (k < 4.5) {
        for (int i = 0; i < 4; i++) {
          lamp += lampAt(uv, vec2(base.x - 0.09 + float(i) * 0.06, 0.6), vec2(1.0), 420.0, aspect);
        }
      } else if (k < 5.5) {
        lamp += lampAt(uv, base + vec2(-0.05, 0.0), vec2(7.0, 0.9), 55.0, aspect);
        lamp += lampAt(uv, base + vec2(0.05, 0.0), vec2(7.0, 0.9), 55.0, aspect);
      } else if (k < 6.5) {
        lamp = lampAt(uv, vec2(base.x, 0.58), vec2(0.9, 3.4), 26.0, aspect) * 1.1;
      } else if (k < 7.5) {
        for (int i = 0; i < 4; i++) {
          float fx = base.x - 0.08 + float(i) * 0.055;
          float swayF = sin(t * 0.8 + float(i) * 1.9) * 0.012;
          lamp += lampAt(uv, vec2(fx + swayF, 0.52), vec2(9.0, 0.8), 50.0, aspect) * 0.8;
        }
      } else if (k < 8.5) {
        lamp += lampAt(uv, vec2(base.x, 0.66), vec2(0.9, 8.0), 36.0, aspect);
        lamp += lampAt(uv, vec2(base.x + 0.1, 0.62), vec2(1.0), 380.0, aspect)
              * (0.5 + 0.5 * sin(t * 1.6));
      } else if (k < 9.5) {
        lamp = lampAt(uv, vec2(0.4, 0.86), vec2(0.7, 3.2), 15.0, aspect) * 0.9;
      } else {
        float rr = length((uv - vec2(0.30, 0.5)) * vec2(aspect, 1.0));
        for (int i = 0; i < 3; i++) {
          float ph = fract(t * 0.22 + float(i) / 3.0);
          lamp += smoothstep(0.03, 0.0, abs(rr - ph * 0.5)) * (1.0 - ph) * 0.9;
        }
        lamp += lampAt(uv, vec2(0.30, 0.5), vec2(1.0), 300.0, aspect) * 0.8;
      }
      water += uAccent * lamp * pulse * 0.55 * visible;
    }

    // ----------------------------------------------------- terrain and kelp
    // A far ridge gives the water a horizon; the near floor frames the frame.
    float farRise = smoothstep(0.2, 0.55, d);
    if (farRise > 0.001) {
      float fh = 0.10 * farRise + farRise * (0.05 * sin(uv.x * 4.1 + uSeed * 0.7)
               + 0.03 * sin(uv.x * 11.0 + 2.0));
      float farM = smoothstep(fh, fh - 0.015, uv.y);
      water = mix(water, water * 0.45, farM * 0.8);
    }
    float nearRise = smoothstep(0.12, 0.4, d);
    if (nearRise > 0.001) {
      float h = 0.03 + 0.1 * nearRise + smoothstep(0.72, 1.0, d) * 0.1
              + nearRise * (0.035 * sin(uv.x * 17.0 + t * 0.15)
              + 0.045 * sin(uv.x * 5.0 - t * 0.1)
              + 0.02 * sin(uv.x * 41.0));
      // Kelp fronds sway up from the floor line.
      float kelp = 0.0;
      for (int i = 0; i < 5; i++) {
        float kx = fract(hash(vec2(float(i) * 7.7, uSeed)) * 5.7) * 0.9 + 0.05;
        float ky = uv.y - h;
        float sway = sin(t * 0.8 + float(i) * 2.2 + ky * 9.0) * 0.014 * max(ky, 0.0) * 14.0;
        float tall = 0.1 + fract(hash(vec2(float(i), 3.3)) * 9.1) * 0.14;
        float w = 0.008 * (1.0 - ky / max(tall, 0.001));
        kelp = max(kelp, step(abs(uv.x - kx - sway * 0.06), w) * step(0.0, ky) * step(ky, tall));
      }
      float ground = max(smoothstep(h, h - 0.015, uv.y), kelp * nearRise);
      vec3 groundCol = vec3(0.01, 0.03, 0.1);
      water = mix(water, groundCol, ground * 0.95);
      water += uAccent * smoothstep(0.01, 0.0, abs(uv.y - h)) * 0.35 * nearRise;
    }

    // ------------------------------------------------------------- portrait
    float pmix = 1.0 - smoothstep(0.015, 0.11, d);
    if (pmix > 0.001) {
      vec2 pc = (uv - 0.5) * uCover + 0.5 + vec2(0.11, 0.0);
      pc.y += (1.0 - uCover.y) * 0.42;
      pc += uPointer * 0.012;
      if (pc.x > 0.0 && pc.x < 1.0 && pc.y > 0.0 && pc.y < 1.0) {
        vec3 shot = texture2D(uPortrait, pc).rgb;
        float lum = dot(shot, vec3(0.299, 0.587, 0.114));
        shot = mix(vec3(lum), shot, 0.34);
        shot = pow(max(shot, 0.0), vec3(1.22)) * vec3(0.85, 0.95, 1.0);
        water = mix(water, shot, pmix * 0.92);
      }
    }

    // ------------------------------------------------- iris, scrim, quantise
    vec2 v = uv - vec2(0.38, 0.5);
    water *= mix(0.42, 1.0, smoothstep(1.15, 0.25, length(v * vec2(1.0, 1.3))));

    float ir = length((uv - vec2(0.45, 0.5)) * vec2(aspect, 1.0));
    float irisR = mix(2.4, 0.14, smoothstep(0.0, 1.0, uDive));
    float inside = smoothstep(irisR, irisR - 0.22, ir);
    water *= mix(1.0, 0.05 + inside * 0.4, uDive);
    water += uAccent * smoothstep(0.03, 0.0, abs(ir - irisR)) * uDive * (1.0 - uDive * 0.55) * 0.6;

    water *= mix(1.0, 0.24, smoothstep(0.42, 0.9, uv.x) * (1.0 - pmix * 0.35));
    water *= mix(1.0, 0.6, smoothstep(0.6, 1.0, 1.0 - uv.y));

    // Palette quantisation with block-scale dither: the pixel-art signature.
    float levels = 7.0;
    vec3 col = floor(water * levels + 0.5 + bayer(block) * 0.9) / levels;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

export type OceanHandle = {
  /** Target depth, 0..1. The ocean glides toward it. */
  setDepth: (value: number) => void;
  /** Room state, 0 or 1. */
  setDive: (value: number) => void;
  /** kind: beacon signature index, -1 for none. */
  setStation: (index: number, hue: string, kind: number) => void;
  setPointer: (x: number, y: number) => void;
};

export function Ocean({
  handleRef,
  onReady
}: {
  handleRef: React.MutableRefObject<OceanHandle | null>;
  /** Fired once the portrait is decoded and the first frames have rendered. */
  onReady?: () => void;
}) {
  const { size, viewport } = useThree();
  const mesh = useRef<THREE.Mesh>(null);

  // Written only from the frame loop, which runs outside render.
  const ready = useRef({ frames: 0, fired: false });

  const portrait = useMemo(() => {
    const t = new THREE.TextureLoader().load("/media/operator-portrait.png");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uDepth: { value: 0 },
      uDive: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: new THREE.Color("#7fe3c4") },
      uSeed: { value: 0 },
      uPortrait: { value: portrait },
      uCover: { value: new THREE.Vector2(1, 1) },
      uVel: { value: 0 },
      uKind: { value: -1 }
    }),
    [portrait]
  );

  const target = useRef({ depth: 0, dive: 0, px: 0, py: 0, seed: 0, kind: -1 });
  const accent = useRef(new THREE.Color("#7fe3c4"));

  useEffect(() => {
    handleRef.current = {
      setDepth: (value) => { target.current.depth = value; },
      setDive: (value) => { target.current.dive = value; },
      setStation: (index, hue, kind) => {
        target.current.seed = index;
        target.current.kind = kind;
        accent.current.set(hue);
      },
      setPointer: (x, y) => { target.current.px = x; target.current.py = y; }
    };
  }, [handleRef]);

  useFrame((_, delta) => {
    // Write to the material's own uniforms: three clones the uniforms object
    // passed at construction, so mutating the original changes nothing on
    // screen. Found the hard way; the window probe below guards it in e2e.
    const u = (mesh.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 0.05);
    u.uTime.value += dt;
    u.uRes.value.set(size.width, size.height);

    // Glide, don't jump: the dive should feel like water resistance.
    const before = u.uDepth.value;
    u.uDepth.value += (target.current.depth - u.uDepth.value) * Math.min(1, dt * 1.9);
    // Smoothed vertical velocity drives the streak layer.
    const rawVel = (u.uDepth.value - before) / Math.max(dt, 0.001);
    u.uVel.value += (rawVel - u.uVel.value) * Math.min(1, dt * 4);
    u.uDive.value += (target.current.dive - u.uDive.value) * Math.min(1, dt * 3.2);
    u.uSeed.value = target.current.seed;
    u.uKind.value = target.current.kind;
    u.uPointer.value.x += (target.current.px - u.uPointer.value.x) * Math.min(1, dt * 2.4);
    u.uPointer.value.y += (target.current.py - u.uPointer.value.y) * Math.min(1, dt * 2.4);
    u.uAccent.value.lerp(accent.current, Math.min(1, dt * 2.2));

    // Portrait cover fit.
    const img = portrait.image as HTMLImageElement | undefined;
    const ia = img && img.width ? img.width / img.height : 3 / 4;
    const va = size.width / Math.max(size.height, 1);
    if (va > ia) u.uCover.value.set(1, ia / va);
    else u.uCover.value.set(va / ia, 1);

    // Read by the e2e guard so this class of bug cannot ship silently again.
    (window as unknown as Record<string, unknown>).__dive = {
      depth: u.uDepth.value, target: target.current.depth
    };

    // Boot: the surface is ready once the portrait decoded and frames flow.
    // No loader callback needed: a decoded image simply has a width.
    const r = ready.current;
    r.frames += 1;
    const decoded = Boolean((portrait.image as HTMLImageElement | undefined)?.width);
    if (!r.fired && decoded && r.frames > 2) {
      r.fired = true;
      onReady?.();
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[viewport.width || 40, viewport.height || 24]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
