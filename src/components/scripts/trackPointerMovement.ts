const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const MAX_STRETCH_FACTOR = 2.35;
const ID_ATTRIBUTE_NAME = "pointer-tracker-id";

const computeBoundingBoxPercentages = (bb: DOMRectReadOnly) => {
  const leftPercentage = (bb.left / innerWidth) * 100;
  const rightPercentage = (bb.right / innerWidth) * 100;
  const topPercentage = (bb.top / innerHeight) * 100;
  const bottomPercentage = (bb.bottom / innerHeight) * 100;

  const widthPercentage = bb.width / innerWidth;
  const heightPercentage = bb.height / innerHeight;

  return {
    leftPercentage,
    rightPercentage,
    topPercentage,
    bottomPercentage,
    widthPercentage,
    heightPercentage,
  };
};

const createObserver = (targets?: string[]) => {
  if (!targets?.length) return null;

  const elements = document.querySelectorAll<HTMLElement>(targets.join(", "));
  const visibleObservables = new Set<string>();
  const observablesMap = new Map<string, HTMLElement>();

  const onIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const pointerTrackerId = entry.target.getAttribute(ID_ATTRIBUTE_NAME)!;
      if (entry.isIntersecting) visibleObservables.add(pointerTrackerId);
      else visibleObservables.delete(pointerTrackerId);
    }
  };
  const observer = new IntersectionObserver(onIntersect);

  const observe = () => {
    elements.forEach((element, idx) => {
      const pointerTrackerId = `pointer-tracker-${idx}`;
      element.setAttribute(ID_ATTRIBUTE_NAME, pointerTrackerId);
      observablesMap.set(pointerTrackerId, element);
      observer.observe(element);
    });
  };

  const disconnect = () => observer.disconnect();

  const updateElements = (pos: { x: number; y: number }) => {
    if (!visibleObservables.size) return;
    visibleObservables.forEach((pointerTrackerId) => {
      const el = observablesMap.get(pointerTrackerId)!;
      const rect = el.getBoundingClientRect();
      const bb = computeBoundingBoxPercentages(rect);

      let lpx = 50;
      let lpy = 50;
      const isHoverX =
        pos.x >= bb.leftPercentage && pos.x <= bb.rightPercentage;
      const isHoverY =
        pos.y >= bb.topPercentage && pos.y <= bb.bottomPercentage;
      if (isHoverX && isHoverY) {
        const dx = pos.x - bb.leftPercentage;
        const dy = pos.y - bb.topPercentage;
        lpx = dx / bb.widthPercentage;
        lpy = dy / bb.heightPercentage;
      }

      el.style.setProperty("--local-pointer-x", lpx.toFixed(2));
      el.style.setProperty("--local-pointer-y", lpy.toFixed(2));
    });
  };

  return {
    observe,
    disconnect,
    updateElements,
  };
};

type Options = {
  springStiffness?: number; // higher = snappier
  springDamping?: number; // 0..1, higher = more damped (velocity scaled by 1 - damping)
  enableStretching?: boolean;
  targets?: string[];
  rootSelector?: string;
};

const trackPointerMovement = (opts: Options = {}) => {
  if (!matchMedia("(pointer:fine)").matches) return;
  const root = opts.rootSelector
    ? document.querySelector<HTMLElement>(opts.rootSelector)
    : document.documentElement;

  console.log(opts);
  if (!root) return;

  const observer = createObserver(opts.targets);
  observer?.observe();

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

    observer?.updateElements(pos);

    if (opts.enableStretching) {
      const speed = Math.hypot(vel.x, vel.y);
      const stretch = Math.min(MAX_STRETCH_FACTOR, 1 + speed * 0.075).toFixed(
        2,
      );
      root.style.setProperty("--stretch", `${stretch}`);
    }

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
    observer?.disconnect();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pointermove", onMove);
    cancelAnimationFrame(rafId);
    running = false;
  };
};

export default trackPointerMovement;
