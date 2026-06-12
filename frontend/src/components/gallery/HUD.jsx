import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, DoorOpen, Eye, Pause, Play, Lock } from "lucide-react";
import { useGalleryStore } from "../../store/galleryStore";
import { ARTWORKS } from "../../data/artworks";

const Reticle = ({ active, label, sublabel }) => (
  <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
    <div className="flex flex-col items-center">
      {/* Minimal centre circle (horror-game style) */}
      <div
        data-testid="gallery-reticle"
        className={`rounded-full border transition-all duration-200 ${
          active
            ? "h-6 w-6 border-[#d4af37] shadow-[0_0_16px_rgba(212,175,55,0.65)]"
            : "h-3.5 w-3.5 border-white/60"
        }`}
      />
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 text-center"
            data-testid="inspect-prompt"
          >
            <p className="font-display text-lg italic text-white drop-shadow-lg">{label}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#d4af37]">
              {sublabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export const HUD = ({ onExit }) => {
  const isMobile = useGalleryStore((s) => s.isMobile);
  const paused = useGalleryStore((s) => s.paused);
  const plActive = useGalleryStore((s) => s.plActive);
  const seated = useGalleryStore((s) => s.seated);
  const hoveredSofa = useGalleryStore((s) => s.hoveredSofa);
  const hoveredId = useGalleryStore((s) => s.hoveredId);
  const activeArtwork = useGalleryStore((s) => s.activeArtwork);
  const favorites = useGalleryStore((s) => s.favorites);
  const favOpen = useGalleryStore((s) => s.favOpen);
  const controls = useGalleryStore((s) => s.controls);
  const setFavOpen = useGalleryStore((s) => s.setFavOpen);
  const setPaused = useGalleryStore((s) => s.setPaused);
  const openArtwork = useGalleryStore((s) => s.openArtwork);
  const toggleFavorite = useGalleryStore((s) => s.toggleFavorite);

  const hoveredArt = ARTWORKS.find((a) => a.id === hoveredId);
  const reticleActive = !!hoveredArt || hoveredSofa;
  const reticleLabel = hoveredArt ? hoveredArt.title : "Take a Seat";
  const reticleSub = hoveredArt ? "Click to inspect" : "Click to sit";

  return (
    <>
      {/* Centre reticle */}
      {!paused && !activeArtwork && (
        <Reticle active={reticleActive} label={reticleLabel} sublabel={reticleSub} />
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-[45] flex items-start justify-between p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#d4af37]/70 bg-black/30 font-display text-sm text-[#d4af37] backdrop-blur-sm">
            PM
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-white/70 drop-shadow sm:block">
            Parv Malav — Main Hall
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          {!isMobile && !plActive && (
            <button
              data-testid="lock-cursor-btn"
              onClick={() => controls && controls.lock()}
              className="flex h-10 items-center gap-2 border border-white/25 bg-black/40 px-4 text-[10px] uppercase tracking-[0.25em] text-white/75 backdrop-blur-sm transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37]"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock Cursor</span>
            </button>
          )}
          <button
            data-testid="favorites-toggle-btn"
            onClick={() => setFavOpen(!favOpen)}
            className="relative flex h-10 items-center gap-2 border border-[#d4af37]/50 bg-black/40 px-4 text-[10px] uppercase tracking-[0.25em] text-[#e9d289] backdrop-blur-sm transition-colors hover:bg-[#d4af37]/20"
          >
            <Heart className={`h-3.5 w-3.5 ${favorites.length ? "fill-[#d4af37] text-[#d4af37]" : ""}`} />
            <span className="hidden sm:inline">Favorites</span>
            <span data-testid="favorites-count">{favorites.length}</span>
          </button>
          <button
            data-testid="pause-btn"
            onClick={() => setPaused(true)}
            className="flex h-10 w-10 items-center justify-center border border-white/25 bg-black/40 text-white/75 backdrop-blur-sm transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37]"
          >
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom-left hint bar (subtle, never blocks the view) */}
      {!paused && !activeArtwork && !isMobile && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-30 border border-white/10 bg-black/35 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/55 backdrop-blur-sm">
          {seated ? (
            <p>Seated — Look Around 360° · WASD — Stand Up</p>
          ) : plActive ? (
            <p>WASD — Move · Mouse — Look · Shift — Run · ESC — Pause</p>
          ) : (
            <p>WASD — Move · Drag — Look · Click — Lock Cursor · P — Pause</p>
          )}
        </div>
      )}

      {/* Pause menu */}
      <AnimatePresence>
        {paused && !activeArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-testid="pause-menu"
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">
              Gallery
            </p>
            <h2 className="mt-3 font-display text-5xl text-white">Paused</h2>

            <div className="mt-10 grid grid-cols-2 gap-x-14 gap-y-4 text-xs text-white/60 sm:grid-cols-3">
              <div className="text-center">
                <p className="mb-1 font-semibold text-white">W A S D</p>
                <p className="text-[10px] uppercase tracking-widest">Walk</p>
              </div>
              <div className="text-center">
                <p className="mb-1 font-semibold text-white">Mouse / Drag</p>
                <p className="text-[10px] uppercase tracking-widest">Look</p>
              </div>
              <div className="text-center">
                <p className="mb-1 font-semibold text-white">Click</p>
                <p className="text-[10px] uppercase tracking-widest">Inspect Art</p>
              </div>
              <div className="text-center">
                <p className="mb-1 font-semibold text-white">Shift / Space</p>
                <p className="text-[10px] uppercase tracking-widest">Run / Jump</p>
              </div>
              <div className="text-center">
                <p className="mb-1 font-semibold text-white">L</p>
                <p className="text-[10px] uppercase tracking-widest">Toggle Mouselock</p>
              </div>
              <div className="text-center">
                <p className="mb-1 font-semibold text-white">P / ESC</p>
                <p className="text-[10px] uppercase tracking-widest">Pause</p>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
              <button
                data-testid="resume-btn"
                onClick={() => setPaused(false)}
                className="flex items-center gap-3 border border-[#d4af37]/70 bg-[#d4af37]/15 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-[#e9d289] transition-colors hover:bg-[#d4af37]/30 hover:text-white"
              >
                <Play className="h-3.5 w-3.5" />
                Resume
              </button>
              <button
                data-testid="exit-gallery-btn"
                onClick={onExit}
                className="flex items-center gap-2 border border-white/20 px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] text-white/60 transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37]"
              >
                <DoorOpen className="h-3.5 w-3.5" />
                Leave Gallery
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites drawer */}
      <AnimatePresence>
        {favOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            data-testid="favorites-drawer"
            className="absolute top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-[#d4af37]/30 bg-[#121212]/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]">
                  Your Collection
                </p>
                <h3 className="mt-1 font-display text-2xl text-white">Favorites</h3>
              </div>
              <button
                data-testid="favorites-close-btn"
                onClick={() => setFavOpen(false)}
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {favorites.length === 0 ? (
                <p className="mt-10 text-center text-sm text-white/40">
                  No pieces saved yet.
                  <br />
                  <span className="text-xs">Inspect an artwork and tap the heart.</span>
                </p>
              ) : (
                <div className="space-y-4">
                  {ARTWORKS.filter((a) => favorites.includes(a.id)).map((a) => (
                    <div
                      key={a.id}
                      data-testid={`favorite-item-${a.id}`}
                      className="group flex gap-4 border border-white/10 bg-white/5 p-3 transition-colors hover:border-[#d4af37]/40"
                    >
                      <img
                        src={a.image}
                        alt={a.title}
                        className="h-16 w-16 flex-shrink-0 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base text-white">{a.title}</p>
                        <p className="truncate text-[10px] uppercase tracking-widest text-white/40">
                          {a.type}
                        </p>
                        <div className="mt-2 flex gap-3">
                          <button
                            data-testid={`favorite-view-${a.id}`}
                            onClick={() => openArtwork(a)}
                            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#d4af37] hover:underline"
                          >
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button
                            data-testid={`favorite-remove-${a.id}`}
                            onClick={() => toggleFavorite(a.id)}
                            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
