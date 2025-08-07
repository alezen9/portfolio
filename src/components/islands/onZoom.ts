type Props = {
  onZoom: (e: Event) => void;
};

const mount = () => {
  const html = document.documentElement;
  const onZoom = (e: Event) => {
    const isZoomed = (e.currentTarget as VisualViewport).scale !== 1;
    if (isZoomed) html.classList.add("is-zoomed");
    else html.classList.remove("is-zoomed");
  };

  window.visualViewport?.addEventListener("resize", onZoom);

  return () => {
    window.visualViewport?.removeEventListener("resize", onZoom);
  };
};

export default mount;
