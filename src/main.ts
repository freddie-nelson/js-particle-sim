// setup globals
declare global {
  interface Window {
    CURRENT_FRAME: number;
    GRID: Grid;
    BRUSH_SIZE: number;
    PAUSE: boolean;
    SHOW_FPS: boolean;
    CELL_SIZE: number;
    MATERIAL: CellState;
    SIM_SPEED: number;
  }
}

window.CURRENT_FRAME = 0;
window.BRUSH_SIZE = 10;
window.PAUSE = false;
window.SHOW_FPS = false;
window.CELL_SIZE = 4;
window.MATERIAL = 1;
window.SIM_SPEED = 1;

import Grid from "./Grid";
import { CellState } from "./Cell";

// setup canvas
const c = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = c.getContext("2d");
c.width = c.clientWidth;
c.height = c.clientHeight;

// create grid
let GRID = new Grid(c.width, c.height, window.CELL_SIZE);
window.GRID = GRID;

// scale canvas to window and reset grid on resize
window.addEventListener("resize", () => {
  c.width = c.clientWidth;
  c.height = c.clientHeight;

  GRID.initCells(c.width, c.height, window.CELL_SIZE);
});

// make canvas always fullscreen
// window.addEventListener("resize", function () {
//   c.width = window.innerWidth;
//   c.height = window.innerHeight;
// });

const update = () => {
  if (GRID === undefined) return;

  // simulate particles
  if (!window.PAUSE && window.CURRENT_FRAME % (1 / window.SIM_SPEED) === 0) GRID.update();
};

import { usePaintBrush } from "./input";
import { greedyMesh, linearGreedyMesh } from "./drawing";
const { paintCircle } = usePaintBrush(GRID);

// update loop
let lastFrameTime = Date.now();
let delta: number;
const MAX_FPS = 250;
const desiredDelta = Math.ceil(1000 / MAX_FPS);

const fpsElement = document.createElement("span");
fpsElement.id = "fps";
fpsElement.style.width = "100px";
fpsElement.style.font = "18px Arial";
fpsElement.style.color = "white";
fpsElement.style.position = "absolute";
fpsElement.style.top = "10px";
fpsElement.style.left = "10px";
fpsElement.style.userSelect = "none";
fpsElement.style.pointerEvents = "none";
document.body.appendChild(fpsElement);

setInterval(() => {
  delta = Date.now() - lastFrameTime;
  lastFrameTime = Date.now();

  window.CURRENT_FRAME++;
  if (window.CURRENT_FRAME > MAX_FPS) window.CURRENT_FRAME = 0;

  // try to paint circle
  paintCircle();

  update();

  if (!fpsElement.hidden) {
    fpsElement.textContent = String(Math.round(1000 / delta));
  }
}, desiredDelta);

// drawing
const colors: { [index: number]: string } = {
  [CellState.Boundary]: "gray",
  [CellState.Sand]: "#624f21",
  [CellState.Stone]: "#3b3b39",
  [CellState.Water]: "#4b8aae",
  [CellState.Gas]: "#7EA09B",
  [CellState.Wood]: "#402718",
  [CellState.Lava]: "#d63615",
  [CellState.Fire]: "#E86B07",
  [CellState.Rock]: "#696B72",
  [CellState.Glass]: "#969480",
  [CellState.Acid]: "#B6F20E",
  [CellState.FlamingMaterial]: "#e84b07",
};

const draw = () => {
  requestAnimationFrame(draw);
  if (GRID === undefined) return;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);

  linearGreedyMesh(ctx, colors);

  // draw boundary
  ctx.strokeStyle = "grey";
  ctx.lineWidth = window.CELL_SIZE;
  const halfSize = window.CELL_SIZE / 2;
  ctx.strokeRect(halfSize, halfSize, c.width - window.CELL_SIZE, c.height - window.CELL_SIZE);
  ctx.lineWidth = 1;
};

draw();
