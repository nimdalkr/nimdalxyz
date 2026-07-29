"use client";

/* eslint-disable react-hooks/immutability --
   Uniform values are mutated inside useFrame on purpose. This is how r3f is
   meant to be driven: writing per-frame values through React state would
   re-render the tree sixty times a second. The mutations touch only the GPU
   uniform objects, never React state. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The cinematic frame.
 *
 * One full-bleed plane carrying the chapter's photograph, graded dark and cool
 * so type can sit on it at full contrast. The WebGL is doing work that CSS
 * cannot: a live grade, breathing displacement, grain that does not tile, and a
 * dissolve between chapters that is driven by image luminance rather than a
 * crossfade.
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

  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uMix;        // 0 showing uFrom, 1 showing uTo
  uniform float uTime;
  uniform vec2  uParallax;   // pointer, -1..1
  uniform vec2  uCover;      // aspect correction
  uniform float uReveal;     // 0 hidden, 1 fully present
  uniform vec3  uAccent;
  uniform float uSoftFrom;   // 1 when the frame is a UI screenshot
  uniform float uSoftTo;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y);
  }

  // A screenshot is not a photograph. Shown sharp and full-bleed it reads as a
  // random web page, so product frames are pushed well past legibility and
  // softened into environment: they carry texture and colour, not information.
  // The project page is where the screen is meant to be read.
  vec3 sampleFrame(sampler2D tex, vec2 uv, float depth, float soft) {
    float zoom = mix(1.0, 0.42, soft);
    vec2 c = (uv - 0.5) * uCover * zoom + 0.5 + vec2(mix(0.11, 0.02, soft), 0.0);
    c += uParallax * 0.014 * depth;
    c += vec2(sin(uTime * 0.14) * 0.004, cos(uTime * 0.11) * 0.003);

    float r = 0.006 * soft;
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    for (int i = -2; i <= 2; i++) {
      for (int j = -2; j <= 2; j++) {
        vec2 o = vec2(float(i), float(j)) * r;
        vec2 q = clamp(c + o, vec2(0.0), vec2(1.0));
        float w = 1.0 - length(vec2(float(i), float(j))) * 0.28;
        if (w <= 0.0) continue;
        acc += texture2D(tex, q).rgb * w;
        wsum += w;
        if (soft < 0.5) { return texture2D(tex, clamp(c, vec2(0.0), vec2(1.0))).rgb; }
      }
    }
    return acc / max(wsum, 0.001);
  }

  void main() {
    vec3 a = sampleFrame(uFrom, vUv, 1.0, uSoftFrom);
    vec3 b = sampleFrame(uTo, vUv, 1.35, uSoftTo);

    // Luminance-led dissolve: the bright parts of the incoming frame arrive
    // first, which reads as light coming up rather than a plain crossfade.
    // The bias decays with t so the transition is guaranteed to land fully on
    // the incoming frame; without that the previous chapter never clears.
    float lumB = dot(b, vec3(0.299, 0.587, 0.114));
    float t = clamp(uMix, 0.0, 1.0);
    float bias = (lumB - 0.5) * 0.55;
    float k = smoothstep(0.0, 1.0, clamp(t * 1.30 - bias * (1.0 - t), 0.0, 1.0));
    vec3 col = mix(a, b, k);

    // Grade: desaturate, crush toward a cool near-black, lift the highlights.
    float lume = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lume), col, mix(0.28, 0.16, max(uSoftFrom, uSoftTo)));
    col = pow(max(col, 0.0), vec3(1.35));
    col *= vec3(0.82, 0.88, 1.0);
    col += uAccent * pow(lume, 6.0) * 0.10;

    // Vignette pulls the eye to the left third where the subject sits.
    vec2 v = vUv - vec2(0.32, 0.5);
    col *= mix(0.22, 1.0, smoothstep(1.05, 0.15, length(v * vec2(1.0, 1.25))));

    // Scrim under the type column. The panel needs a dependable dark ground so
    // the headline never has to fight whatever the photograph is doing there.
    col *= mix(1.0, 0.20, smoothstep(0.40, 0.92, vUv.x));
    col *= mix(1.0, 0.55, smoothstep(0.55, 1.0, 1.0 - vUv.y));

    // Film grain, animated so it never looks like a static texture.
    float g = noise(vUv * 900.0 + uTime * 40.0);
    col += (g - 0.5) * 0.035;

    // Reveal wipes up from the bottom on first entry.
    col *= smoothstep(0.0, 0.35, uReveal - (1.0 - vUv.y) * 0.35 + 0.35);

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

export type FrameHandle = {
  setParallax: (x: number, y: number) => void;
};

interface FrameProps {
  images: string[];
  /** Per chapter: true when the image is a product screenshot, not a photo. */
  soft: boolean[];
  /** Which chapter is showing. Driving this by prop rather than by an
      imperative handle keeps the swap inside React's lifecycle; assigning a
      handle during render is not reliable under the R3F reconciler. */
  index: number;
  handleRef: React.MutableRefObject<FrameHandle | null>;
  accent: string;
}

export function Frame({ images, soft, index, handleRef, accent }: FrameProps) {
  const { size, viewport } = useThree();
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return images.map((src) => {
      const t = loader.load(src);
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      return t;
    });
  }, [images]);

  // Track the outgoing chapter with React's derive-during-render pattern rather
  // than a ref: the fresh material needs to know what it is dissolving away
  // from, and a ref cannot legally be read while rendering.
  const [shown, setShown] = useState(index);
  const [previous, setPrevious] = useState(index);
  if (shown !== index) {
    setPrevious(shown);
    setShown(index);
  }

  // A new uniform object (and a new material, via the key below) per chapter.
  // Mutating a live material's texture uniforms proved unreliable here, and a
  // ten-chapter recompile is a cheap price for a swap that always lands.
  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[previous] ?? textures[0] },
      uTo: { value: textures[index] ?? textures[0] },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uParallax: { value: new THREE.Vector2(0, 0) },
      uCover: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
      uSoftFrom: { value: soft[previous] ? 1 : 0 },
      uSoftTo: { value: soft[index] ? 1 : 0 }
    }),
    [textures, accent, index, previous, soft]
  );

  const pointer = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    handleRef.current = { setParallax: (x, y) => { pointer.current.set(x, y); } };
  }, [handleRef]);


  // Cover-fit is per image: a 3:4 portrait and a 16:10 screenshot need
  // different corrections, and using one for all of them pushes the sample
  // outside the texture so the incoming frame reads as empty.
  const fitTo = (tex: THREE.Texture | undefined) => {
    const img = tex?.image as HTMLImageElement | undefined;
    const imageAspect = img && img.width ? img.width / img.height : 16 / 9;
    const viewAspect = size.width / Math.max(size.height, 1);
    if (viewAspect > imageAspect) uniforms.uCover.value.set(1, imageAspect / viewAspect);
    else uniforms.uCover.value.set(viewAspect / imageAspect, 1);
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    fitTo(textures[index]);
    uniforms.uMix.value += (1 - uniforms.uMix.value) * Math.min(1, dt * 2.6);
    uniforms.uReveal.value += (1 - uniforms.uReveal.value) * Math.min(1, dt * 1.6);
    uniforms.uParallax.value.lerp(pointer.current, Math.min(1, dt * 2.2));
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width || 40, viewport.height || 24]} />
      <shaderMaterial
        key={index}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
