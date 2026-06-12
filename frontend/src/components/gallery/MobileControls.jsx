import { useRef, useState } from "react";
import { mobileInput } from "../../store/galleryStore";

const RADIUS = 44;

export const MobileControls = () => {
  const baseRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activeId = useRef(null);

  const update = (clientX, clientY) => {
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    mobileInput.move.x = dx / RADIUS;
    mobileInput.move.y = dy / RADIUS;
  };

  const reset = () => {
    activeId.current = null;
    setKnob({ x: 0, y: 0 });
    mobileInput.move.x = 0;
    mobileInput.move.y = 0;
  };

  return (
    <div
      ref={baseRef}
      data-testid="mobile-joystick"
      className="absolute bottom-8 left-8 z-40 h-28 w-28 touch-none rounded-full border border-[#d4af37]/40 bg-black/30 backdrop-blur-sm"
      onTouchStart={(e) => {
        activeId.current = e.changedTouches[0].identifier;
        update(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }}
      onTouchMove={(e) => {
        const t = Array.from(e.changedTouches).find(
          (touch) => touch.identifier === activeId.current
        );
        if (t) update(t.clientX, t.clientY);
      }}
      onTouchEnd={reset}
      onTouchCancel={reset}
    >
      <div
        className="absolute top-1/2 left-1/2 h-12 w-12 rounded-full border border-[#d4af37]/70 bg-[#d4af37]/30"
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
};
