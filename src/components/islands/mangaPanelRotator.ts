type Panel = { bwSrc: string; colorSrc: string };

type Props = {
  panelId: string;
  panels: Panel[];
  intervalMs?: number;
};

let currentPanelIdx = 0;

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

  const showNextPanel = () => {
    const nextPanelIdx = (currentPanelIdx + 1) % panels.length;
    const nextPanel = panels[nextPanelIdx];
    if (!nextPanel) return;

    panelEl.style.setProperty("--bw-img", `url(${nextPanel.bwSrc})`);
    panelEl.style.setProperty("--color-img", `url(${nextPanel.colorSrc})`);

    currentPanelIdx = nextPanelIdx;
  };

  const interval = createInterval(() => {
    showNextPanel();
  }, intervalMs);

  const onShiftArrow = (e: KeyboardEvent) => {
    if (!e.shiftKey) return;
    if (e.code !== "ArrowRight") return;
    showNextPanel();
    interval.reset();
  };

  window.addEventListener("keydown", onShiftArrow);

  return () => {
    interval.clear();
    window.removeEventListener("keydown", onShiftArrow);
  };
};

export default rotatePanels;
