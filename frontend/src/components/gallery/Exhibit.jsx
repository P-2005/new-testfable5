import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useTexture, Text } from "@react-three/drei";
import { useGalleryStore } from "../../store/galleryStore";

const GOLD = "#b08d2f";

export const Exhibit = ({ artwork }) => {
  const { position, rotationY = 0, size = [3, 2] } = artwork;
  const [w, h] = size;
  const texture = useTexture(artwork.image);
  texture.colorSpace = THREE.SRGBColorSpace;

  const spotRef = useRef();
  const targetRef = useRef();
  const openArtwork = useGalleryStore((s) => s.openArtwork);
  const hovered = useGalleryStore((s) => s.hoveredId === artwork.id);

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    const s = useGalleryStore.getState();
    if (s.paused || s.activeArtwork) return;
    // Locked mode is handled by the central crosshair click in Player
    if (!s.isMobile && s.plActive) return;
    // Ignore drags (R3F provides cumulative pointer movement in e.delta)
    if (typeof e.delta === "number" && e.delta > 8) return;
    openArtwork(artwork);
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Outer gold frame */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[w + 0.36, h + 0.36, 0.1]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.88}
          roughness={0.28}
          emissive={hovered ? "#d4af37" : "#000000"}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>
      {/* White mat */}
      <mesh position={[0, 0, 0.105]}>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.02]} />
        <meshStandardMaterial color="#faf8f3" roughness={0.95} />
      </mesh>
      {/* Artwork canvas */}
      <mesh
        ref={targetRef}
        position={[0, 0, 0.12]}
        userData={{ artworkId: artwork.id }}
        onClick={handleClick}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
      </mesh>

      {/* Placard */}
      <group position={[w / 2 + 0.75, -h / 2 + 0.4, 0.05]}>
        <mesh>
          <boxGeometry args={[1.15, 0.6, 0.03]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
        <Text
          position={[0, 0.15, 0.025]}
          fontSize={0.082}
          color="#1a1a1a"
          anchorX="center"
          maxWidth={1.05}
          textAlign="center"
        >
          {artwork.title}
        </Text>
        <Text
          position={[0, 0.0, 0.025]}
          fontSize={0.05}
          color="#8a7a45"
          anchorX="center"
          maxWidth={1.05}
          textAlign="center"
        >
          {`${artwork.year}`}
        </Text>
        <Text
          position={[0, -0.13, 0.025]}
          fontSize={0.04}
          color="#9a9a9a"
          anchorX="center"
          maxWidth={1.05}
          textAlign="center"
        >
          {artwork.type.toUpperCase()}
        </Text>
      </group>

      {/* Warm spotlight on the artwork */}
      <spotLight
        ref={spotRef}
        position={[0, h / 2 + 2.2, 2.6]}
        angle={0.55}
        penumbra={0.75}
        intensity={45}
        distance={10}
        decay={1.7}
        color="#ffe7bd"
      />
    </group>
  );
};
