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
 * Follow-the-leader chains give the tentacles their physics: each point chases
 * the one before it at a fixed segment length, so momentum, drag, and curl all
 * emerge from movement instead of being animated by hand. The chains render as
 * continuous tapered ribbons (one triangle strip per arm), not bead dots.
 */

const TENTACLES = 8;
const BEADS = 16;
const SEG = 0.088;
const INK = 12;

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
  /** A pointer press in NDC (-1..1): the guide darts over to look. */
  poke: (nx: number, ny: number) => void;
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
  const ribbon = useRef<THREE.Mesh>(null);

  // One triangle strip for all arms: two vertices per chain point, indexed
  // once at mount, positions rewritten every frame.
  const ribbonGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const vertexCount = TENTACLES * BEADS * 2;
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
    const indices: number[] = [];
    for (let ti = 0; ti < TENTACLES; ti++) {
      const base = ti * BEADS * 2;
      for (let j = 0; j < BEADS - 1; j++) {
        const a = base + j * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    geom.setIndex(indices);
    return geom;
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

  // Ink cloud: a burst of dark blots released where the guide was startled.
  const inkMesh = useRef<THREE.InstancedMesh>(null);
  const inkDummy = useMemo(() => new THREE.Object3D(), []);
  const inkSeeds = useRef(
    Array.from({ length: INK }, () => ({ x: 0, y: 0, vx: 0, vy: 0, born: -10 }))
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
      poke: (nx, ny) => {
        // NDC to world at z=0, held briefly so the dash reads as curiosity.
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
      group.current.rotation.z = THREE.MathUtils.clamp(-s.vel.x * 0.06, -0.4, 0.4);
      const squash = 1 + Math.sin(t * 2.6) * 0.04 + Math.min(s.vel.length() * 0.03, 0.12);
      const bodyFit = Math.min(1, halfW / 3.2);
      group.current.scale.set(bodyFit / squash, bodyFit * squash, 1);
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

    // Tentacles: anchors fan across the underside; points chase their leaders,
    // then the chain extrudes into a tapered ribbon.
    const geom = ribbon.current?.geometry as THREE.BufferGeometry | undefined;
    const attr = geom?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (attr) {
      // Arms wear the same fit as the body, or a small phone gets desktop-
      // length tentacles on a shrunken torso.
      const armFit = Math.min(1, halfW / 3.2);
      const seg = SEG * armFit;
      for (let i = 0; i < TENTACLES; i++) {
        const spread = (i / (TENTACLES - 1) - 0.5) * 1.7;
        const anchorX = s.pos.x + Math.sin(spread) * 0.42 * armFit;
        const anchorY = s.pos.y - (0.2 + Math.cos(spread) * 0.08) * armFit;
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
          bead.set(prev.x + (dx / norm) * seg, prev.y + (dy / norm) * seg);
        }
        // Extrude: offset each point perpendicular to its local direction.
        const base = i * BEADS * 2;
        for (let j = 0; j < BEADS; j++) {
          const cur = chain[j];
          const next = chain[Math.min(j + 1, BEADS - 1)];
          const prev = chain[Math.max(j - 1, 0)];
          let tx = next.x - prev.x;
          let ty = next.y - prev.y;
          const tl = Math.max(Math.hypot(tx, ty), 0.0001);
          tx /= tl; ty /= tl;
          const w = Math.max(0.062 * armFit * (1 - (j / (BEADS - 1)) * 0.9), 0.006);
          const v = (base + j * 2) * 3;
          const arr = attr.array as Float32Array;
          arr[v] = cur.x - ty * w; arr[v + 1] = cur.y + tx * w; arr[v + 2] = 0.55;
          arr[v + 3] = cur.x + ty * w; arr[v + 4] = cur.y - tx * w; arr[v + 5] = 0.55;
        }
      }
      attr.needsUpdate = true;
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
      const fit = Math.min(1, (viewport.width / 2) / 3.2);
      inkSeeds.current.forEach((blot, idx) => {
        const age = t - blot.born;
        let scale = 0;
        if (age > 0 && age < life) {
          blot.x += blot.vx * dt; blot.y += blot.vy * dt;
          blot.vx *= Math.exp(-2.2 * dt); blot.vy *= Math.exp(-2.2 * dt);
          const grow = Math.min(age / 0.14, 1);
          scale = 0.16 * fit * grow * (1 - age / life);
        }
        inkDummy.position.set(blot.x, blot.y, 0.5);
        inkDummy.scale.setScalar(Math.max(scale, 0.0001));
        inkDummy.updateMatrix();
        inkMesh.current!.setMatrixAt(idx, inkDummy.matrix);
      });
      inkMesh.current.instanceMatrix.needsUpdate = true;
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
      <instancedMesh ref={inkMesh} args={[undefined, undefined, INK]} frustumCulled={false}>
        <circleGeometry args={[1, 10]} />
        <meshBasicMaterial color="#071120" transparent opacity={0.8} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      <mesh ref={ribbon} geometry={ribbonGeom} frustumCulled={false}>
        <meshBasicMaterial
          color="#0c1a2c"
          transparent
          opacity={0.96}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Keep the guide inside the frame on any viewport. */}
      <group visible={false} position={[viewport.width / 2, viewport.height / 2, 0]} />
    </>
  );
}
