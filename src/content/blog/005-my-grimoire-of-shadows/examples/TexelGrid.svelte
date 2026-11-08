<script module lang="ts">
  import { Pluton2D } from "pluton-2d";

  export type GridScene = Pluton2D<{ revision: number }>;
  export type Point = { x: number; y: number };
  export type Triangle = [Point, Point, Point];
  export const VERTEX_INDICES = [0, 1, 2] as const;
  export const VERTEX_NAMES = ["A", "B", "C"] as const;
  type HandleId = (typeof VERTEX_INDICES)[number] | "point";

  const COLUMNS = 16;
  const ROWS = 9;
  export const CELL = 40;
  const WIDTH = COLUMNS * CELL;
  const HEIGHT = ROWS * CELL;
  export const VIEW_BOX = { width: WIDTH, height: HEIGHT };
  export const PROBE_RADIUS = 15;
  export const VERTEX_RADIUS = 7;
  const HIT_RADIUS = 28;
  const DOT_RADIUS = 2.5;

  const centers: Point[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      centers.push({ x: column + 0.5, y: row + 0.5 });
    }
  }

  export const getEdgeValue = (from: Point, to: Point, point: Point) => {
    const value =
      (to.x - from.x) * (point.y - from.y) -
      (to.y - from.y) * (point.x - from.x);
    return Math.abs(value) <= 1e-10 ? 0 : value;
  };

  export const screenGeometry = (scene: GridScene) => {
    const geometry = scene.geometry.group();
    geometry.translate(-WIDTH / 2, HEIGHT / 2);
    geometry.scale(1, -1);
    return geometry;
  };

  export const screenDimensions = (scene: GridScene) => {
    const dimensions = scene.dimensions.group();
    dimensions.translate(-WIDTH / 2, HEIGHT / 2);
    return dimensions;
  };

  export const toDimensionSpace = ({ x, y }: Point) => ({
    x: x * CELL,
    y: -y * CELL,
  });

  type Path = ReturnType<ReturnType<typeof screenGeometry>["path"]>;

  const circle = (path: Path, x: number, y: number, radius: number) =>
    path
      .moveToAbs(x - radius, y)
      .arcTo(radius * 2, 0, radius)
      .arcTo(-radius * 2, 0, radius)
      .close();
</script>

<script lang="ts">
  import "pluton-2d/style.css";
  import "./examples.css";

  type Props = {
    label: string;
    triangle: Triangle;
    vertexColors?: readonly [string, string, string];
    point?: Point;
    isFilled?: boolean;
    setupOverlay?: (scene: GridScene) => void;
  };

  let {
    label,
    triangle = $bindable(),
    vertexColors,
    point = $bindable(),
    isFilled,
    setupOverlay,
  }: Props = $props();
  const [first, second, third] = $derived(triangle);
  const covered = $derived.by(() => {
    const area = getEdgeValue(first, second, third);
    const inside = new Set<Point>();
    if (area === 0) return inside;
    for (const center of centers) {
      if (getEdgeValue(second, third, center) / area < 0) continue;
      if (getEdgeValue(third, first, center) / area < 0) continue;
      if (getEdgeValue(first, second, center) / area < 0) continue;
      inside.add(center);
    }
    return inside;
  });

  let surface: HTMLDivElement;
  let drawingSvg: SVGSVGElement | undefined;
  let drawing: GridScene | undefined;
  let drag = $state<{
    handle: HandleId;
    pointerId: number;
    offset: Point;
  } | null>(null);

  const setupDrawing = (scene: GridScene) => {
    scene.enableGrid(false);
    scene.enableAxes(false);
    const texels = isFilled ? screenGeometry(scene) : undefined;
    const background = screenGeometry(scene);
    background.setDrawUsage("static");
    const geometry = screenGeometry(scene);
    let hasDrawnBackground = false;

    scene.draw(() => {
      if (texels) {
        for (const center of centers) {
          const { x, y } = center;
          texels
            .path({
              className: covered.has(center) ? "texel is-covered" : "texel",
              stroke: "currentColor",
              fill: "var(--accent-bamboo)",
            })
            .moveToAbs((x - 0.5) * CELL, (y - 0.5) * CELL)
            .lineTo(CELL, 0)
            .lineTo(0, CELL)
            .lineTo(-CELL, 0)
            .close();
        }
      }
      if (!hasDrawnBackground) {
        const grid = background.path({
          className: "grid-lines",
          stroke: "currentColor",
          fill: "none",
        });
        for (let x = 0; x <= WIDTH; x += CELL)
          grid.moveToAbs(x, 0).lineToAbs(x, HEIGHT);
        for (let y = 0; y <= HEIGHT; y += CELL)
          grid.moveToAbs(0, y).lineToAbs(WIDTH, y);

        const dots = background.path({
          className: "center",
          stroke: "none",
          fill: "currentColor",
        });
        for (const { x, y } of centers)
          circle(dots, x * CELL, y * CELL, DOT_RADIUS);
        hasDrawnBackground = true;
      }
      const coveredDots = geometry.path({
        className: "center is-covered",
        stroke: "none",
        fill: "currentColor",
      });
      for (const { x, y } of covered)
        circle(coveredDots, x * CELL, y * CELL, DOT_RADIUS);

      geometry
        .path({ className: "triangle", stroke: "currentColor", fill: "none" })
        .moveToAbs(first.x * CELL, first.y * CELL)
        .lineToAbs(second.x * CELL, second.y * CELL)
        .lineToAbs(third.x * CELL, third.y * CELL)
        .close();
    });
    setupOverlay?.(scene);

    const handles = screenGeometry(scene);
    scene.draw(() => {
      for (const index of VERTEX_INDICES) {
        const { x, y } = triangle[index];
        const vertex = handles.path({
          className: `vertex-dot vertex-${index}`,
          fill: vertexColors?.[index] ?? "currentColor",
          stroke: "none",
        });
        circle(vertex, x * CELL, y * CELL, VERTEX_RADIUS);
      }
      if (!point) return;
      const { x, y } = point;
      const probe = handles.path({
        className: "probe",
        fill: "light-dark(#dcdcdc, #171717)",
        stroke: "currentColor",
      });
      circle(probe, x * CELL, y * CELL, PROBE_RADIUS);
    });
  };

  const initialDrawing = Pluton2D.ssrRender(
    { ...VIEW_BOX, params: { revision: 0 } },
    setupDrawing,
  );

  const mountDrawing = (layer: HTMLDivElement) => {
    const svg = layer.querySelector("svg");
    if (!svg) return;
    svg.replaceChildren();
    const scene = new Pluton2D(svg, {
      viewBox: VIEW_BOX,
      params: { revision: 0 },
    });
    setupDrawing(scene);
    drawingSvg = svg;
    drawing = scene;
    return () => scene.dispose();
  };

  const moveHandle = (handle: HandleId, x: number, y: number) => {
    const position = {
      x: Math.min(COLUMNS - 1, Math.max(1, x)),
      y: Math.min(ROWS - 1, Math.max(1, y)),
    };
    if (handle === "point") point = position;
    else triangle[handle] = position;
    if (drawing) drawing.params.revision++;
  };

  const getPointerPosition = (event: PointerEvent) => {
    const screen = drawingSvg?.getScreenCTM();
    if (!screen) return;
    const { x, y } = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      screen.inverse(),
    );
    return { x: x / CELL, y: y / CELL };
  };

  const onPointerDown = (
    event: PointerEvent,
    handle: HandleId,
    position: Point,
  ) => {
    if (drag || event.button !== 0) return;
    const pointer = getPointerPosition(event);
    if (!pointer) return;
    drag = {
      handle,
      pointerId: event.pointerId,
      offset: { x: position.x - pointer.x, y: position.y - pointer.y },
    };
    surface.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const pointer = getPointerPosition(event);
    if (!pointer) return;
    const { handle, offset } = drag;
    moveHandle(handle, pointer.x + offset.x, pointer.y + offset.y);
  };

  const onLostPointerCapture = (event: PointerEvent) => {
    if (drag?.pointerId !== event.pointerId) return;
    drag = null;
  };
</script>

<div
  bind:this={surface}
  class="texel-grid"
  class:is-dragging={drag !== null}
  role="group"
  aria-label={label}
  onpointermove={onPointerMove}
  onlostpointercapture={onLostPointerCapture}
>
  <div class="drawing" {@attach mountDrawing} aria-hidden="true">
    {@html initialDrawing}
  </div>
  {#each VERTEX_INDICES as index (index)}
    {@render handle(index, triangle[index], `${VERTEX_NAMES[index]} vertex`)}
  {/each}
  {#if point}
    {@render handle("point", point, "point")}
  {/if}
</div>

{#snippet handle(id: HandleId, position: Point, label: string)}
  {@const { x, y } = position}
  <button
    type="button"
    class="handle"
    data-handle={id}
    aria-label={label}
    style:left={`${(x / COLUMNS) * 100}%`}
    style:top={`${(y / ROWS) * 100}%`}
    style:width={`${(HIT_RADIUS * 200) / WIDTH}%`}
    onpointerdown={(event) => onPointerDown(event, id, position)}
  ></button>
{/snippet}
