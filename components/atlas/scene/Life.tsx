"use client";

/* eslint-disable react-hooks/immutability --
   Everything in this file that mutates does so inside the r3f frame loop,
   which runs outside React's render. Driving per-frame values through state
   would re-render the tree sixty times a second; mutating instanced matrices,
   uniforms, and shared position refs is the intended r3f pattern. */


import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The water is inhabited.
 *
 * Two schools of fish flock through the midwater and scatter when the guide
 * or the pointer comes close; jellyfish pulse upward through the deep on
 * additive glow; bubbles stream off the octopus when it moves hard. All of it
 * is three instanced meshes with JS-driven matrices, so the whole ecosystem
 * costs three draw calls.
 */

const FISH = 34;
const JELLIES = 7;
const BUBBLES = 26;

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** A fish silhouette: teardrop body, sine-flapped tail, drawn once, instanced. */
const fishFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    // Snap to a coarse sprite grid: the fish are pixel creatures.
    vec2 quv = (floor(vUv * vec2(22.0, 12.0)) + 0.5) / vec2(22.0, 12.0);
    vec2 p = quv - 0.5;
    // Body: a teardrop pointing +x.
    float body = length(vec2(p.x * 1.5, p.y * 3.2 * (1.0 + p.x * 0.9)));
    float m = smoothstep(0.5, 0.44, body);
    // Tail: a fin behind, thickness closing toward the body.
    float tail = step(p.x, -0.18) * smoothstep(0.16, 0.02, abs(p.y) - (-p.x - 0.18) * 0.55);
    m = max(m, tail * smoothstep(-0.5, -0.18, p.x));
    if (m <= 0.01) discard;
    vec3 col = mix(vec3(0.07, 0.14, 0.24), vec3(0.16, 0.30, 0.42), smoothstep(-0.2, 0.3, p.y));
    gl_FragColor = vec4(col, m * 0.9);
  }
`;

/** A jellyfish: glowing bell and trailing tentacle strands, additive. */
const jellyFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uGlow;

  void main() {
    // Snap to a coarse sprite grid: the jellies are pixel creatures.
    vec2 quv = (floor(vUv * vec2(18.0, 30.0)) + 0.5) / vec2(18.0, 30.0);
    vec2 p = quv - vec2(0.5, 0.28);
    float a = 0.0;

    // Bell: a dome with a bright rim.
    float dome = length(p * vec2(1.35, 1.9));
    float bell = smoothstep(0.34, 0.10, dome) * step(-0.02, p.y);
    float rim = smoothstep(0.06, 0.0, abs(dome - 0.30)) * step(-0.02, p.y);
    a += bell * 0.35 + rim * 0.8;

    // Tentacles: four strands waving beneath.
    for (int i = 0; i < 4; i++) {
      float fx = (float(i) - 1.5) * 0.09;
      float sway = sin(uTime * 1.3 + float(i) * 1.8 - p.y * 6.0) * 0.03 * (0.2 - p.y);
      float strand = smoothstep(0.016, 0.0, abs(p.x - fx - sway)) * step(p.y, 0.0);
      a += strand * smoothstep(-0.62, -0.05, p.y) * 0.5;
    }

    if (a <= 0.012) discard;
    gl_FragColor = vec4(uGlow * a, a);
  }
`;

type Ref2 = React.MutableRefObject<{ x: number; y: number }>;

export function Life({
  octoPos,
  depthRef
}: {
  octoPos: Ref2;
  depthRef: React.MutableRefObject<number>;
}) {
  const fishMesh = useRef<THREE.InstancedMesh>(null);
  const jellyMesh = useRef<THREE.InstancedMesh>(null);
  const bubbleMesh = useRef<THREE.InstancedMesh>(null);
  const jellyMat = useRef<THREE.ShaderMaterial>(null);
  const fishMat = useRef<THREE.ShaderMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const fishUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const jellyUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uGlow: { value: new THREE.Color("#66d9e8") } }),
    []
  );

  // Seed state is randomised, so it is built lazily on the first frame:
  // random calls are impure and must stay out of render.
  type Fish = { school: number; x: number; y: number; vx: number; vy: number; size: number; phase: number };
  type Jelly = { x: number; y: number; drift: number; pulse: number; size: number };
  type Bubble = { x: number; y: number; vx: number; size: number; born: number };
  const fish = useRef<Fish[] | null>(null);
  const jellies = useRef<Jelly[] | null>(null);
  const bubbles = useRef<Bubble[] | null>(null);
  const nextBubble = useRef(0);
  const bubbleClock = useRef(0);
  const prevOcto = useRef({ x: 0, y: 0 });

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = frame.clock.elapsedTime;
    const deep = depthRef.current;
    fishUniforms.uTime.value = t;
    jellyUniforms.uTime.value = t;

    if (!fish.current) {
      fish.current = Array.from({ length: FISH }, (_, i) => ({
        school: i < 20 ? 0 : 1,
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 4,
        vx: 0.4,
        vy: 0,
        size: 0.16 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      }));
      jellies.current = Array.from({ length: JELLIES }, () => ({
        x: (Math.random() - 0.5) * 9,
        y: -3 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 0.12,
        pulse: Math.random() * Math.PI * 2,
        size: 0.55 + Math.random() * 0.55
      }));
      bubbles.current = Array.from({ length: BUBBLES }, () => ({
        x: 0, y: -99, vx: 0, size: 0, born: -10
      }));
    }

    const half = { w: 4.2, h: 2.6 };

    // --- fish -----------------------------------------------------------
    if (fishMesh.current && fish.current) {
      const arr = fish.current;
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        // The school's anchor wanders on slow sines; each school its own path.
        const so = f.school === 0 ? 0 : 3.1;
        const ax = Math.sin(t * 0.11 + so) * 2.8;
        const ay = Math.sin(t * 0.17 + so * 2.0) * 1.5;
        f.vx += (ax - f.x) * 0.35 * dt;
        f.vy += (ay - f.y) * 0.35 * dt;

        // Separation from the nearest neighbours.
        for (let j = 0; j < arr.length; j += 3) {
          if (j === i) continue;
          const o = arr[j];
          const dx = f.x - o.x, dy = f.y - o.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 0.12 && d2 > 0.0001) {
            const inv = 0.5 / d2;
            f.vx += dx * inv * dt;
            f.vy += dy * inv * dt;
          }
        }

        // Flee the guide.
        const gx = f.x - octoPos.current.x, gy = f.y - octoPos.current.y;
        const gd = gx * gx + gy * gy;
        if (gd < 2.2 && gd > 0.001) {
          const inv = 2.6 / gd;
          f.vx += gx * inv * dt;
          f.vy += gy * inv * dt;
        }

        // Damping and integration.
        const damp = Math.exp(-0.7 * dt);
        f.vx *= damp; f.vy *= damp;
        const sp = Math.hypot(f.vx, f.vy);
        const maxSp = 2.4;
        if (sp > maxSp) { f.vx = (f.vx / sp) * maxSp; f.vy = (f.vy / sp) * maxSp; }
        f.x += f.vx * dt; f.y += f.vy * dt;

        // Matrix: face the velocity, flap by speed.
        const flap = 1 + Math.sin(t * (8 + f.phase) + f.phase) * 0.12 * Math.min(sp, 1.5);
        dummy.position.set(f.x, f.y, 0.18);
        dummy.rotation.z = Math.atan2(f.vy, f.vx);
        dummy.scale.set(f.size * flap, f.size * 0.8, 1);
        dummy.updateMatrix();
        fishMesh.current.setMatrixAt(i, dummy.matrix);
      }
      fishMesh.current.instanceMatrix.needsUpdate = true;
      // Fish thin out in the abyss, where jellies take over.
      if (fishMat.current) fishMat.current.opacity = 0.95 * (1 - Math.max(0, deep - 0.6) * 2.2);
    }

    // --- jellies --------------------------------------------------------
    if (jellyMesh.current && jellies.current) {
      jellies.current.forEach((j, i) => {
        j.pulse += dt * 1.7;
        const pulse = Math.sin(j.pulse);
        j.y += (0.08 + Math.max(pulse, 0) * 0.22) * dt * 1.6;
        j.x += j.drift * dt;
        if (j.y > half.h + 1.4) { j.y = -half.h - 1.4; j.x = (Math.random() - 0.5) * 9; }
        dummy.position.set(j.x, j.y, 0.26);
        dummy.rotation.z = Math.sin(t * 0.4 + i) * 0.1;
        dummy.scale.set(j.size * (1 - pulse * 0.08), j.size * (1 + pulse * 0.14), 1);
        dummy.updateMatrix();
        jellyMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      jellyMesh.current.instanceMatrix.needsUpdate = true;
      // Jellies belong to the deep; they fade in as sunlight fades out.
      if (jellyMat.current) jellyMat.current.opacity = Math.min(1, Math.max(0, deep - 0.18) * 2.6);
    }

    // --- bubbles --------------------------------------------------------
    if (bubbleMesh.current && bubbles.current) {
      const op = octoPos.current;
      const speed = Math.hypot(op.x - prevOcto.current.x, op.y - prevOcto.current.y) / Math.max(dt, 0.001);
      prevOcto.current = { x: op.x, y: op.y };
      bubbleClock.current -= dt;
      // Streams when the guide moves hard, sighs occasionally at rest.
      if ((speed > 1.6 && bubbleClock.current <= 0) || bubbleClock.current < -2.2) {
        bubbleClock.current = speed > 1.6 ? 0.05 : 1.6 + Math.random();
        const b = bubbles.current![nextBubble.current++ % BUBBLES];
        b.x = op.x + (Math.random() - 0.5) * 0.3;
        b.y = op.y + 0.25;
        b.vx = (Math.random() - 0.5) * 0.2;
        b.size = 0.02 + Math.random() * 0.035;
        b.born = t;
      }
      bubbles.current!.forEach((b, i) => {
        const age = t - b.born;
        let scale = 0;
        if (age > 0 && age < 3) {
          b.y += (0.5 + b.size * 6) * dt;
          b.x += (b.vx + Math.sin(t * 3 + i) * 0.08) * dt;
          scale = b.size * Math.min(age * 6, 1) * (1 - age / 3);
        }
        dummy.position.set(b.x, b.y, 0.55);
        dummy.rotation.z = 0;
        dummy.scale.setScalar(Math.max(scale, 0.0001));
        dummy.updateMatrix();
        bubbleMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      bubbleMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={fishMesh} args={[undefined, undefined, FISH]} frustumCulled={false}>
        <planeGeometry args={[1, 0.5]} />
        <shaderMaterial
          ref={fishMat}
          vertexShader={quadVertex}
          fragmentShader={fishFragment}
          uniforms={fishUniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh ref={jellyMesh} args={[undefined, undefined, JELLIES]} frustumCulled={false}>
        <planeGeometry args={[1, 1.6]} />
        <shaderMaterial
          ref={jellyMat}
          vertexShader={quadVertex}
          fragmentShader={jellyFragment}
          uniforms={jellyUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh ref={bubbleMesh} args={[undefined, undefined, BUBBLES]} frustumCulled={false}>
        <circleGeometry args={[1, 8]} />
        <meshBasicMaterial color="#bfe6f5" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </>
  );
}
