declare var CURRENT_FRAME: number;

const c = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

// make canvas always fullscreen
// window.addEventListener("resize", function () {
//   c.width = window.innerWidth;
//   c.height = window.innerHeight;
// });

import Grid from "./Grid";
import Cell, { CellState } from "./Cell";

const CELL_SIZE = 10;

const GRID = new Grid(window.innerWidth, window.innerHeight, CELL_SIZE);

// main update and draw loop
const loop = () => {
  if (GRID === undefined) return;

  // simulate particles
  GRID.update();

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
              ctx.fillStyle = "#595957";
              break;
            default:
              ctx.fillStyle = "";
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

          ctx.fillRect(fixedMarker * CELL_SIZE, y * CELL_SIZE, CELL_SIZE * diff, CELL_SIZE);
        }

        stateChangeMarker = x;
        lastState = cell.state;
      }

      // draw debug cells
      // if (cell.state !== CellState.Empty && cell.state !== CellState.Boundary) {
      //   y % 2 === 0 ? (ctx.strokeStyle = "green") : (ctx.strokeStyle = "pink");
      //   ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
  ctx.strokeStyle = "darkgrey";
  ctx.lineWidth = CELL_SIZE;
  const halfSize = CELL_SIZE / 2;
  ctx.strokeRect(halfSize, halfSize, c.width - CELL_SIZE, c.height - CELL_SIZE);
  ctx.lineWidth = 1;
};

import { usePaintBrush } from "./input";
const { paintCircle } = usePaintBrush(CELL_SIZE, GRID);

// draw and update ticker
let lastFrameTime = Date.now();
let delta: number;
const MAX_FPS = 200;
const desiredDelta = Math.ceil(1000 / MAX_FPS);

setInterval(() => {
  delta = Date.now() - lastFrameTime;
  lastFrameTime = Date.now();

  CURRENT_FRAME++;
  if (CURRENT_FRAME > MAX_FPS) CURRENT_FRAME = 0;

  // try to paint circle
  paintCircle();

  loop();

  ctx.font = "18px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(String(Math.round(1000 / delta)), 10, 20);
}, desiredDelta);
