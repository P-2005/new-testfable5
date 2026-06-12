import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CustomCursor = ({ enabled = true }) => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.6 });
  const trailX = useSpring(x, { stiffness: 90, damping: 18, mass: 1 });
  const trailY = useSpring(y, { stiffness: 90, damping: 18, mass: 1 });
  const [hovering, setHovering] = useState(false);
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  useEffect(() => {
    if (!enabled || isTouch) return;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      const interactive = e.target.closest('button, a, [data-cursor="hover"]');
      setHovering(!!interactive);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [enabled, isTouch, x, y]);

  if (!enabled || isTouch) return null;

  return (
    <>
      {/* Trailing glow particle */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[200] h-2 w-2 rounded-full"
        style={{
          x: trailX,
          y: trailY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.65), transparent 70%)",
          filter: "blur(1px)",
        }}
      />
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[201] rounded-full border"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          borderColor: hovering ? "rgba(212,175,55,0.9)" : "rgba(255,255,255,0.4)",
          boxShadow: hovering
            ? "0 0 18px rgba(212,175,55,0.35)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
      {/* Center dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[202] rounded-full"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 6 : 5,
          height: hovering ? 6 : 5,
          backgroundColor: hovering ? "#d4af37" : "#ffffff",
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
};
