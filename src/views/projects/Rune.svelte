<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import gsap from "gsap";

  export let className = "eihwaz";

  const uid = `wobble-${Math.random().toString(36).slice(2)}`;

  const smin = 100;
  const smax = 300;
  const fMin = 0.001;
  const fMax = 0.3;
  const enterDur = 0.35;
  const leaveDur = 0.45;

  let disp!: SVGFEDisplacementMapElement;
  let turb!: SVGFETurbulenceElement;

  let wobbleTL: gsap.core.Tween | null = null;
  let freqTL: gsap.core.Tween | null = null;
  let enterTween: gsap.core.Tween | null = null;
  let leaveTween: gsap.core.Tween | null = null;

  function startWobble() {
    wobbleTL?.kill();
    wobbleTL = gsap.to(disp, {
      attr: { scale: `random(${smin}, ${smax}, 1)` },
      duration: 1,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });
  }

  function startFreq() {
    freqTL?.kill();
    freqTL = gsap.to(turb, {
      attr: {
        baseFrequency: `random(${fMin}, ${fMax}, 0.001) random(${fMin}, ${fMax}, 0.001)`,
      },
      duration: 1,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });
  }

  function toZero() {
    leaveTween?.kill();
    wobbleTL?.pause();
    freqTL?.pause();
    enterTween = gsap.to(disp, {
      attr: { scale: 0 },
      duration: enterDur,
      ease: "power2.out",
    });
  }

  function fromZeroToRandom() {
    enterTween?.kill();
    leaveTween?.kill();
    leaveTween = gsap.to(disp, {
      attr: { scale: `random(${smin}, ${smax}, 1)` },
      duration: leaveDur,
      ease: "power2.out",
      onComplete: startWobble, // resume the infinite wobble from this value
    });
  }

  function onEnter() {
    toZero();
  }
  function onLeave() {
    fromZeroToRandom();
  }

  onMount(() => {
    startWobble();
  });

  onDestroy(() => {
    wobbleTL?.kill();
    freqTL?.kill();
    enterTween?.kill();
    leaveTween?.kill();
  });
</script>

<svg
  class={`rune ${className}`}
  viewBox="0 0 276 275"
  fill="none"
  stroke="currentColor"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  on:mouseenter={onEnter}
  on:mouseleave={onLeave}
>
  <path
    class="frame"
    d="M61.4844 216.244L46.4844 221.744L56.4844 226.744L41.4844 231.244M29.4844 194.244L20.9844 204.744M20.9844 204.744L33.9844 203.244M20.9844 204.744L42.4844 192.244M20.4844 173.744L11.9844 166.244L8.48438 176.744L20.4844 173.744ZM20.4844 173.744L23.9844 163.244L32.4844 170.744L20.4844 173.744ZM27.4844 142.244H2.48438L14.4844 137.244L2.48438 131.744H27.4844M29.9844 113.244L17.9844 109.994M20.9844 100.744L5.98438 106.744L17.9844 109.994M20.9844 100.744L32.4844 103.744M20.9844 100.744L8.48438 97.2442L17.9844 109.994M41.4844 84.2442L19.4844 71.7441L27.9844 71.2441M56.4844 63.7441L54.9844 46.7441L37.9844 45.2441M45.9844 37.7441L47.9844 54.2441L63.9844 55.7441M78.4844 45.2441V24.7441L70.4844 20.2441V30.2441L87.4844 39.2441M133.484 1.74414V12.2441M133.484 27.7441V19.9941M143.484 1.74414L133.484 12.2441M133.484 12.2441V19.9941M143.484 8.74414L133.484 19.9941M162.484 29.2441L168.484 5.24414L175.984 13.2441L171.484 32.2441M189.484 39.2441L201.984 17.7441M198.438 23.8447L204.484 34.2441L192.549 33.9732M212.484 56.2441L224.484 44.2441M229.484 54.2441L230.484 38.2441L224.484 44.2441M224.484 44.2441L223.484 58.7441M230.984 78.2441L241.484 72.0396M241.484 72.0396L252.984 65.2441L252.484 77.7441L241.484 72.0396ZM241.484 72.0396L235.984 87.2442M243.484 109.244L269.484 102.244M273.984 142.744L262.484 132.244L256.984 136.244M247.484 132.244L259.484 143.244L264.484 138.744M252.984 162.244L244.484 166.244L268.984 172.244L260.484 176.244M252.984 210.244L250.484 204.244L257.984 200.244L235.984 188.744L236.984 195.744L230.484 197.244M215.984 215.244L226.262 225.522M233.984 233.244L226.262 225.522M237.484 229.244L226.262 225.522M226.262 225.522L229.984 236.744M201.484 257.744L203.484 240.744L188.484 235.244M171.484 242.244L168.484 270.244M178.984 267.744L161.484 245.244M142.484 246.744L142.729 259.472M142.729 259.472L142.984 272.744L133.484 266.244L142.729 259.472ZM98.4844 267.244L102.484 251.552M104.984 241.744L102.484 251.552M107.484 270.244L110.214 259.744M113.984 245.244L110.214 259.744M102.484 251.552L110.214 259.744M69.9844 254.744L82.9844 232.244M70.4844 242.744L76.4844 254.744M104.984 32.2441L98.4844 7.74414L114.984 30.2441L108.484 5.24414L104.984 32.2441Z"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  ></path>
  <g class="letters" filter={`url(#${uid})`}>
    <path
      class="letter-sowilo"
      d="M146.365 70.2441L112.902 140.77C112.539 141.534 113.23 142.376 114.05 142.169L160.956 130.335C161.773 130.129 162.462 130.962 162.108 131.726L128.899 203.244"
      stroke-width="14"
      stroke-linecap="round"
    ></path>

    <path
      class="letter-tiwaz"
      d="M139.027 206.5V70M139.027 70L114 137.5M139.027 70L164 137.5"
      stroke-opacity="0.92"
      stroke-width="14"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      class="letter-raido"
      d="M128 205V143.548M128 143.548V71L170.727 111.541L128 143.548ZM128 143.548L175 183.236"
      stroke-width="14"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      class="letter-eihwaz"
      d="M112 171.5L137.313 203.5V73L165 106.5"
      stroke-opacity="0.92"
      stroke-width="14"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </g>
  <circle cx="137.852" cy="137.104" r="104" stroke-width="2"></circle>

  <defs>
    <filter
      id={uid}
      x="-150%"
      y="-25%"
      width="400%"
      height="150%"
      color-interpolation-filters="sRGB"
    >
      <feTurbulence
        bind:this={turb}
        type="fractalNoise"
        baseFrequency="0.12 0.12"
        numOctaves="3"
        seed="8108"
        result="noise"
      />
      <feDisplacementMap
        bind:this={disp}
        in="SourceGraphic"
        in2="noise"
        xChannelSelector="R"
        yChannelSelector="G"
        scale="200"
        result="displaced"
      />
    </filter>
  </defs>
</svg>

<style>
  .rune .frame {
    transform-origin: center;
    animation: spin 45s linear infinite;
  }

  @keyframes spin {
    from {
      rotate: 0;
    }
    to {
      rotate: -360deg;
    }
  }

  .rune.raido path.frame {
    rotate: -60deg;
  }
  .rune.sowilo path.frame {
    rotate: 135deg;
  }
  .rune.eihwaz path.frame {
    rotate: -105deg;
  }
  .rune.tiwaz path.frame {
    rotate: 120deg;
  }
  .rune.sowilo .letters path:not(.letter-sowilo) {
    display: none;
  }
  .rune.tiwaz .letters path:not(.letter-tiwaz) {
    display: none;
  }
  .rune.raido .letters path:not(.letter-raido) {
    display: none;
  }
  .rune.eihwaz .letters path:not(.letter-eihwaz) {
    display: none;
  }
</style>
