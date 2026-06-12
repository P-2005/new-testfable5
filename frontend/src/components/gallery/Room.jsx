import { MeshReflectorMaterial } from "@react-three/drei";

// Gallery hall: 28m wide (x), 20m deep (z), 5m high
const W = 28;
const D = 20;
const H = 5;
const GOLD = "#b08d2f";

const Wall = ({ position, size }) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial color="#f5f3ee" roughness={0.92} metalness={0.02} />
  </mesh>
);

const Baseboard = ({ position, size }) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.3} />
  </mesh>
);

const CeilingPanel = ({ position }) => (
  <group position={position}>
    {/* Gold trim frame, flush with ceiling */}
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[5.4, 0.06, 2.8]} />
      <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.35} />
    </mesh>
    {/* Recessed light panel, clearly separated below the trim (no z-fighting) */}
    <mesh position={[0, -0.07, 0]}>
      <boxGeometry args={[4.9, 0.04, 2.3]} />
      <meshStandardMaterial color="#ffffff" emissive="#fff6e2" emissiveIntensity={1.4} />
    </mesh>
  </group>
);

export const Room = () => {
  return (
    <group>
      {/* Reflective polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <MeshReflectorMaterial
          blur={[220, 60]}
          resolution={768}
          mixBlur={0.9}
          mixStrength={1.1}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.25}
          color="#d8d4c9"
          metalness={0.08}
          mirror={0.15}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#efece5" roughness={1} />
      </mesh>

      {/* Walls */}
      <Wall position={[0, H / 2, -D / 2 - 0.15]} size={[W + 0.6, H, 0.3]} />
      <Wall position={[0, H / 2, D / 2 + 0.15]} size={[W + 0.6, H, 0.3]} />
      <Wall position={[-W / 2 - 0.15, H / 2, 0]} size={[0.3, H, D + 0.6]} />
      <Wall position={[W / 2 + 0.15, H / 2, 0]} size={[0.3, H, D + 0.6]} />

      {/* Gold baseboards */}
      <Baseboard position={[0, 0.07, -D / 2 + 0.03]} size={[W, 0.14, 0.06]} />
      <Baseboard position={[0, 0.07, D / 2 - 0.03]} size={[W, 0.14, 0.06]} />
      <Baseboard position={[-W / 2 + 0.03, 0.07, 0]} size={[0.06, 0.14, D]} />
      <Baseboard position={[W / 2 - 0.03, 0.07, 0]} size={[0.06, 0.14, D]} />

      {/* Gold ceiling cornice */}
      <Baseboard position={[0, H - 0.08, -D / 2 + 0.04]} size={[W, 0.1, 0.08]} />
      <Baseboard position={[0, H - 0.08, D / 2 - 0.04]} size={[W, 0.1, 0.08]} />
      <Baseboard position={[-W / 2 + 0.04, H - 0.08, 0]} size={[0.08, 0.1, D]} />
      <Baseboard position={[W / 2 - 0.04, H - 0.08, 0]} size={[0.08, 0.1, D]} />

      {/* Ceiling light panels */}
      <CeilingPanel position={[-8, H - 0.06, -4]} />
      <CeilingPanel position={[8, H - 0.06, -4]} />
      <CeilingPanel position={[-8, H - 0.06, 4]} />
      <CeilingPanel position={[8, H - 0.06, 4]} />
      <CeilingPanel position={[0, H - 0.06, 0]} />

      {/* Soft fill lights under panels */}
      <pointLight position={[-8, H - 0.7, -4]} intensity={14} distance={13} decay={1.8} color="#fff3dc" />
      <pointLight position={[8, H - 0.7, -4]} intensity={14} distance={13} decay={1.8} color="#fff3dc" />
      <pointLight position={[-8, H - 0.7, 4]} intensity={14} distance={13} decay={1.8} color="#fff3dc" />
      <pointLight position={[8, H - 0.7, 4]} intensity={14} distance={13} decay={1.8} color="#fff3dc" />
      <pointLight position={[0, H - 0.7, 0]} intensity={16} distance={14} decay={1.8} color="#fff3dc" />
    </group>
  );
};
