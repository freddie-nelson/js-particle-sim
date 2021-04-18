import { Application, Graphics, autoDetectRenderer } from "pixi.js";

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: devicePixelRatio,
  antialias: false,
});

app.ticker.maxFPS = 60;

app.renderer = autoDetectRenderer({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: devicePixelRatio,
  antialias: false,
});

// make canvas always fullscreen
window.addEventListener("resize", function () {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});

document.body.appendChild(app.view);

import Grid from "./Grid";
import { CellState } from "./Cell";

const CELL_SIZE = 5;
const CELL_COUNT_X = Math.ceil(window.innerWidth / CELL_SIZE);

const GRID = new Grid(window.innerWidth, window.innerHeight, CELL_SIZE);

const GRAPHICS = new Graphics();

app.stage.addChild(GRAPHICS);

app.ticker.add(() => {
  if (GRID === undefined) return;

  // update velocity
  for (const cell of GRID.cells) {
    if (cell.state !== 0 && cell.state !== CellState.Stone && !cell.stopped) cell.velocity += 0.5;
    else if (cell.velocity !== 1) cell.velocity = 1;
  }

  GRID.update();

  // draw
  GRAPHICS.clear();

  let lastState: CellState;
  for (let i = 0; i < GRID.cells.length; i++) {
    const cell = GRID.cells[i];

    let fill: number;
    if (cell.state !== lastState) {
      switch (cell.state) {
        case CellState.Sand:
          fill = 0x624f21;
          break;
        case CellState.Stone:
          fill = 0x3b3b39;
          break;
        case CellState.Water:
          fill = 0x4b8aae;
          break;
        case CellState.Gas:
          fill = 0x595957;
          break;
        default:
          fill = 0x000000;
          break;
      }
    }

    if (cell.state !== 0) {
      // try {
      //   container.removeChildAt(INDEX_MAP[i]);
      // } catch {}

      if (cell.state !== lastState) GRAPHICS.beginFill(fill);
      lastState = cell.state;

      GRAPHICS.drawRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      // if (!INDEX_MAP[i]) INDEX_MAP[i] = container.children.length;
      // container.addChildAt(container, INDEX_MAP[i]);
      // GRID.changed[i] = false;
    }
    // } else if (GRID.changed[i] && INDEX_MAP[i]) {
    //   container.removeChildAt(INDEX_MAP[i]);

    //   for (const key in INDEX_MAP) {
    //     const val = INDEX_MAP[key];
    //     if (val > INDEX_MAP[i]) {
    //       INDEX_MAP[key] -= 1;
    //     }
    //   }

    //   delete INDEX_MAP[i];

    // }
  }
});

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
  const i = x + CELL_COUNT_X * y;

  let state: CellState;
  if (keyIsPressed) {
    switch (key) {
      case "s":
        state = CellState.Stone;
        break;
      case "e":
        state = 0;
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
  if (GRID.cells[i] !== undefined) {
    GRID.makeCircle(x, y, brushSize, state);
  }
};

window.addEventListener("mouseup", () => {
  isMouseDown = false;
  clearInterval(holdingInterval);
});
window.addEventListener("mousedown", (e: MouseEvent) => {
  isMouseDown = true;

  fillCell(e);
  holdingInterval = setInterval(() => fillCell(e), 250);
});

window.addEventListener("mousemove", (e: MouseEvent) => {
  clearInterval(holdingInterval);
  fillCell(e);
});
