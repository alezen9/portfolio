<script lang="ts">
  import TexelGrid, { type Triangle } from "./TexelGrid.svelte";

  let triangle = $state<Triangle>([
    { x: 3.3, y: 7.6 },
    { x: 9.6, y: 1.6 },
    { x: 12.8, y: 7.2 },
  ]);
</script>

<TexelGrid
  label="A texel grid with a triangle on top, the texels whose center is inside the triangle are filled"
  bind:triangle
  isFilled
/>
