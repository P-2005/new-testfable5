import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Room } from "./Room";
import { Exhibit } from "./Exhibit";
import { Player } from "./Player";
import { HUD } from "./HUD";
import { ArtworkModal } from "./ArtworkModal";
import { MobileControls } from "./MobileControls";
import { ARTWORKS } from "../../data/artworks";
import { useGalleryStore } from "../../store/galleryStore";

export default function GalleryExperience({ onExit }) {
  const isMobile = useGalleryStore((s) => s.isMobile);
  const loadFavorites = useGalleryStore((s) => s.loadFavorites);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

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
          {ARTWORKS.map((a) => (
            <Exhibit key={a.id} artwork={a} />
          ))}
        </Suspense>
        <Player />
      </Canvas>
      <HUD onExit={onExit} />
      <ArtworkModal />
      {isMobile && <MobileControls />}
    </div>
  );
}
