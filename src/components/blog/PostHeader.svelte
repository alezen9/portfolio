<script lang="ts">
  import { type BlogPost } from "src/content.config";
  import { onMount, type Snippet } from "svelte";
  import { fade } from "svelte/transition";

  type Props = { children: Snippet } & Pick<BlogPost, "pubDate">;

  let props: Props = $props();
  let readTime: number = $state(-1);

  const getReadingTime = () => {
    const text = document.getElementById("article")?.textContent ?? "";
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    return time;
  };

  onMount(() => {
    readTime = getReadingTime();
  });
</script>

<header>
  {@render props.children()}
  <div>
    <p>
      {#if readTime > -1}
        <span transition:fade>{readTime}min read</span>
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
