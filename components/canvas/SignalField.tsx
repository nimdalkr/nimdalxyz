"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function DeepCurrentParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { colors, positions } = useMemo(() => {
    const count = 980;
    const positionData = new Float32Array(count * 3);
    const colorData = new Float32Array(count * 3);
    const cyan = new THREE.Color("#55d6c2");
    const acid = new THREE.Color("#c7f15b");
    const coral = new THREE.Color("#ff7a8a");

    for (let index = 0; index < count; index += 1) {
      const lane = Math.floor(seededRandom(index + 101) * 7) - 3;
      const horizontal = (seededRandom(index + 29) - 0.5) * 7.8;
      const vertical = (seededRandom(index + 47) - 0.5) * 4.4;
      const depth = (seededRandom(index + 71) - 0.5) * 4.2;

      positionData[index * 3] = horizontal + lane * 0.18;
      positionData[index * 3 + 1] = vertical + Math.sin(horizontal * 1.1 + lane) * 0.16;
      positionData[index * 3 + 2] = depth;

      const color = index % 19 === 0 ? coral : index % 7 === 0 ? acid : cyan;
      colorData[index * 3] = color.r;
      colorData[index * 3 + 1] = color.g;
      colorData[index * 3 + 2] = color.b;
    }

    return { colors: colorData, positions: positionData };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.035;
    pointsRef.current.rotation.y += delta * 0.012;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.16;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.58}
        size={0.015}
        sizeAttenuation
        transparent
        vertexColors
      />
    </points>
  );
}

function SonarRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.z += delta * 0.04;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.2;
  });

  return (
    <group ref={groupRef} position={[1.6, -0.18, -1.2]} rotation={[1.12, 0.18, 0.35]}>
      {[1.45, 2.15, 2.85].map((radius, index) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, 0.003, 8, 160]} />
          <meshBasicMaterial
            blending={THREE.AdditiveBlending}
            color={index === 1 ? "#c7f15b" : "#55d6c2"}
            opacity={index === 1 ? 0.16 : 0.22}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

export default function SignalField() {
  return (
    <div className="motion-heavy pointer-events-none fixed inset-0 z-0 opacity-75" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <DeepCurrentParticles />
        <SonarRings />
      </Canvas>
    </div>
  );
}
