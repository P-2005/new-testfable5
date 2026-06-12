import { useState, useCallback } from "react";
import "@/App.css";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./components/LandingPage";
import GalleryExperience from "./components/gallery/GalleryExperience";
import { CustomCursor } from "./components/CustomCursor";

const Transition = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } }}
    transition={{ duration: 0.65, ease: "easeInOut" }}
    className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0c0c0c]"
  >
    <motion.p
      initial={{ opacity: 0, letterSpacing: "0.2em" }}
      animate={{ opacity: 1, letterSpacing: "0.55em" }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
      className="text-[10px] uppercase text-[#d4af37]"
    >
      Now Entering
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 font-display text-4xl italic text-white sm:text-5xl"
    >
      The Private Collection
    </motion.h2>
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      exit={{ scaleX: 0, transition: { duration: 0.4 } }}
      transition={{ delay: 0.7, duration: 0.9, ease: "easeInOut" }}
      className="mt-7 h-px w-56 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"
    />
  </motion.div>
);

function App() {
  const [phase, setPhase] = useState("landing");
  const [curtain, setCurtain] = useState(false);

  const transitionTo = useCallback(
    (next) => {
      if (curtain) return;
      setCurtain(true);
      setTimeout(() => setPhase(next), 900);
      setTimeout(() => setCurtain(false), 1900);
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
      <AnimatePresence>{curtain && <Transition key="transition" />}</AnimatePresence>
    </div>
  );
}

export default App;
