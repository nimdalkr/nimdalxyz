"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The guide.
 *
 * A procedural octopus rather than a sprite: a soft-domed body whose eyes
 * track the pointer, and eight tentacles that trail with follow-through as it
 * swims. It shadows the diver through the water column, darts ahead when the
 * station changes, and tucks into the corner when a room opens.
 *
 * Follow-the-leader chains give the tentacles their physics: each bead chases
 * the one before it at a fixed segment length, so momentum, drag, and curl all
 * emerge from movement instead of being animated by hand.
 */

const TENTACLES = 8;
const BEADS = 16;
const SEG = 0.088;

const bodyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bodyFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2  uLook;    // -1..1 pointer
  uniform float uDeep;    // 0 surface .. 1 abyss
  uniform vec3  uAccent;
  uniform float uTime;

  void main() {
    vec2 p = vUv - 0.5;
    p.y -= 0.04;
    float dome = length(p * vec2(1.0, 1.16));
    float body = smoothstep(0.36, 0.345, dome);
    if (body <= 0.0) discard;

    // Silhouette with a faint top light; the deep swaps sunlight for its own.
    vec3 col = mix(vec3(0.05, 0.10, 0.17), vec3(0.10, 0.19, 0.30), smoothstep(-0.3, 0.3, p.y));
    float rim = smoothstep(0.30, 0.345, dome);
    vec3 rimCol = mix(vec3(0.55, 0.85, 0.95), uAccent, uDeep);
    col += rimCol * rim * (0.35 + uDeep * 0.45 + 0.1 * sin(uTime * 2.0));

    // Eyes, tracking the pointer.
    vec2 look = uLook * 0.022;
    for (int i = 0; i < 2; i++) {
      float sx = i == 0 ? -0.125 : 0.125;
      vec2 eye = p - vec2(sx, 0.05);
      float white = smoothstep(0.075, 0.065, length(eye));
      float pupil = smoothstep(0.034, 0.026, length(eye - look));
      col = mix(col, vec3(0.92, 0.96, 0.98), white);
      col = mix(col, vec3(0.03, 0.05, 0.09), pupil * white);
    }

    gl_FragColor = vec4(col, body);
  }
`;

export type OctopusHandle = {
  /** Where the guide should swim, in viewport world units. */
  setTarget: (x: number, y: number) => void;
  /** Startle: a quick dash impulse, used when the station changes. */
  dart: (dx: number, dy: number) => void;
  setDeep: (value: number) => void;
  setAccent: (hue: string) => void;
};

export function OctopusGuide({
  handleRef,
  pointerRef
}: {
  handleRef: React.MutableRefObject<OctopusHandle | null>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.ShaderMaterial>(null);
  const beadsMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const state = useRef({
    pos: new THREE.Vector2(-2.1, -1.35),
    vel: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(-2.1, -1.35),
    deep: 0
  });

  // Tentacle bead positions persist across frames; physics comes from chasing.
  // Each chain starts posed as a fan so the first frame already reads as arms.
  const chains = useMemo(
    () =>
      Array.from({ length: TENTACLES }, (_, i) => {
        const angle = (i / (TENTACLES - 1) - 0.5) * 1.7;
        return Array.from({ length: BEADS }, (_, j) =>
          new THREE.Vector2(-2.1 + Math.sin(angle) * j * SEG, -1.35 - j * SEG)
        );
      }),
    []
  );

  const bodyUniforms = useMemo(
    () => ({
      uLook: { value: new THREE.Vector2(0, 0) },
      uDeep: { value: 0 },
      uAccent: { value: new THREE.Color("#7fe3c4") },
      uTime: { value: 0 }
    }),
    []
  );
  const accent = useRef(new THREE.Color("#7fe3c4"));

  useEffect(() => {
    handleRef.current = {
      setTarget: (x, y) => { state.current.target.set(x, y); },
      dart: (dx, dy) => { state.current.vel.x += dx; state.current.vel.y += dy; },
      setDeep: (value) => { state.current.deep = value; },
      setAccent: (hue) => { accent.current.set(hue); }
    };
  }, [handleRef]);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = frame.clock.elapsedTime;
    const s = state.current;

    // Swim: a soft spring toward the target, plus idle bobbing.
    const bobX = Math.sin(t * 0.6) * 0.25;
    const bobY = Math.sin(t * 1.4) * 0.16;
    s.vel.x += (s.target.x + bobX - s.pos.x) * 3.2 * dt;
    s.vel.y += (s.target.y + bobY - s.pos.y) * 3.2 * dt;
    s.vel.multiplyScalar(Math.exp(-2.4 * dt));
    s.pos.x += s.vel.x * dt;
    s.pos.y += s.vel.y * dt;

    if (group.current) {
      group.current.position.set(s.pos.x, s.pos.y, 0.6);
      group.current.rotation.z = THREE.MathUtils.clamp(-s.vel.x * 0.06, -0.4, 0.4);
      const squash = 1 + Math.sin(t * 2.6) * 0.04 + Math.min(s.vel.length() * 0.03, 0.12);
      group.current.scale.set(1 / squash, squash, 1);
    }

    // Three clones constructor uniforms; write to the material's own set.
    const bu = bodyMat.current?.uniforms;
    if (bu) {
      bu.uTime.value = t;
      bu.uDeep.value += (s.deep - bu.uDeep.value) * Math.min(1, dt * 2);
      bu.uAccent.value.lerp(accent.current, Math.min(1, dt * 2));
      bu.uLook.value.set(
        THREE.MathUtils.clamp(pointerRef.current.x, -1, 1),
        THREE.MathUtils.clamp(-pointerRef.current.y, -1, 1)
      );
    }

    // Tentacles: anchors fan across the underside; beads chase their leaders.
    if (beadsMesh.current) {
      let instance = 0;
      for (let i = 0; i < TENTACLES; i++) {
        const spread = (i / (TENTACLES - 1) - 0.5) * 1.7;
        const anchorX = s.pos.x + Math.sin(spread) * 0.42;
        const anchorY = s.pos.y - 0.2 - Math.cos(spread) * 0.08;
        // The rest direction fans outward and down; blending a little of it
        // into the follow direction keeps the arms from collapsing into one.
        const restX = Math.sin(spread) * 0.85;
        const restY = -1;
        const restLen = Math.hypot(restX, restY);
        const chain = chains[i];
        chain[0].set(anchorX, anchorY);
        for (let j = 1; j < BEADS; j++) {
          const prev = chain[j - 1];
          const bead = chain[j];
          // Sway gives life even at rest; it grows toward the tip.
          const sway = Math.sin(t * 1.6 + i * 1.7 + j * 0.45) * 0.007 * j;
          let dx = bead.x - prev.x + sway;
          let dy = bead.y - prev.y;
          const len = Math.max(Math.hypot(dx, dy), 0.0001);
          dx = (dx / len) * 0.8 + (restX / restLen) * 0.2;
          dy = (dy / len) * 0.8 + (restY / restLen) * 0.2;
          const norm = Math.max(Math.hypot(dx, dy), 0.0001);
          bead.set(prev.x + (dx / norm) * SEG, prev.y + (dy / norm) * SEG);
          const taper = 0.085 * (1 - (j / BEADS) * 0.8);
          dummy.position.set(bead.x, bead.y, 0.55);
          dummy.scale.setScalar(taper);
          dummy.updateMatrix();
          beadsMesh.current.setMatrixAt(instance++, dummy.matrix);
        }
      }
      beadsMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={group}>
        <mesh>
          <planeGeometry args={[1.5, 1.5]} />
          <shaderMaterial
            ref={bodyMat}
            vertexShader={bodyVertex}
            fragmentShader={bodyFragment}
            uniforms={bodyUniforms}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
      <instancedMesh
        ref={beadsMesh}
        args={[undefined, undefined, TENTACLES * (BEADS - 1)]}
        frustumCulled={false}
      >
        <circleGeometry args={[1, 10]} />
        <meshBasicMaterial color="#0a1626" transparent opacity={0.95} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      {/* Keep the guide inside the frame on any viewport. */}
      <group visible={false} position={[viewport.width / 2, viewport.height / 2, 0]} />
    </>
  );
}
