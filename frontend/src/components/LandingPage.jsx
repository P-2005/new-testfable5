import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MoveRight } from "lucide-react";

const TITLE = "PARV MALAV";
const SUBTITLE = "Experience a Journey Through Creative Vision".split(" ");

const Particles = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e) => {
      mouse.current = { x: e.clientX / canvas.width, y: e.clientY / canvas.height };
    };
    window.addEventListener("mousemove", onMouse);

    particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.14,
      gold: Math.random() > 0.6,
      depth: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const px = (mouse.current.x - 0.5) * 30;
      const py = (mouse.current.y - 0.5) * 30;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.012;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        const alpha = (0.25 + Math.sin(p.pulse) * 0.15) * p.depth;
        ctx.beginPath();
        ctx.arc(p.x + px * p.depth, p.y + py * p.depth, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212, 175, 55, ${alpha})`
          : `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1]" />;
};

export default function LandingPage({ onEnter }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <div
      className="landing-root relative h-screen w-full overflow-hidden bg-[#141414] text-white"
      data-testid="landing-page"
    >
      {/* Ambient drifting orbs */}
      <div className="orb orb-gold" />
      <div className="orb orb-white" />
      <div className="grain-overlay" />
      <Particles />

      {/* Monogram */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.9 }}
        className="absolute top-8 left-8 z-10 flex items-center gap-3 sm:top-10 sm:left-12"
      >
        <div className="flex h-10 w-10 items-center justify-center border border-[#d4af37]/60 font-display text-lg text-[#d4af37]">
          PM
        </div>
        <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">
          Private Collection
        </span>
      </motion.div>

      {/* Gallery hours — decorative */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute top-10 right-8 z-10 hidden text-right text-[10px] uppercase tracking-[0.3em] text-white/40 sm:block sm:right-12"
      >
        <p>Open 24 Hours</p>
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ delay: 0.5, duration: 1.4, ease: "easeOut" }}
          className="mb-6 text-[10px] uppercase text-[#d4af37] sm:text-xs"
        >
          Welcome to the gallery of
        </motion.p>

        <h1
          className="font-display text-5xl font-medium leading-none tracking-tight sm:text-7xl lg:text-8xl"
          data-testid="landing-title"
        >
          {TITLE.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 40, rotateX: 60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.7 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.6, duration: 1, ease: "easeInOut" }}
          className="my-7 h-px w-40 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent sm:w-64"
        />

        <p className="mb-3 max-w-xl font-display text-lg italic text-white/80 md:text-lg">
          {SUBTITLE.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + i * 0.1, duration: 0.6 }}
            >
              {word}
              {"\u00A0"}
            </motion.span>
          ))}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1 }}
          className="mb-12 max-w-md text-xs leading-relaxed text-white/40 sm:text-sm"
        >
          Step into a curated collection of software & cloud engineering.
          First-person exploration. No boundaries. Pure creativity.
        </motion.p>

        <motion.button
          data-testid="enter-gallery-cta"
          data-cursor="hover"
          onClick={onEnter}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.04, 1],
          }}
          transition={{
            opacity: { delay: 2.9, duration: 0.8 },
            y: { delay: 2.9, duration: 0.8 },
            scale: { delay: 3.7, duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          }}
          whileHover={{
            scale: 1.07,
            boxShadow: "0 0 45px rgba(212,175,55,0.45), 0 14px 40px rgba(0,0,0,0.5)",
          }}
          whileTap={{ scale: 0.97 }}
          className="group relative flex items-center gap-4 border border-[#d4af37]/70 bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/20 to-[#d4af37]/10 px-10 py-5 text-sm uppercase tracking-[0.3em] text-[#e9d289] transition-colors duration-300 hover:bg-[#d4af37]/25 hover:text-white sm:px-14"
        >
          <span className="cta-shimmer pointer-events-none absolute inset-0" />
          Enter the Gallery
          <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </motion.button>
      </div>

      {/* Footer links */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.3, duration: 0.9 }}
        className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-8"
      >
        <a
          href="https://github.com/P-2005"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="landing-github-link"
          data-cursor="hover"
          className="text-white/40 transition-colors duration-300 hover:text-[#d4af37]"
        >
          <Github className="h-4 w-4" />
        </a>
        <a
          href="https://linkedin.com/in/parv-malav-69927940b"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="landing-linkedin-link"
          data-cursor="hover"
          className="text-white/40 transition-colors duration-300 hover:text-[#d4af37]"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href="mailto:parvmalav666@gmail.com"
          data-testid="landing-email-link"
          data-cursor="hover"
          className="text-white/40 transition-colors duration-300 hover:text-[#d4af37]"
        >
          <Mail className="h-4 w-4" />
        </a>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/25">
          Software Developer & Cloud Engineer — Kota, India
        </span>
      </motion.div>
    </div>
  );
}
