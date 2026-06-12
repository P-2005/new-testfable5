import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Eye, ExternalLink, ArrowLeft } from "lucide-react";
import { useGalleryStore } from "../../store/galleryStore";

export const ArtworkModal = () => {
  const artwork = useGalleryStore((s) => s.activeArtwork);
  const viewCount = useGalleryStore((s) => s.viewCount);
  const favorites = useGalleryStore((s) => s.favorites);
  const closeArtwork = useGalleryStore((s) => s.closeArtwork);
  const toggleFavorite = useGalleryStore((s) => s.toggleFavorite);

  const isFav = artwork && favorites.includes(artwork.id);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeArtwork();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeArtwork]);

  return (
    <AnimatePresence>
      {artwork && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="artwork-modal"
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-8"
          onClick={closeArtwork}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden border border-[#d4af37]/30 bg-[#141414] sm:flex-row"
          >
            {/* Artwork image */}
            <div className="relative h-52 w-full flex-shrink-0 sm:h-auto sm:w-[45%]">
              <img
                src={artwork.image}
                alt={artwork.title}
                className="h-full w-full object-cover"
                data-testid="modal-artwork-image"
              />
              <div className="absolute inset-0 border-[10px] border-[#b08d2f]/80 sm:border-[14px]" />
            </div>

            {/* Details */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-10">
              <div className="flex items-start justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]">
                  {artwork.type}
                </p>
                <button
                  data-testid="modal-close-btn"
                  onClick={closeArtwork}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-white/15 text-white/60 transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h2
                className="mt-3 font-display text-3xl text-white sm:text-4xl"
                data-testid="modal-artwork-title"
              >
                {artwork.title}
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">
                {artwork.year} — {artwork.medium}
              </p>

              <div className="my-5 h-px w-16 bg-[#d4af37]/60" />

              <p className="text-sm leading-relaxed text-white/75">{artwork.description}</p>

              {artwork.details?.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {artwork.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                      <span className="mt-1 h-1 w-1 flex-shrink-0 bg-[#d4af37]" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}

              {artwork.links?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {artwork.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`modal-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                      className="flex items-center gap-1.5 border border-[#d4af37]/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#e9d289] transition-colors hover:bg-[#d4af37]/15"
                    >
                      {l.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                <div className="flex items-center gap-5">
                  <button
                    data-testid="modal-favorite-btn"
                    onClick={() => toggleFavorite(artwork.id)}
                    className={`flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all ${
                      isFav
                        ? "border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]"
                        : "border-white/20 text-white/60 hover:border-[#d4af37]/60 hover:text-[#d4af37]"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-[#d4af37]" : ""}`} />
                    {isFav ? "Saved" : "Favorite"}
                  </button>
                  <div
                    className="flex items-center gap-1.5 text-xs text-white/40"
                    data-testid="modal-view-count"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {viewCount === null ? "—" : `${viewCount} view${viewCount === 1 ? "" : "s"}`}
                  </div>
                </div>
                <button
                  data-testid="return-to-gallery-btn"
                  onClick={closeArtwork}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-[#d4af37]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
