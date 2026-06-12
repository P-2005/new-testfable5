import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { useGalleryStore } from "../../store/galleryStore";
import { NPCS } from "../../data/npcs";

export const NpcDialog = () => {
  const activeNpc = useGalleryStore((s) => s.activeNpc);
  const closeNpc = useGalleryStore((s) => s.closeNpc);
  const npc = NPCS.find((n) => n.id === activeNpc);
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    setAnswer(null);
  }, [activeNpc]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeNpc();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeNpc]);

  return (
    <AnimatePresence>
      {npc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          data-testid="npc-dialog"
          className="absolute inset-0 z-[60] flex items-end justify-center bg-black/35 p-4 pb-8 sm:p-10"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl border border-[#d4af37]/40 bg-[#121212]/95 backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-[#d4af37]/60 text-[#d4af37]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p
                    className="font-display text-xl text-white"
                    data-testid="npc-dialog-name"
                  >
                    {npc.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]">
                    {npc.role}
                  </p>
                </div>
              </div>
              <button
                data-testid="npc-dialog-close"
                onClick={closeNpc}
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Speech */}
            <div className="px-6 py-5">
              <motion.p
                key={answer || "greeting"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-[60px] font-display text-lg italic leading-relaxed text-white/90"
                data-testid="npc-dialog-text"
              >
                “{answer || npc.dialogue.greeting}”
              </motion.p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2 border-t border-white/10 p-4">
              {npc.dialogue.options.map((opt, i) => (
                <button
                  key={i}
                  data-testid={`npc-option-${i}`}
                  onClick={() => setAnswer(opt.a)}
                  className={`group flex items-center gap-3 border px-4 py-2.5 text-left text-sm transition-all ${
                    answer === opt.a
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-[#e9d289]"
                      : "border-white/10 text-white/70 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 hover:text-[#e9d289]"
                  }`}
                >
                  <span className="text-[#d4af37]">❝</span>
                  {opt.q}
                </button>
              ))}
              <button
                data-testid="npc-leave-btn"
                onClick={closeNpc}
                className="mt-1 self-end px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#d4af37]"
              >
                Leave Conversation — ESC
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
