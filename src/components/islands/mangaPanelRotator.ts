type Panel = { bwSrc: string; colorSrc: string };

type Props = {
  panelId: string;
  panels: Panel[];
  intervalMs?: number;
};

let currentPanelIdx = 0;

const fetched = new Set();

const prefetch = (url: string) => {
  if (fetched.has(url)) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "image";
  link.href = url;
  link.fetchPriority = "low";
  document.head.append(link);
  fetched.add(url);
};

const createInterval = (cb: VoidFunction, ms: number) => {
  let interval = setInterval(cb, ms);

  const reset = () => {
    clearInterval(interval);
    interval = setInterval(cb, ms);
  };

  const clear = () => clearInterval(interval);

  return { reset, clear };
};

const rotatePanels = ({ panelId, panels, intervalMs = 15000 }: Props) => {
  const panelEl = document.getElementById(panelId);
  if (!panelEl) return;

  const initialPanel = panels[currentPanelIdx];
  if (initialPanel) {
    fetched.add(initialPanel.bwSrc);
    fetched.add(initialPanel.colorSrc);
  }

  const showNextPanel = () => {
    const nextPanelIdx = (currentPanelIdx + 1) % panels.length;
    const nextPanel = panels[nextPanelIdx];
    if (!nextPanel) return;

    panelEl.style.setProperty("--bw-img", `url("${nextPanel.bwSrc}")`);
    panelEl.style.setProperty("--color-img", `url("${nextPanel.colorSrc}")`);

    currentPanelIdx = nextPanelIdx;
  };

  const prefetchNextPanel = () => {
    const nextPanelIdx = (currentPanelIdx + 1) % panels.length;
    const nextPanel = panels[nextPanelIdx];
    if (!nextPanel) return;
    prefetch(nextPanel.bwSrc);
    prefetch(nextPanel.colorSrc);
  };

  const interval = createInterval(() => {
    showNextPanel();
    prefetchNextPanel();
  }, intervalMs);

  const onShiftArrow = (e: KeyboardEvent) => {
    if (!e.shiftKey) return;
    if (e.code !== "ArrowRight") return;
    interval.reset();
    showNextPanel();
    prefetchNextPanel();
  };

  window.addEventListener("keydown", onShiftArrow);
  prefetchNextPanel();

  return () => {
    interval.clear();
    window.removeEventListener("keydown", onShiftArrow);
  };
};

export default rotatePanels;
