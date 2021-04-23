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

// main update and draw loop
const loop = () => {
  if (GRID === undefined) return;

  // simulate particles
  if (!window.PAUSE && window.CURRENT_FRAME % (1 / window.SIM_SPEED) === 0) GRID.update();

  // draw
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);

  let lastState: CellState;
  let stateChangeMarker: number;
  GRID.everyCell(
    (y, x, lastX) => {
      const cell = GRID.cells[y][x];

      if (stateChangeMarker === null) {
        stateChangeMarker = x;
      }

      if (cell.state !== lastState) {
        if (lastState !== CellState.Empty && lastState !== CellState.Boundary) {
          switch (lastState) {
            case CellState.Sand:
              ctx.fillStyle = "#624f21";
              break;
            case CellState.Stone:
              ctx.fillStyle = "#3b3b39";
              break;
            case CellState.Water:
              ctx.fillStyle = "#4b8aae";
              break;
            case CellState.Gas:
              ctx.fillStyle = "#7EA09B";
              break;
            case CellState.Wood:
              ctx.fillStyle = "#402718";
              break;
            case CellState.Lava:
              ctx.fillStyle = "#d63615";
              break;
            case CellState.Fire:
              ctx.fillStyle = "#E86B07";
              break;
            default:
              break;
          }

          // calculate fixed drawing values due to alternating looping directions
          const even = y % 2 === 0;
          const fixedMarker = even ? stateChangeMarker : stateChangeMarker + 1;
          let diff = x - stateChangeMarker;

          if (x === lastX) {
            if (even) diff++;
            else diff--;
          }

          ctx.fillRect(
            fixedMarker * window.CELL_SIZE,
            y * window.CELL_SIZE,
            window.CELL_SIZE * diff,
            window.CELL_SIZE
          );
        }

        stateChangeMarker = x;
        lastState = cell.state;
      }

      // draw debug cells
      // if (cell.state !== CellState.Empty && cell.state !== CellState.Boundary) {
      //   y % 2 === 0 ? (ctx.strokeStyle = "green") : (ctx.strokeStyle = "pink");
      //   ctx.strokeRect(x * window.CELL_SIZE, y * window.CELL_SIZE, window.CELL_SIZE, window.CELL_SIZE);
      //   ctx.strokeStyle = "";
      // }
    },
    () => {
      lastState = CellState.Empty;
      stateChangeMarker = null;
    },
    true
  );

  // draw boundary
  ctx.strokeStyle = "grey";
  ctx.lineWidth = window.CELL_SIZE;
  const halfSize = window.CELL_SIZE / 2;
  ctx.strokeRect(halfSize, halfSize, c.width - window.CELL_SIZE, c.height - window.CELL_SIZE);
  ctx.lineWidth = 1;
};

import { usePaintBrush } from "./input";
const { paintCircle } = usePaintBrush(GRID);

// draw and update ticker
let lastFrameTime = Date.now();
let delta: number;
const MAX_FPS = 200;
const desiredDelta = Math.ceil(1000 / MAX_FPS);

setInterval(() => {
  delta = Date.now() - lastFrameTime;
  lastFrameTime = Date.now();

  window.CURRENT_FRAME++;
  if (window.CURRENT_FRAME > MAX_FPS) window.CURRENT_FRAME = 0;

  // try to paint circle
  paintCircle();

  loop();

  if (window.SHOW_FPS) {
    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(String(Math.round(1000 / delta)), 10, 22);
  }
}, desiredDelta);
