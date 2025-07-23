import { useEffect, useRef } from "preact/hooks";

const CONFIG = {
  baseRadiusPx: 110, // 220 px diameter → 110 px radius
  springStiffness: 0.75, // how fast it chases the pointer
  springDamping: 0.9, // velocity decay (0 = elastic, 1 = critically damped)
  maxStretchFactor: 1.35, // 35 % “squash & stretch” cap
};

export default function BlobMask() {
  const circleRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    if (!circleRef.current) return;

    const position = { x: innerWidth / 2, y: innerHeight / 2 };
    const velocity = { x: 0, y: 0 };
    const target = { x: position.x, y: position.y };

    function drawBlob(stretchFactor: number) {
      circleRef.current!.setAttribute("cx", position.x.toFixed(1));
      circleRef.current!.setAttribute("cy", position.y.toFixed(1));
      circleRef.current!.setAttribute(
        "r",
        (CONFIG.baseRadiusPx * stretchFactor).toFixed(1),
      );
    }

    const animate: FrameRequestCallback = () => {
      // spring integration
      velocity.x += (target.x - position.x) * CONFIG.springStiffness;
      velocity.y += (target.y - position.y) * CONFIG.springStiffness;

      velocity.x *= 1 - CONFIG.springDamping;
      velocity.y *= 1 - CONFIG.springDamping;

      position.x += velocity.x;
      position.y += velocity.y;

      // velocity > stretch mapping
      const speed = Math.hypot(velocity.x, velocity.y);
      const stretch = Math.min(CONFIG.maxStretchFactor, 1 + speed * 0.02);

      drawBlob(stretch);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    function updateTarget(event: PointerEvent) {
      target.x = event.clientX;
      target.y = event.clientY;
    }
    window.addEventListener("pointermove", updateTarget, { passive: true });

    return () => window.removeEventListener("pointermove", updateTarget);
  }, []);

  return (
    <svg
      viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
      style="position:fixed; inset:0; width:0; height:0"
      aria-hidden="true"
    >
      <defs>
        <mask id="blob-mask" mask-type="luminance" maskUnits="userSpaceOnUse">
          <circle
            ref={circleRef}
            fill="white"
            r={CONFIG.baseRadiusPx}
            cx={window.innerWidth / 2}
            cy={window.innerHeight / 2}
          />
        </mask>
      </defs>
    </svg>
  );
}
