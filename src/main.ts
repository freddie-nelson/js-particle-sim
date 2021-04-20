declare var CURRENT_FRAME: number;

const c = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

// make canvas always fullscreen
window.addEventListener("resize", function () {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
});

import Grid from "./Grid";
import { CellState } from "./Cell";

const CELL_SIZE = 3;

const GRID = new Grid(window.innerWidth, window.innerHeight, CELL_SIZE);

// main update and draw loop
const loop = () => {
  if (GRID === undefined) return;

  // update velocity
  for (const row of GRID.cells) {
    for (const cell of row) {
      if (
        cell.state === CellState.Empty ||
        cell.state === CellState.Boundary ||
        cell.state === CellState.Stone
      )
        continue;

      if (!cell.static && cell.velocity < 15) cell.velocity += 0.5;
      else if (cell.velocity !== 1) cell.velocity = 1;
    }
  }

  GRID.update();

  // draw
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);

  let lastState: CellState;
  let stateChangeMarker: number;
  GRID.everyCell(
    (y, x, lastX) => {
      const cell = GRID.cells[y][x];
      if (
        cell.state !== lastState ||
        (x === lastX && !(cell.state === CellState.Empty || cell.state === CellState.Boundary))
      ) {
        if (lastState !== CellState.Empty) {
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
              ctx.fillStyle = "#FFF";
              break;
          }

          const diff = x - stateChangeMarker;
          ctx.fillRect(stateChangeMarker * CELL_SIZE, y * CELL_SIZE, CELL_SIZE * diff, CELL_SIZE);
        }

        stateChangeMarker = x;
        lastState = cell.state;
        return;
      }
    },
    () => {
      lastState = CellState.Empty;
    }
  );
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
