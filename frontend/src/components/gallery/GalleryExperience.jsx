import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Room } from "./Room";
import { Exhibit } from "./Exhibit";
import { Sofa } from "./Sofa";
import { NPCs } from "./NPCs";
import { Player } from "./Player";
import { HUD } from "./HUD";
import { ArtworkModal } from "./ArtworkModal";
import { NpcDialog } from "./NpcDialog";
import { MobileControls } from "./MobileControls";
import { ARTWORKS } from "../../data/artworks";
import { useGalleryStore } from "../../store/galleryStore";

export default function GalleryExperience({ onExit }) {
  const isMobile = useGalleryStore((s) => s.isMobile);
  const plActive = useGalleryStore((s) => s.plActive);
  const simLock = useGalleryStore((s) => s.simLock);
  const loadFavorites = useGalleryStore((s) => s.loadFavorites);
  const resetSession = useGalleryStore((s) => s.resetSession);

  useEffect(() => {
    resetSession();
    loadFavorites();
  }, [loadFavorites, resetSession]);

  // Hide the OS cursor whenever a lock mode is engaged
  useEffect(() => {
    document.body.classList.toggle("cursor-locked", plActive || simLock);
    return () => document.body.classList.remove("cursor-locked");
  }, [plActive, simLock]);

  return (
    <div className="fixed inset-0 bg-[#101010]" data-testid="gallery-experience">
      <Canvas
        camera={{ fov: 70, position: [0, 1.6, 7.5], near: 0.1, far: 70 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#15140f"]} />
        <fog attach="fog" args={["#d9d5cb", 24, 60]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#fffaf0", "#b8b2a4", 0.55]} />
        <Suspense fallback={null}>
          <Room />
          <Sofa
            position={[0, 0, -0.55]}
            rotationY={0}
            seat={{ x: 0, y: 1.18, z: -0.5 }}
            stand={{ x: 0, z: -2.4 }}
          />
          <Sofa
            position={[0, 0, 0.55]}
            rotationY={Math.PI}
            seat={{ x: 0, y: 1.18, z: 0.5 }}
            stand={{ x: 0, z: 2.4 }}
          />
          <NPCs />
          {ARTWORKS.map((a) => (
            <Exhibit key={a.id} artwork={a} />
          ))}
        </Suspense>
        <Player />
      </Canvas>
      <HUD onExit={onExit} />
      <ArtworkModal />
      <NpcDialog />
      {isMobile && <MobileControls />}
    </div>
  );
}
