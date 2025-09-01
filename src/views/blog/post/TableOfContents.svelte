<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  type ToCElement = {
    id: string;
    text: string;
    link?: HTMLAnchorElement;
  };

  const map = new Map<string, ToCElement>();
  const headings = document.querySelectorAll<HTMLHeadingElement>("h1, h2");
  const ids = Array.from(headings).map((h) => h.id);

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
      const link = el.link!;
      const isActive = link.classList.contains("active");
      const isVisible = visibleIds.has(el.id) || el.id === fillerId;
      if (isVisible) !isActive && link.classList.add("active");
      else link.classList.remove("active");
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0) onScreenEnter(entry);
        else onScreenLeave(entry);
        highlightIds();
      }
    },
    { rootMargin: "0px 0px -30% 0px" },
  );

  for (const heading of headings) {
    const id = heading.id;
    map.set(id, { id, text: heading.textContent });
  }

  onMount(() => {
    for (const heading of headings) observer.observe(heading);
  });

  onDestroy(() => {
    observer?.disconnect();
  });
</script>

<nav id="toc" class="toc" aria-label="Table of contents">
  <p class="title">Table of contents</p>
  <ul class="list" id="toc-list">
    {#each map.values() as heading}
      <li>
        <a bind:this={heading.link} href={`#${heading.id}`}>{heading.text}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    position: fixed;
    top: 2em;
    left: 0;
    max-width: 300px;
    padding-left: 2em;
  }

  nav > ul {
    margin-top: 1em;
    max-height: 75vh;
    overflow-y: auto;
  }

  nav > p {
    cursor: pointer;
    user-select: none;
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
  }
</style>
