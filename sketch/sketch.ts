import * as p5 from "p5";
import Grid from "./Grid";
import { CellState } from "./Cell";

let GRID: Grid;
const CELL_SIZE = 3;
let CELL_COUNT_X: number;

const sketch = (p: p5) => {
  p.setup = () => {
    CELL_COUNT_X = Math.ceil(p.windowWidth / CELL_SIZE);
    GRID = new Grid(p.windowWidth, p.windowHeight, CELL_SIZE);

    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(30);
  };

  p.draw = () => {
    p.background(0);

    const fps = p.frameRate();
    p.fill(255);
    p.stroke(0);
    p.text("FPS: " + fps.toFixed(2), 5, 12);

    for (const cell of GRID.cells) {
      switch (cell.state) {
        case CellState.Sand:
          p.fill(98 + cell.v, 78 + cell.v, 33 + cell.v);
          break;
        case CellState.Stone:
          p.fill(59 + cell.v, 59 + cell.v, 57 + cell.v);
          break;
        case CellState.Water:
          p.fill(75 + cell.v, 138 + cell.v, 174 + cell.v);
          break;
        case CellState.Gas:
          p.fill(89 + cell.v, 89 + cell.v, 87 + cell.v);
          break;
        default:
          break;
      }

      p.noStroke();

      if (cell.state !== CellState.Empty) p.rect(cell.windowX, cell.windowY, CELL_SIZE, CELL_SIZE);
    }
  };

  p.mouseClicked = (e: MouseEvent) => {
    const x = Math.floor(e.pageX / CELL_SIZE);
    const y = Math.floor(e.pageY / CELL_SIZE);
    const i = x + CELL_COUNT_X * y;

    let state: CellState;
    if (p.keyIsPressed) {
      switch (p.key) {
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

    const brushSize = Math.floor(p.windowWidth / 40 / CELL_SIZE);
    if (GRID.cells[i] !== undefined) {
      GRID.makeCircle(x, y, brushSize, state);
    }
  };

  p.mouseDragged = p.mouseClicked;
};

// main update loop
setInterval(() => {
  if (GRID === undefined) return;

  // update velocity
  for (const cell of GRID.cells) {
    if (cell.state !== CellState.Empty && cell.state !== CellState.Stone && !cell.stopped)
      cell.velocity += 1 * (Math.abs(cell.v) / 3);
    else cell.velocity = 1;
  }

  GRID.update();
}, 10);

new p5(sketch);
