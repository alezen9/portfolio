<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { fade } from "svelte/transition";

  type ToCElement = {
    id: string;
    text: string;
    link?: HTMLAnchorElement;
  };

  let mq: MediaQueryList;
  const map = new SvelteMap<string, ToCElement>();
  let observer: IntersectionObserver;
  let headings: HTMLHeadingElement[];

  const init = () => {
    headings = [...document.querySelectorAll<HTMLHeadingElement>("h1, h2")];
    headings = headings.filter((h) => !h.className.includes("sr-only"));
    const ids = headings.map((h) => h.id);

    let fillerId: string | undefined;
    const visibleIds = new Set<string>();

    const onScreenEnter = (entry: IntersectionObserverEntry) => {
      const id = entry.target.id;
      visibleIds.add(id);
      fillerId = undefined;
    };

    const onScreenLeave = (entry: IntersectionObserverEntry) => {
      const id = entry.target.id;
      visibleIds.delete(id);

      if (visibleIds.size > 0) {
        fillerId = undefined;
        return;
      }

      // If it left through the bottom, we likely scrolled UP -> pick previous heading.
      const rb = entry.rootBounds;
      const bc = entry.boundingClientRect;
      if (rb && bc.top >= rb.bottom) {
        const idx = ids.indexOf(id);
        fillerId = ids[Math.max(0, idx - 1)];
      } else {
        // Otherwise (left through top or unknown), keep current as fallback.
        fillerId = id;
      }
    };

    const highlightIds = () => {
      for (const el of map.values()) {
        const link = el.link;
        if (!link) continue;
        const isActive = link.classList.contains("active");
        const isVisible = visibleIds.has(el.id) || el.id === fillerId;
        if (isVisible) !isActive && link.classList.add("active");
        else link.classList.remove("active");
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio > 0) onScreenEnter(entry);
          else onScreenLeave(entry);
          highlightIds();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );

    for (const heading of headings) {
      const id = heading.id;
      map.set(id, { id, text: heading.textContent });
    }
  };

  const observeHeadings = () => {
    for (const heading of headings) observer.observe(heading);
  };

  const onMqChange = (e: MediaQueryListEvent) => {
    if (e.matches) observer.disconnect();
    else observeHeadings();
  };

  onMount(() => {
    init();
    mq = window.matchMedia("(max-width: 1480px)");
    if (!mq.matches) observeHeadings();
    mq.addEventListener("change", onMqChange);
  });

  onDestroy(() => {
    mq?.removeEventListener("change", onMqChange);
    observer?.disconnect();
  });
</script>

<nav id="toc" class="toc" aria-label="Table of contents">
  <p class="title">Overview</p>
  {#if map.size > 0}
    <ul transition:fade class="list" id="toc-list">
      {#each map.values() as heading}
        <li>
          <a bind:this={heading.link} href={`#${heading.id}`}>{heading.text}</a>
        </li>
      {/each}
    </ul>
  {/if}
</nav>

<style>
  nav {
    position: fixed;
    top: 2em;
    left: 0;
    max-width: 300px;
    padding-left: 2em;
    user-select: none;
  }

  nav > ul {
    margin-top: 1em;
    max-height: 75vh;
    overflow-y: auto;
  }

  nav > p {
    position: sticky;
    top: 0;
    font-size: 1.5em;
    font-weight: 500;
    list-style-type: none;
  }

  nav ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding-inline-start: 0;
    font-size: 0.8em;
  }

  a:not(.active) {
    color: currentColor;
    opacity: 0.4;
  }

  @media screen and (max-width: 1480px) {
    nav {
      visibility: hidden;
      pointer-events: none;
    }
  }
</style>
