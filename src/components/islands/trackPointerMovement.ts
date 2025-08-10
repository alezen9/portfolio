const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const root = document.documentElement;

type Options = {
  springStiffness?: number; // higher = snappier
  springDamping?: number; // 0..1, higher = more damped (velocity scaled by 1 - damping)
};

const trackPointerMovement = (opts: Options = {}) => {
  if (!matchMedia("(pointer:fine)").matches) return;

  const stiffness = opts.springStiffness ?? 0.75;
  const damping = clamp(opts.springDamping ?? 0.9, 0.05, 0.95);

  const pos = { x: 50, y: 50 };
  const vel = { x: 0, y: 0 };
  const target = { x: 50, y: 50 };

  let rafId = 0;
  let last = performance.now();
  let running = true;

  const raf = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); // clamp to 50ms
    last = now;

    // spring integration
    vel.x += (target.x - pos.x) * stiffness;
    vel.y += (target.y - pos.y) * stiffness;

    vel.x *= 1 - damping;
    vel.y *= 1 - damping;

    pos.x += vel.x * (dt * 60); // scale by dt ~ normalize to 60fps
    pos.y += vel.y * (dt * 60);

    const px = pos.x.toFixed(2);
    const py = pos.y.toFixed(2);
    root.style.setProperty("--pointer-x", px);
    root.style.setProperty("--pointer-y", py);

    // Settle stop
    const nearTarget = Math.hypot(target.x - pos.x, target.y - pos.y) < 0.05;
    const lowVel = Math.hypot(vel.x, vel.y) < 0.02;
    if (nearTarget && lowVel) {
      running = false;
      return;
    }

    rafId = requestAnimationFrame(raf);
  };

  const onMove = (e: PointerEvent) => {
    target.x = (e.clientX / innerWidth) * 100;
    target.y = (e.clientY / innerHeight) * 100;
    if (!running) {
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(raf);
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else {
      if (!running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(raf);
      }
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  window.addEventListener("pointermove", onMove, { passive: true });
  rafId = requestAnimationFrame(raf);

  return () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pointermove", onMove);
    cancelAnimationFrame(rafId);
    running = false;
  };
};

export default trackPointerMovement;
