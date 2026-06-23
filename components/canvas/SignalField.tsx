"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function SignalParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 620;
    const data = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 1.15 + seededRandom(index + 11) * 2.9;
      const angle = seededRandom(index + 29) * Math.PI * 2;
      const vertical = (seededRandom(index + 47) - 0.5) * 2.25;

      data[index * 3] = Math.cos(angle) * radius;
      data[index * 3 + 1] = vertical;
      data[index * 3 + 2] = Math.sin(angle) * radius;
    }

    return data;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y += delta * 0.024;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.045;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#55d6c2"
        depthWrite={false}
        opacity={0.5}
        size={0.012}
        sizeAttenuation
        transparent
      />
    </points>
  );
}

export default function SignalField() {
  return (
    <div className="motion-heavy pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <SignalParticles />
      </Canvas>
    </div>
  );
}
