import { useEffect, useRef } from "preact/hooks";

const CONFIG = {
  springStiffness: 0.75,
  springDamping: 0.9, // 0..1 (higher = more damping)
  maxStretchFactor: 1.35,
};

type Props = {
  radius?: number;
  gradient?: number; // 1 = full soft gradient, 0 = sharp edge
};

export default function BlobMask({ radius = 150, gradient = 0 }: Props) {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const innerPct = (1 - gradient) * 100;

  useEffect(() => {
    if (!circleRef.current || !svgRef.current) return;

    function getSize() {
      return { w: window.innerWidth, h: window.innerHeight };
    }
    const { w, h } = getSize();

    const pos = { x: w / 2, y: h / 2 };
    const vel = { x: 0, y: 0 };
    const target = { x: pos.x, y: pos.y };

    svgRef.current.setAttribute("viewBox", `0 0 ${w} ${h}`);
    circleRef.current.setAttribute("cx", pos.x.toFixed(2));
    circleRef.current.setAttribute("cy", pos.y.toFixed(2));
    circleRef.current.setAttribute("r", radius.toFixed(2));

    let rafId = 0;
    let last = performance.now();
    let running = true;

    const draw = (stretch: number) => {
      circleRef.current!.setAttribute("cx", pos.x.toFixed(2));
      circleRef.current!.setAttribute("cy", pos.y.toFixed(2));
      circleRef.current!.setAttribute("r", (radius * stretch).toFixed(2));
    };

    const animate: FrameRequestCallback = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); // clamp 50ms
      last = now;

      // spring
      vel.x += (target.x - pos.x) * CONFIG.springStiffness;
      vel.y += (target.y - pos.y) * CONFIG.springStiffness;
      vel.x *= 1 - CONFIG.springDamping;
      vel.y *= 1 - CONFIG.springDamping;
      // normalize for 60fps
      pos.x += vel.x * (dt * 60);
      pos.y += vel.y * (dt * 60);

      const speed = Math.hypot(vel.x, vel.y);
      const stretch = Math.min(CONFIG.maxStretchFactor, 1 + speed * 0.01);

      draw(stretch);
      rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(animate);
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
          rafId = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener("pointermove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafId);
      running = false;
    };
  }, [radius]);

  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vw} ${vh}`}
      style="position:fixed; inset:0; width:0; height:0"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="myGradient">
          <stop offset={`${innerPct}%`} stop-color="white" />
          <stop offset="95%" stop-color="black" />
        </radialGradient>

        <mask id="blob-mask" maskUnits="userSpaceOnUse">
          <circle
            ref={circleRef}
            cx={vw / 2}
            cy={vh / 2}
            r={radius}
            fill="url(#myGradient)"
          />
        </mask>
      </defs>
    </svg>
  );
}
