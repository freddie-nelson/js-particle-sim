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

      if (!cell.static) cell.velocity += 0.5;
      else if (cell.velocity !== 1) cell.velocity = 1;
    }
  }

  GRID.update();

  // draw
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);

  let lastState: CellState;
  let sameStateCounter = 1;
  GRID.everyCell(
    (y, x) => {
      const cell = GRID.cells[y][x];
      if (
        cell.state !== lastState ||
        (x === GRID.CELL_COUNT_X - 2 &&
          !(cell.state === CellState.Empty || cell.state === CellState.Boundary))
      ) {
        if (lastState !== CellState.Empty) {
          let fill: string;
          switch (lastState) {
            case CellState.Sand:
              fill = "#624f21";
              break;
            case CellState.Stone:
              fill = "#3b3b39";
              break;
            case CellState.Water:
              fill = "#4b8aae";
              break;
            case CellState.Gas:
              fill = "#595957";
              break;
            default:
              fill = "#FFF";
              break;
          }

          ctx.fillStyle = fill;
          ctx.fillRect(
            (x - sameStateCounter) * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE * sameStateCounter,
            CELL_SIZE
          );
        }

        sameStateCounter = 1;
        lastState = cell.state;
        return;
      }

      sameStateCounter++;
    },
    (y) => {
      sameStateCounter = 1;
      lastState = CellState.Empty;
    }
  );
};

let lastFrameTime = Date.now();
let delta: number;
const desiredDelta = Math.ceil(1000 / 60);

setInterval(() => {
  delta = Date.now() - lastFrameTime;
  lastFrameTime = Date.now();

  loop();

  ctx.font = "18px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(String(Math.round(1000 / delta)), 10, 20);
}, desiredDelta);

// handle key events
let keyIsPressed = false;
let key = "";

window.addEventListener("keydown", (e: KeyboardEvent) => {
  keyIsPressed = true;
  key = e.key;
});

window.addEventListener("keyup", () => {
  keyIsPressed = false;
  key = "";
});

// handle mouse events
let isMouseDown = false;
let holdingInterval: NodeJS.Timeout;

const fillCell = (e: MouseEvent) => {
  if (!isMouseDown) return;

  const x = Math.floor(e.pageX / CELL_SIZE);
  const y = Math.floor(e.pageY / CELL_SIZE);

  let state: CellState;
  if (keyIsPressed) {
    switch (key) {
      case "s":
        state = CellState.Stone;
        break;
      case "e":
        state = CellState.Empty;
        break;
      case "w":
        state = CellState.Water;
        break;
      case "g":
        state = CellState.Gas;
        break;
    }
  }

  if (state === undefined) state = CellState.Sand;

  const brushSize = Math.floor(window.innerWidth / 40 / CELL_SIZE);
  GRID.makeCircle(x, y, brushSize, state);
};

window.addEventListener("mouseup", () => {
  isMouseDown = false;
  clearInterval(holdingInterval);
});
window.addEventListener("mousedown", (e: MouseEvent) => {
  isMouseDown = true;

  fillCell(e);
  holdingInterval = setInterval(() => fillCell(e), 100);
});

window.addEventListener("mousemove", (e: MouseEvent) => {
  clearInterval(holdingInterval);
  fillCell(e);
});
