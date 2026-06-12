import { useGalleryStore } from "../../store/galleryStore";

const GOLD = "#b08d2f";
const LEATHER = "#2b2724";
const CUSHION = "#37322d";

const Part = ({ position, size, color, metalness = 0.05, roughness = 0.8, onClick }) => (
  <mesh position={position} userData={{ sofa: true }} onClick={onClick}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
  </mesh>
);

/**
 * Luxury leather sofa in the centre of the hall, facing the featured wall.
 * Click / tap to sit; while seated the visitor can look around 360°.
 */
export const Sofa = () => {
  const handleClick = (e) => {
    e.stopPropagation();
    const s = useGalleryStore.getState();
    if (s.paused || s.activeArtwork || s.seated) return;
    // Locked mode sits via the centre-reticle click in Player
    if (!s.isMobile && s.plActive) return;
    if (typeof e.delta === "number" && e.delta > 8) return;
    s.setSeated(true);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Base frame */}
      <Part position={[0, 0.3, 0]} size={[3.3, 0.16, 1.2]} color={LEATHER} onClick={handleClick} />
      {/* Gold trim under base */}
      <Part position={[0, 0.21, 0]} size={[3.34, 0.03, 1.24]} color={GOLD} metalness={0.85} roughness={0.3} onClick={handleClick} />
      {/* Seat cushions */}
      <Part position={[-0.8, 0.46, 0]} size={[1.52, 0.18, 1.1]} color={CUSHION} onClick={handleClick} />
      <Part position={[0.8, 0.46, 0]} size={[1.52, 0.18, 1.1]} color={CUSHION} onClick={handleClick} />
      {/* Backrest (sofa faces the featured wall at -z) */}
      <Part position={[0, 0.78, 0.5]} size={[3.3, 0.75, 0.2]} color={LEATHER} onClick={handleClick} />
      <Part position={[-0.8, 0.8, 0.44]} size={[1.5, 0.6, 0.14]} color={CUSHION} onClick={handleClick} />
      <Part position={[0.8, 0.8, 0.44]} size={[1.5, 0.6, 0.14]} color={CUSHION} onClick={handleClick} />
      {/* Armrests */}
      <Part position={[-1.74, 0.56, 0]} size={[0.2, 0.42, 1.2]} color={LEATHER} onClick={handleClick} />
      <Part position={[1.74, 0.56, 0]} size={[0.2, 0.42, 1.2]} color={LEATHER} onClick={handleClick} />
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
