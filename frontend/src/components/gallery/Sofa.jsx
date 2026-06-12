import { useGalleryStore } from "../../store/galleryStore";

const GOLD = "#b08d2f";
const LEATHER = "#2b2724";
const CUSHION = "#37322d";

/**
 * Luxury leather sofa. Two are placed back-to-back in the hall centre.
 * Click / tap (or centre-reticle click) to sit; 360° look while seated.
 */
export const Sofa = ({ position = [0, 0, 0], rotationY = 0, seat, stand }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    const s = useGalleryStore.getState();
    if (s.paused || s.activeArtwork || s.activeNpc || s.seated) return;
    // Locked mode sits via the centre-reticle click in Player
    if (!s.isMobile && (s.plActive || s.simLock)) return;
    if (typeof e.delta === "number" && e.delta > 8) return;
    s.sitDown(seat, stand);
  };

  const Part = ({ position: p, size, color, metalness = 0.05, roughness = 0.8 }) => (
    <mesh position={p} userData={{ sofa: true }} onClick={handleClick}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base frame */}
      <Part position={[0, 0.3, 0]} size={[3.3, 0.16, 1.2]} color={LEATHER} />
      {/* Gold trim under base */}
      <Part position={[0, 0.21, 0]} size={[3.34, 0.03, 1.24]} color={GOLD} metalness={0.85} roughness={0.3} />
      {/* Seat cushions */}
      <Part position={[-0.8, 0.46, 0]} size={[1.52, 0.18, 1.1]} color={CUSHION} />
      <Part position={[0.8, 0.46, 0]} size={[1.52, 0.18, 1.1]} color={CUSHION} />
      {/* Backrest */}
      <Part position={[0, 0.78, 0.5]} size={[3.3, 0.75, 0.2]} color={LEATHER} />
      <Part position={[-0.8, 0.8, 0.44]} size={[1.5, 0.6, 0.14]} color={CUSHION} />
      <Part position={[0.8, 0.8, 0.44]} size={[1.5, 0.6, 0.14]} color={CUSHION} />
      {/* Armrests */}
      <Part position={[-1.74, 0.56, 0]} size={[0.2, 0.42, 1.2]} color={LEATHER} />
      <Part position={[1.74, 0.56, 0]} size={[0.2, 0.42, 1.2]} color={LEATHER} />
      {/* Gold legs */}
      {[
        [-1.5, -0.45],
        [1.5, -0.45],
        [-1.5, 0.45],
        [1.5, 0.45],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]} userData={{ sofa: true }} onClick={handleClick}>
          <cylinderGeometry args={[0.04, 0.03, 0.2, 12]} />
          <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
};
