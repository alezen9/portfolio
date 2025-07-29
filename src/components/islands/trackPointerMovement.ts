const root = document.documentElement;

let isLocked = false;

const updatePointerPosition = (x: number, y: number) => {
  if (isLocked) return;
  requestAnimationFrame(() => {
    root.style.setProperty("--pointer-x", `${x}`);
    root.style.setProperty("--pointer-y", `${y}`);
    isLocked = false;
  });
};

const trackPointerMovement = () => {
  const onMouseMove = (e: MouseEvent) => {
    const xP = (e.clientX / innerWidth) * 100;
    const yP = (e.clientY / innerHeight) * 100;
    updatePointerPosition(xP, yP);
  };

  window.addEventListener("mousemove", onMouseMove);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
  };
};

export default trackPointerMovement;
