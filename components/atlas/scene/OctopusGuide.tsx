"use client";

/* eslint-disable react-hooks/immutability --
   Everything in this file that mutates does so inside the r3f frame loop,
   which runs outside React's render. Driving per-frame values through state
   would re-render the tree sixty times a second; mutating instanced matrices,
   uniforms, and shared position refs is the intended r3f pattern. */


import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The guide is the NFT itself.
 *
 * The pixel-octopus identity artwork swims the dive in person: its flat
 * background is keyed out in the shader, a rim of the station's light wraps it
 * in the deep, and all the life comes from movement: bobbing, leaning into
 * travel, darting to a pointer press, and inking when startled.
 */

const INK = 12;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const spriteFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uDeep;    // 0 surface .. 1 abyss
  uniform vec3  uAccent;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // The identity is a JPEG on a flat ground: key the ground out by distance
    // to a corner sample instead of shipping a second cut-out asset.
    vec3 key = texture2D(uMap, vec2(0.03, 0.03)).rgb;
    float d = distance(tex.rgb, key);
    if (d < 0.22) discard;

    vec3 col = tex.rgb;

    // In the deep, the water's own light wraps the sprite's silhouette.
    float edge = smoothstep(0.34, 0.22, d);
    vec3 rim = mix(vec3(0.6, 0.85, 0.95), uAccent, uDeep);
    col += rim * edge * (0.18 + uDeep * 0.4 + 0.06 * sin(uTime * 2.0));

    // Sink the palette slightly with depth so the sprite sits in the water.
    col *= mix(1.0, 0.82, uDeep * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type OctopusHandle = {
  /** Where the guide should swim, in viewport world units. */
  setTarget: (x: number, y: number) => void;
  /** A pointer press in NDC (-1..1): the guide darts over to look. */
  poke: (nx: number, ny: number) => void;
  /** Startle: a quick dash impulse, used when the station changes. */
  dart: (dx: number, dy: number) => void;
  setDeep: (value: number) => void;
  setAccent: (hue: string) => void;
};

export function OctopusGuide({
  handleRef,
  pointerRef,
  posOut
}: {
  handleRef: React.MutableRefObject<OctopusHandle | null>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  /** Written every frame: the fish need to know where to flee from. */
  posOut: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const spriteMat = useRef<THREE.ShaderMaterial>(null);

  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load("/media/identity-octopus.jpg");
    t.colorSpace = THREE.SRGBColorSpace;
    // Keep the pixel art pixelated instead of smearing it.
    t.magFilter = THREE.NearestFilter;
    return t;
  }, []);

  const state = useRef({
    pos: new THREE.Vector2(-2.1, -1.35),
    vel: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(-2.1, -1.35),
    deep: 0,
    pokeUntil: 0,
    poke: new THREE.Vector2(0, 0),
    inkPending: false
  });

  // Ink cloud: a burst of dark blots released where the guide was startled.
  const inkMesh = useRef<THREE.InstancedMesh>(null);
  const inkDummy = useMemo(() => new THREE.Object3D(), []);
  const inkSeeds = useRef(
    Array.from({ length: INK }, () => ({ x: 0, y: 0, vx: 0, vy: 0, born: -10 }))
  );

  const spriteUniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uDeep: { value: 0 },
      uAccent: { value: new THREE.Color("#7fe3c4") }
    }),
    [texture]
  );
  const accent = useRef(new THREE.Color("#7fe3c4"));

  useEffect(() => {
    handleRef.current = {
      setTarget: (x, y) => { state.current.target.set(x, y); },
      poke: (nx, ny) => {
        state.current.poke.set(nx, ny);
        state.current.pokeUntil = performance.now() + 650;
        state.current.inkPending = true;
      },
      dart: (dx, dy) => { state.current.vel.x += dx; state.current.vel.y += dy; },
      setDeep: (value) => { state.current.deep = value; },
      setAccent: (hue) => { accent.current.set(hue); }
    };
  }, [handleRef]);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = frame.clock.elapsedTime;
    const s = state.current;

    // The stage speaks in desktop-scale world units; on a narrow viewport the
    // same coordinates land off-screen, so targets are rescaled and clamped to
    // what this frustum can actually show.
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const fit = Math.min(1, halfW / 2.9);
    let goalX = s.target.x * fit;
    let goalY = s.target.y * Math.min(1, halfH / 2.1);

    // A pointer press outranks the itinerary: dart over, look, drift back.
    if (performance.now() < s.pokeUntil) {
      goalX = s.poke.x * halfW * 0.82;
      goalY = -s.poke.y * halfH * 0.82;
    }
    goalX = THREE.MathUtils.clamp(goalX, -halfW + 0.85, halfW - 0.85);
    goalY = THREE.MathUtils.clamp(goalY, -halfH + 1.0, halfH - 0.8);

    // Swim: a soft spring toward the goal, plus idle bobbing.
    const bobX = Math.sin(t * 0.6) * 0.25;
    const bobY = Math.sin(t * 1.4) * 0.16;
    s.vel.x += (goalX + bobX - s.pos.x) * 3.2 * dt;
    s.vel.y += (goalY + bobY - s.pos.y) * 3.2 * dt;
    s.vel.multiplyScalar(Math.exp(-2.4 * dt));
    s.pos.x += s.vel.x * dt;
    s.pos.y += s.vel.y * dt;

    if (group.current) {
      group.current.position.set(s.pos.x, s.pos.y, 0.6);
      group.current.rotation.z = THREE.MathUtils.clamp(-s.vel.x * 0.06, -0.35, 0.35);
      const squash = 1 + Math.sin(t * 2.6) * 0.035 + Math.min(s.vel.length() * 0.025, 0.1);
      const bodyFit = Math.min(1, halfW / 3.2);
      group.current.scale.set(bodyFit / squash, bodyFit * squash, 1);
    }

    // Three clones constructor uniforms; write to the material's own set.
    const su = spriteMat.current?.uniforms;
    if (su) {
      su.uTime.value = t;
      su.uDeep.value += (s.deep - su.uDeep.value) * Math.min(1, dt * 2);
      su.uAccent.value.lerp(accent.current, Math.min(1, dt * 2));
    }

    // Ink: spawned on startle, drifting apart, swallowed by the water.
    if (s.inkPending) {
      s.inkPending = false;
      for (const blot of inkSeeds.current) {
        const a = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.9;
        blot.x = s.pos.x; blot.y = s.pos.y - 0.1;
        blot.vx = Math.cos(a) * speed; blot.vy = Math.sin(a) * speed - 0.15;
        blot.born = t + Math.random() * 0.08;
      }
    }
    if (inkMesh.current) {
      const life = 1.1;
      const inkFit = Math.min(1, halfW / 3.2);
      inkSeeds.current.forEach((blot, idx) => {
        const age = t - blot.born;
        let scale = 0;
        if (age > 0 && age < life) {
          blot.x += blot.vx * dt; blot.y += blot.vy * dt;
          blot.vx *= Math.exp(-2.2 * dt); blot.vy *= Math.exp(-2.2 * dt);
          const grow = Math.min(age / 0.14, 1);
          scale = 0.16 * inkFit * grow * (1 - age / life);
        }
        inkDummy.position.set(blot.x, blot.y, 0.5);
        inkDummy.scale.setScalar(Math.max(scale, 0.0001));
        inkDummy.updateMatrix();
        inkMesh.current!.setMatrixAt(idx, inkDummy.matrix);
      });
      inkMesh.current.instanceMatrix.needsUpdate = true;
    }

    // The pointer already drives the ocean's parallax; the sprite's own eyes
    // are part of the artwork, so nothing tracks here.
    void pointerRef;

    posOut.current.x = s.pos.x;
    posOut.current.y = s.pos.y;
  });

  return (
    <>
      <instancedMesh ref={inkMesh} args={[undefined, undefined, INK]} frustumCulled={false}>
        <circleGeometry args={[1, 10]} />
        <meshBasicMaterial color="#071120" transparent opacity={0.8} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      <group ref={group}>
        <mesh>
          <planeGeometry args={[2.15, 2.15]} />
          <shaderMaterial
            ref={spriteMat}
            vertexShader={vertexShader}
            fragmentShader={spriteFragment}
            uniforms={spriteUniforms}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}
