<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import panels from "@content/other/manga-panels.json" assert { type: "json" };
  import trackPointerMovement from "@components/scripts/trackPointerMovement";
  import { createInterval } from "@utils/createInterval";

  let intervalMs = 15000;
  let idx = $state(0);
  const getNextIdx = () => (idx + 1) % panels.length;
  const getEvenIdx = () => {
    const isEven = idx % 2 === 0;
    if (isEven) return idx;
    else return getNextIdx();
  };

  const getOddIdx = () => {
    const isEven = idx % 2 === 0;
    if (!isEven) return idx;
    else return getNextIdx();
  };

  let isTransitioning = $state(false);
  let evenIdx = $state(0);
  let oddIdx = $state(1);
  let evenPanel = $derived(panels[evenIdx]);
  let oddPanel = $derived(panels[oddIdx]);
  let evenOpacity = $derived(idx % 2 === 0 ? 1 : 0);
  let oddOpacity = $derived(1 - evenOpacity);
  let timerAnimation = $derived(idx % 2 === 0 ? "a" : "b");
  let interval: ReturnType<typeof createInterval>;

  const onShiftArrow = (e: KeyboardEvent) => {
    if (!e.shiftKey || isTransitioning) return;
    if (e.code !== "ArrowRight") return;
    idx = getNextIdx();
    interval.reset();
  };

  const onTransitionStart = () => {
    isTransitioning = true;
  };

  const onTransitionEnd = (e: TransitionEvent) => {
    isTransitioning = false;
    evenIdx = getEvenIdx();
    oddIdx = getOddIdx();
  };

  let cleanup: VoidFunction | undefined;

  onMount(() => {
    interval = createInterval(() => {
      idx = getNextIdx();
    }, intervalMs);
    cleanup = trackPointerMovement({
      rootSelector: ".panel",
      enableStretching: true,
    });
    window.addEventListener("keydown", onShiftArrow);
  });

  onDestroy(() => {
    cleanup?.();
    interval.clear();
    window.removeEventListener("keydown", onShiftArrow);
  });
</script>

<div
  class="panel"
  ontransitionstart={onTransitionStart}
  ontransitionend={onTransitionEnd}
>
  <div class="slot even" style={`opacity: ${evenOpacity};`}>
    <img role="presentation" class="base" src={evenPanel.bwSrc} alt="" />
    <img
      role="presentation"
      class="reveal force-gpu"
      src={evenPanel.colorSrc}
      alt=""
    />
  </div>
  <div class="slot odd" style={`opacity: ${oddOpacity};`}>
    <img role="presentation" class="base" src={oddPanel.bwSrc} alt="" />
    <img
      role="presentation"
      class="reveal force-gpu"
      src={oddPanel.colorSrc}
      alt=""
    />
  </div>
</div>
<div class="keys">
  <span class="key">Shift</span>
  <span class="key">&rarr;</span>
  <span
    class={`timer countdown-${timerAnimation}`}
    style={`--duration: ${intervalMs}ms`}
  >
    <svg
      viewBox="0 0 40 40"
      role="progressbar"
      aria-label="Panel timer"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="100"
      fill="none"
      stroke="currentColor"
    >
      <!-- Track -->
      <!-- <circle cx="20" cy="20" r="18" opacity="0.2" stroke-width="3" /> -->

      <circle
        class="timer__progress"
        cx="20"
        cy="20"
        r="18"
        stroke-width="5"
        stroke-linecap="round"
        pathLength="1"
      ></circle>
    </svg>
  </span>
</div>

<style>
  .panel {
    position: fixed;
    inset: 0;
    height: 100dvh;
    z-index: -1;
    pointer-events: none;
  }

  .panel .slot {
    position: absolute;
    inset: 0;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
    will-change: opacity;
  }

  .panel img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .panel .base {
    opacity: 0.1;
  }

  .panel .reveal {
    --r: 150px;
    --size: calc(var(--r) * var(--stretch, 1));
    --x: calc(var(--pointer-x, 50) * 1%);
    --y: calc(var(--pointer-y, 50) * 1%);
    opacity: 0.75;
    filter: contrast(1.5);
    mask-image: radial-gradient(
      circle at var(--x) var(--y),
      black var(--size),
      transparent var(--size)
    );
  }

  .keys {
    position: fixed;
    bottom: 2em;
    right: 2em;
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-size: 0.65em;
  }

  .keys .key {
    --text-mix: 65%;
    --bg-mix: 100%;
    --border-mix: 20%;
    padding: 0 0.5em;
    border-radius: 0.25em;
    color: color-mix(in oklab, var(--text-color) var(--text-mix), transparent);
    background: color-mix(
      in oklab,
      var(--background-color) var(--bg-mix),
      transparent
    );
    border: 1px solid
      color-mix(
        in oklab,
        var(--text-color) var(--border-mix),
        var(--background-color)
      );
  }

  .keys .timer {
    --duration: 0ms;
    width: 1.25em;
    height: 1.25em;
    margin-left: 1em;
    color: var(--text-color);
  }

  .keys .timer svg {
    transform: scaleX(-1) rotate3d(0, 0, 1, -90deg);
    stroke-dasharray: 1;
  }

  .keys .timer.countdown-a svg {
    animation: countdown-a var(--duration) linear infinite;
  }
  .keys .timer.countdown-b svg {
    animation: countdown-b var(--duration) linear infinite;
  }

  @keyframes countdown-a {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 1;
    }
  }

  @keyframes countdown-b {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 1;
    }
  }

  @media (prefers-color-scheme: dark) {
    .keys .key {
      --text-mix: 85%;
      --bg-mix: 90%;
      --border-mix: 40%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel .reveal {
      display: none;
    }
  }

  @media (pointer: coarse) {
    .panel .reveal,
    .keys {
      display: none;
    }
  }
</style>
