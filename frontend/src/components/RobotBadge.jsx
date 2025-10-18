import { useEffect, useRef } from "react";

export default function RobotBadge() {
  const rootRef = useRef(null);
  const headRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);

  // Configs
  const MAX_TILT = 12;   // deg
  const MAX_HEAD_TX = 8; // px translate toward cursor
  const MAX_EYE_TX = 5;  // px pupil offset
  const SENSITIVITY = 1; // 1 = normalize by badge size; increase for stronger

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let target = { x: 0, y: 0 };   // normalized -1..1
    let current = { x: 0, y: 0 };
    let rafId = 0;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    const onMove = (e) => {
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // vector from badge center to cursor
      const dx = (e.clientX - cx);
      const dy = (e.clientY - cy);

      // normalize by badge half-size (so about -1..1 near its edge)
      const nx = (dx / (rect.width / 2)) * SENSITIVITY;
      const ny = -(dy / (rect.height / 2)) * SENSITIVITY; // invert Y so up is +
      target.x = clamp(nx, -1, 1);
      target.y = clamp(ny, -1, 1);
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const animate = () => {
      current.x = lerp(current.x, target.x, 0.12);
      current.y = lerp(current.y, target.y, 0.12);

      const rotY = current.x * MAX_TILT;
      const rotX = current.y * MAX_TILT;
      const tx = current.x * MAX_HEAD_TX;
      const ty = -current.y * MAX_HEAD_TX * 0.6;

      if (headRef.current) {
        headRef.current.style.transform =
          `translate3d(${tx}px, ${ty}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      const eyeX = current.x * MAX_EYE_TX;
      const eyeY = -current.y * MAX_EYE_TX;

      leftPupilRef.current?.setAttribute("transform", `translate(${eyeX}, ${eyeY})`);
      rightPupilRef.current?.setAttribute("transform", `translate(${eyeX}, ${eyeY})`);

      rafId = requestAnimationFrame(animate);
    };

    // 🔁 Listen on the whole window instead of the badge
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("blur", onLeave, { passive: true });

    rafId = requestAnimationFrame(animate);

    // Touch devices: reset to center
    window.addEventListener("touchstart", onLeave, { passive: true });
    window.addEventListener("touchmove", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("touchstart", onLeave);
      window.removeEventListener("touchmove", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full
                 bg-gradient-to-br from-primary-500 to-secondary-500
                 shadow-[0_0_50px_0_rgba(99,102,241,0.35)]
                 flex items-center justify-center select-none
                 [perspective:800px] pointer-events-none"
      aria-hidden="true"
    >
      {/* Robot head (SVG) */}
      <div
        ref={headRef}
        className="will-change-transform transition-transform duration-75 ease-out"
      >
        <svg width="72" height="72" viewBox="0 0 72 72">
          <defs>
            <linearGradient id="face" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e9ecff" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Antennas */}
          <circle cx="18" cy="10" r="3" fill="#ef4444" />
          <rect x="17.2" y="12" width="1.6" height="8" rx="0.8" fill="#ef4444" />
          <circle cx="54" cy="10" r="3" fill="#ef4444" />
          <rect x="53.2" y="12" width="1.6" height="8" rx="0.8" fill="#ef4444" />

          {/* Head shell */}
          <rect x="12" y="20" width="48" height="36" rx="12" fill="url(#face)" />
          {/* Visor */}
          <rect x="18" y="30" width="36" height="16" rx="8" fill="#111827" />

          {/* Sockets */}
          <circle cx="30" cy="38" r="6" fill="#0f172a" />
          <circle cx="42" cy="38" r="6" fill="#0f172a" />

          {/* Pupils (move with cursor) */}
          <g ref={leftPupilRef}>
            <circle cx="30" cy="38" r="3" fill="#60a5fa" />
            <circle cx="30" cy="38" r="1.2" fill="#e0f2fe" />
          </g>
          <g ref={rightPupilRef}>
            <circle cx="42" cy="38" r="3" fill="#60a5fa" />
            <circle cx="42" cy="38" r="1.2" fill="#e0f2fe" />
          </g>

          {/* Mouth */}
          <rect x="32" y="50" width="8" height="4" rx="2" fill="#111827" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
