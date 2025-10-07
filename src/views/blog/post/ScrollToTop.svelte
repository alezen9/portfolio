<script lang="ts">
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { onMount } from "svelte";
  gsap.registerPlugin(ScrollTrigger);

  const THRESHOLD = 300; // px from top before showing
  let btn: HTMLButtonElement;
  let ring: SVGCircleElement;

  const init = () => {
    const r = parseFloat(ring.getAttribute("r") || "0");
    const C = 2 * Math.PI * r;
    ring.style.strokeDasharray = `${C}`;
    ring.style.strokeDashoffset = `${C}`;

    ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate(self) {
        const offset = C * (1 - self.progress);
        gsap.to(ring, {
          strokeDashoffset: offset,
          duration: 0.15,
          ease: "none",
        });

        const show = self.scroll() > THRESHOLD;
        gsap.to(btn, {
          autoAlpha: show ? 0.5 : 0,
          duration: 0.25,
          ease: "power2.out",
        });
        btn.style.pointerEvents = show ? "auto" : "none";
      },
    });
  };

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  onMount(() => {
    init();
  });
</script>

<button bind:this={btn} aria-label="scroll-to-top" onclick={onClick}>
  <!-- your chevron -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke="currentColor"
    stroke-width="2.4"
  >
    <path d="M12 4L6 10M12 4L18 10M12 4L12 14.5M12 20V17.5"></path>
  </svg>

  <!-- tiny progress ring, sits on top -->
  <svg class="progress" viewBox="0 0 36 36" aria-hidden="true">
    <circle
      bind:this={ring}
      class="scroll-progress"
      cx="18"
      cy="18"
      r="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2.4"
      transform="rotate(-90 18 18)"
    />
  </svg>
</button>

<style>
  button {
    position: fixed;
    bottom: 2em;
    right: 2em;
    width: 3em;
    height: 3em;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background-color: transparent;
    color: var(--text-accent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-out;
  }

  button:hover {
    opacity: 1 !important;
  }

  button svg.progress {
    position: absolute;
    inset: 0;
    color: var(--text-accent);
  }
</style>
