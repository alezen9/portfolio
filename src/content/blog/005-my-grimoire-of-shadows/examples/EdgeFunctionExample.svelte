<script lang="ts">
  import TexelGrid, {
    CELL,
    PROBE_RADIUS,
    VERTEX_INDICES,
    VERTEX_NAMES,
    VERTEX_RADIUS,
    getEdgeValue,
    screenDimensions,
    screenGeometry,
    toDimensionSpace,
    type GridScene,
    type Point,
    type Triangle,
  } from "./TexelGrid.svelte";

  const hatches = [
    { color: "var(--first)", angle: 45 },
    { color: "var(--second)", angle: 135 },
    { color: "var(--third)", angle: 180 },
  ] as const;
  const [firstHatch, secondHatch, thirdHatch] = hatches;

  const ARROW_HEAD = 8;
  const HATCH_WIDTH = 1.25;
  const HATCH_SPACING = 6;
  const LABEL_OFFSET = 22;
  const MIN_VISIBLE_WEIGHT = 0.01;

  const weightFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatWeight = (value: number) => {
    if (value === 0) return weightFormatter.format(0);
    const magnitude = Math.max(Math.abs(value), MIN_VISIBLE_WEIGHT);
    return weightFormatter.format(Math.sign(value) * magnitude);
  };

  const getEdgeSign = (value: number) => {
    if (value === 0) return "0";
    return value > 0 ? "+" : "-";
  };

  const drawArrow = (
    dimensions: ReturnType<typeof screenDimensions>,
    from: Point,
    to: Point,
    gap: number,
    className: string,
  ) => {
    const start = toDimensionSpace(from);
    const end = toDimensionSpace(to);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    if (distance <= gap + ARROW_HEAD) return;

    const directionX = (end.x - start.x) / distance;
    const directionY = (end.y - start.y) / distance;
    const tipX = end.x - directionX * gap;
    const tipY = end.y - directionY * gap;
    dimensions
      .dimension({ className })
      .moveToAbs(
        start.x + directionX * VERTEX_RADIUS,
        start.y + directionY * VERTEX_RADIUS,
      )
      .lineToAbs(tipX, tipY);
    dimensions
      .dimension({ className: `${className} arrow-head` })
      .moveToAbs(tipX, tipY)
      .arrow(Math.atan2(directionY, directionX), ARROW_HEAD);
  };

  let triangle = $state<Triangle>([
    { x: 2.6, y: 7.6 },
    { x: 8.4, y: 1.9 },
    { x: 13.6, y: 6.8 },
  ]);
  let point = $state({ x: 8.3, y: 5.4 });
  const [first, second, third] = $derived(triangle);
  const edges = $derived([
    [second, third],
    [third, first],
    [first, second],
  ] as const);
  const area = $derived(getEdgeValue(first, second, third));
  const edgeValues = $derived(
    edges.map(([from, to]) => getEdgeValue(from, to, point)),
  );
  const weights = $derived(
    area === 0 ? null : edgeValues.map((value) => value / area),
  );
  const edgeSign = $derived(getEdgeSign(edgeValues[2]));

  const setupOverlay = (scene: GridScene) => {
    const geometry = screenGeometry(scene);
    const dimensions = screenDimensions(scene);
    const fills = hatches.map(({ color, angle }) => {
      const radians = (angle * Math.PI) / 180;
      const x = Math.sin(radians);
      const y = -Math.cos(radians);
      return scene.addLinearGradient(
        [
          { at: [0, 0], color, opacity: 0.82 },
          { at: [x * HATCH_WIDTH, y * HATCH_WIDTH], color, opacity: 0.82 },
          { at: [x * HATCH_WIDTH, y * HATCH_WIDTH], color, opacity: 0 },
          { at: [x * HATCH_SPACING, y * HATCH_SPACING], color, opacity: 0 },
        ],
        { units: "userSpaceOnUse", spread: "repeat" },
      );
    });

    scene.draw(() => {
      if (weights) {
        for (const index of VERTEX_INDICES) {
          const [from, to] = edges[index];
          geometry
            .path({
              className: weights[index] < 0 ? "area is-negative" : "area",
              fill: fills[index],
              stroke: "none",
            })
            .moveToAbs(point.x * CELL, point.y * CELL)
            .lineToAbs(from.x * CELL, from.y * CELL)
            .lineToAbs(to.x * CELL, to.y * CELL)
            .close();
        }
      }
      for (const index of VERTEX_INDICES) {
        const { x, y } = toDimensionSpace(triangle[index]);
        dimensions
          .dimension()
          .textAtAbs(
            x,
            y + LABEL_OFFSET,
            VERTEX_NAMES[index],
            "middle",
            "vertex-label",
          );
      }
      const { x, y } = toDimensionSpace(point);
      dimensions.dimension().textAtAbs(x, y, edgeSign, "middle", "edge-sign");
      drawArrow(dimensions, first, second, VERTEX_RADIUS + 1, "edge-arrow");
      drawArrow(dimensions, first, point, PROBE_RADIUS + 2, "point-arrow");
    });
  };
</script>

<div class="texel-example">
  <TexelGrid
    label="A triangle split into three hatched areas around a point, with arrows along the first edge and toward the point"
    bind:triangle
    bind:point
    vertexColors={[firstHatch.color, secondHatch.color, thirdHatch.color]}
    {setupOverlay}
  />

  <p class="texel-weights">
    <span role="status" class:sr-only={weights !== null}>
      {#if !weights}
        Triangle has no area
      {:else if weights.every((weight) => weight >= 0)}
        Inside
      {:else}
        Outside
      {/if}
    </span>
    {#if weights}
      {#each VERTEX_INDICES as index (index)}
        <span class="texel-weight">
          <span>{VERTEX_NAMES[index]}</span>
          <span class="sr-only">weight</span>
          {formatWeight(weights[index])}
          <span
            class="hatch-key"
            aria-hidden="true"
            style:background={`repeating-linear-gradient(${hatches[index].angle}deg, ${hatches[index].color} 0 0.75px, transparent 0.75px 4px)`}
          ></span>
        </span>
      {/each}
    {/if}
  </p>
</div>
