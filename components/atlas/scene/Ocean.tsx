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

  // One layer of drifting particles. As the diver descends, the water moves
  // upward past the frame; parallax separates the layers.
  float snow(vec2 uv, float scale, float rise, float seed) {
    // Travel stretches the cells vertically, so falling snow becomes streaks
    // rushing past the diver: motion read directly from the water.
    float speed = clamp(abs(uVel) * 3.0, 0.0, 1.0);
    vec2 g = uv * vec2(scale, scale / (1.0 + speed * 3.5));
    g.y += uDepth * rise + uTime * 0.02 * (1.0 + seed);
    vec2 id = floor(g), f = fract(g);
    float h = hash(id + seed * 17.0);
    if (h < 0.82) return 0.0;
    vec2 c = vec2(fract(h * 7.13), fract(h * 3.71)) * 0.6 + 0.2;
    float r = 0.02 + 0.05 * fract(h * 9.7);
    return smoothstep(r, r * 0.25, length(f - c));
  }

  // Bioluminescent motes: same grid, but they breathe.
  float biolume(vec2 uv, float scale, float seed) {
    vec2 g = uv * scale;
    g.y += uDepth * 6.0;
    vec2 id = floor(g), f = fract(g);
    float h = hash(id + seed * 29.0);
    if (h < 0.93) return 0.0;
    vec2 c = vec2(fract(h * 5.17), fract(h * 8.31)) * 0.6 + 0.2;
    float tw = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (1.5 + h * 3.0) + h * 40.0), 3.0);
    float r = 0.05 + 0.06 * fract(h * 6.3);
    return smoothstep(r, 0.0, length(f - c)) * tw;
  }

  // A single soft lamp, stretchable into bars, beams, and basins.
  float lampAt(vec2 uv, vec2 c, vec2 stretchXY, float k, float aspect) {
    vec2 dl = (uv - c) * vec2(aspect, 1.0) * stretchXY;
    return exp(-dot(dl, dl) * k);
  }

  float caustic(vec2 uv, float t) {
    float acc = 0.0, amp = 1.0;
    for (int i = 0; i < 3; i++) {
      vec2 p = uv * (2.2 + float(i) * 2.0);
      p.x += t * (0.10 + float(i) * 0.05);
      p.y += sin(t * 0.3 + float(i)) * 0.15;
      float ridge = 1.0 - abs(noise(p) * 2.0 - 1.0);
      acc += pow(ridge, 6.0) * amp;
      amp *= 0.5;
    }
    return acc;
  }

  // 4x4 ordered dither so the depth gradient breaks into pixel texture.
  float dither(vec2 pos) {
    int x = int(mod(pos.x, 4.0)); int y = int(mod(pos.y, 4.0));
    int idx = x + y * 4;
    float m[16];
    m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
    m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
    m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
    m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
    for (int i = 0; i < 16; i++) { if (i == idx) return m[i] / 16.0 - 0.5; }
    return 0.0;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 suv = vec2(uv.x * aspect, uv.y);
    float d = clamp(uDepth, 0.0, 1.0);

    // Water column: local vertical gradient riding on the global depth.
    float band = clamp(d + (1.0 - uv.y) * 0.14 - 0.07, 0.0, 1.0);
    vec3 surfaceCol = vec3(0.42, 0.75, 0.82);
    vec3 midCol     = vec3(0.06, 0.26, 0.44);
    vec3 deepCol    = vec3(0.016, 0.06, 0.14);
    vec3 abyssCol   = vec3(0.008, 0.016, 0.05);
    vec3 water = mix(surfaceCol, midCol, smoothstep(0.0, 0.34, band));
    water = mix(water, deepCol,  smoothstep(0.30, 0.72, band));
    water = mix(water, abyssCol, smoothstep(0.68, 1.0, band));

    // Sunlight only survives the first stretch of the dive.
    float sun = 1.0 - smoothstep(0.0, 0.42, d);
    float shaftPhase = suv.x * 2.6 + uPointer.x * 0.25;
    float shaft = pow(max(sin(shaftPhase + sin(uTime * 0.16) * 0.5), 0.0), 20.0)
                + pow(max(sin(shaftPhase * 0.6 - uTime * 0.08), 0.0), 28.0) * 0.7;
    water += vec3(0.85, 0.95, 0.92) * shaft * smoothstep(1.0, 0.1, uv.y) * sun * 0.5;
    water += vec3(1.0) * caustic(suv * 1.5, uTime * 0.45) * sun * 0.12;

    // Marine snow, three layers of parallax.
    float sn = snow(suv, 9.0, 9.0, 1.0) * 0.5
             + snow(suv, 17.0, 14.0, 2.0) * 0.34
             + snow(suv, 30.0, 22.0, 3.0) * 0.22;
    water += vec3(0.75, 0.85, 0.92) * sn * mix(0.35, 0.14, d);

    // The deep answers with its own light.
    float glow = smoothstep(0.45, 0.85, d);
    water += uAccent * biolume(suv, 12.0, 1.0) * glow * 0.55;
    water += vec3(0.4, 0.9, 1.0) * biolume(suv, 22.0, 2.0) * glow * 0.30;

    // Station beacon: every kind of place has its own light signature, drawn
    // left of centre where the subject lives, clear of the type column.
    float visible = smoothstep(0.06, 0.3, d);
    if (uKind > -0.5 && visible > 0.001) {
      float k = floor(uKind + 0.5);
      float pulse = 0.8 + 0.2 * sin(uTime * 0.9 + uSeed);
      float lamp = 0.0;
      vec2 base = vec2(0.28, 0.5);
      if (k < 0.5) {            // market current: a rushing diagonal
        vec2 q = uv - base;
        q = vec2((q.x + q.y * 0.6) * aspect, (q.y - q.x * 0.3) * 5.5);
        lamp = exp(-dot(q, q) * 9.0) * 1.15;
      } else if (k < 1.5) {     // wallet reef: clustered polyps
        lamp += lampAt(uv, base + vec2(-0.045, -0.05), vec2(1.0), 260.0, aspect);
        lamp += lampAt(uv, base + vec2(0.05, 0.02), vec2(1.0), 220.0, aspect);
        lamp += lampAt(uv, base + vec2(-0.01, 0.09), vec2(1.0), 300.0, aspect);
      } else if (k < 2.5) {     // reputation ruin: a broken arch
        lamp += lampAt(uv, base + vec2(-0.07, 0.0), vec2(2.2, 1.0), 130.0, aspect);
        lamp += lampAt(uv, base + vec2(0.07, -0.02), vec2(2.2, 1.0), 130.0, aspect);
      } else if (k < 3.5) {     // signal lighthouse: a standing beam
        lamp += lampAt(uv, vec2(base.x, 0.44), vec2(6.5, 0.75), 26.0, aspect) * 1.2;
        lamp += lampAt(uv, vec2(base.x, 0.26), vec2(1.0), 320.0, aspect)
              * (0.6 + 0.4 * sin(uTime * 2.4));
      } else if (k < 4.5) {     // message port: a row of moorings
        for (int i = 0; i < 4; i++) {
          lamp += lampAt(uv, vec2(base.x - 0.09 + float(i) * 0.06, 0.6), vec2(1.0), 420.0, aspect);
        }
      } else if (k < 5.5) {     // automation canal: twin gates
        lamp += lampAt(uv, base + vec2(-0.05, 0.0), vec2(7.0, 0.9), 55.0, aspect);
        lamp += lampAt(uv, base + vec2(0.05, 0.0), vec2(7.0, 0.9), 55.0, aspect);
      } else if (k < 6.5) {     // game lagoon: a wide shallow basin
        lamp = lampAt(uv, vec2(base.x, 0.58), vec2(0.9, 3.4), 26.0, aspect) * 1.1;
      } else if (k < 7.5) {     // pixel forest: swaying fronds
        for (int i = 0; i < 4; i++) {
          float fx = base.x - 0.08 + float(i) * 0.055;
          float swayF = sin(uTime * 0.8 + float(i) * 1.9) * 0.012;
          lamp += lampAt(uv, vec2(fx + swayF, 0.52), vec2(9.0, 0.8), 50.0, aspect) * 0.8;
        }
      } else if (k < 8.5) {     // exit dock: a low pier light
        lamp += lampAt(uv, vec2(base.x, 0.66), vec2(0.9, 8.0), 36.0, aspect);
        lamp += lampAt(uv, vec2(base.x + 0.1, 0.62), vec2(1.0), 380.0, aspect)
              * (0.5 + 0.5 * sin(uTime * 1.6));
      } else if (k < 9.5) {     // abyss floor: the ground answering
        lamp = lampAt(uv, vec2(0.4, 0.86), vec2(0.7, 3.2), 15.0, aspect) * 0.9;
      } else {                   // sonar: rings leaving the reading
        float rr = length((uv - vec2(0.30, 0.5)) * vec2(aspect, 1.0));
        for (int i = 0; i < 3; i++) {
          float ph = fract(uTime * 0.22 + float(i) / 3.0);
          lamp += smoothstep(0.022, 0.0, abs(rr - ph * 0.5)) * (1.0 - ph) * 0.9;
        }
        lamp += lampAt(uv, vec2(0.30, 0.5), vec2(1.0), 300.0, aspect) * 0.8;
      }
      water += uAccent * lamp * pulse * 0.4 * visible;
    }

    // The portrait floats at the surface and sinks away as the dive begins.
    float pmix = 1.0 - smoothstep(0.015, 0.11, d);
    if (pmix > 0.001) {
      vec2 pc = (uv - 0.5) * uCover + 0.5 + vec2(0.11, 0.0);
      // When the fit crops vertically, keep the head: bias toward the top.
      pc.y += (1.0 - uCover.y) * 0.42;
      pc.x += sin(uv.y * 9.0 + uTime * 0.8) * 0.004 * (1.0 - pmix + 0.2);
      pc += uPointer * 0.012;
      if (pc.x > 0.0 && pc.x < 1.0 && pc.y > 0.0 && pc.y < 1.0) {
        vec3 shot = texture2D(uPortrait, pc).rgb;
        float lum = dot(shot, vec3(0.299, 0.587, 0.114));
        shot = mix(vec3(lum), shot, 0.3);
        shot = pow(max(shot, 0.0), vec3(1.3)) * vec3(0.85, 0.9, 1.0);
        water = mix(water, shot, pmix * 0.9);
      }
    }

    // Vignette.
    vec2 v = uv - vec2(0.38, 0.5);
    water *= mix(0.3, 1.0, smoothstep(1.1, 0.2, length(v * vec2(1.0, 1.3))));

    // The dive iris: entering a room closes a circle over the water, its rim
    // ringed in the station's own light.
    float ir = length((uv - vec2(0.45, 0.5)) * vec2(aspect, 1.0));
    float irisR = mix(2.4, 0.14, smoothstep(0.0, 1.0, uDive));
    float inside = smoothstep(irisR, irisR - 0.22, ir);
    water *= mix(1.0, 0.05 + inside * 0.4, uDive);
    water += uAccent * smoothstep(0.03, 0.0, abs(ir - irisR)) * uDive * (1.0 - uDive * 0.55) * 0.6;

    // The type column keeps a dependable dark ground at every depth.
    water *= mix(1.0, 0.22, smoothstep(0.42, 0.9, uv.x) * (1.0 - pmix * 0.35));
    water *= mix(1.0, 0.6, smoothstep(0.6, 1.0, 1.0 - uv.y));

    // Grain, then pixel quantise.
    water += (noise(uv * 900.0 + uTime * 40.0) - 0.5) * 0.03;
    float levels = 30.0;
    vec3 col = water + dither(gl_FragCoord.xy) * (1.0 / levels);
    col = floor(col * levels + 0.5) / levels;

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
