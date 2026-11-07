<script lang="ts">
  import { type BlogPost } from "../../content.config";
  import { onMount, type Snippet } from "svelte";
  import { fade } from "svelte/transition";

  type Props = { children: Snippet } & Pick<BlogPost, "pubDate">;

  let props: Props = $props();
  let readTime = $state("");

  const getReadingTime = () => {
    const text = document.getElementById("article")?.textContent ?? "";
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    if (!hours) return `${minutes}min`;
    return minutes ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  onMount(() => {
    readTime = getReadingTime();
  });
</script>

<header>
  {@render props.children()}
  <div>
    <p>
      {#if readTime}
        <span transition:fade>{readTime} read</span>
      {/if}
    </p>
    <p>
      <span>
        <time datetime={props.pubDate.toISOString()}>
          {props.pubDate.toLocaleDateString("en-us", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </span>
      <span>&nbsp • &nbsp</span>
      <span>By: <em>Aleksandar Gjoreski&nbsp;</em></span>
    </p>
  </div>
</header>

<style>
  header {
    width: 100%;
    margin-block: 3.5em 5.5em;
  }

  header div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    opacity: 0.75;
    font-size: 0.85em;
  }

  header div p {
    margin: 0;
  }
</style>
