import { useState, useCallback } from "react";
import "@/App.css";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./components/LandingPage";
import GalleryExperience from "./components/gallery/GalleryExperience";
import { CustomCursor } from "./components/CustomCursor";

const Curtain = () => (
  <div className="pointer-events-none fixed inset-0 z-[100] flex">
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      className="h-full w-1/2 border-r border-[#d4af37]/50 bg-[#111111]"
    />
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      className="h-full w-1/2 border-l border-[#d4af37]/50 bg-[#111111]"
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center font-display text-2xl italic tracking-wide text-[#d4af37]"
    >
      The Gallery Awaits
    </motion.p>
  </div>
);

function App() {
  const [phase, setPhase] = useState("landing");
  const [curtain, setCurtain] = useState(false);

  const transitionTo = useCallback(
    (next) => {
      if (curtain) return;
      setCurtain(true);
      setTimeout(() => setPhase(next), 1150);
      setTimeout(() => setCurtain(false), 2300);
    },
    [curtain]
  );

  return (
    <div className="App">
      <CustomCursor enabled={phase === "landing"} />
      {phase === "landing" ? (
        <LandingPage onEnter={() => transitionTo("gallery")} />
      ) : (
        <GalleryExperience onExit={() => transitionTo("landing")} />
      )}
      <AnimatePresence>{curtain && <Curtain key="curtain" />}</AnimatePresence>
    </div>
  );
}

export default App;
