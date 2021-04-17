import * as p5 from "p5";
import Grid from "./Grid";
import { cellState } from "./Cell";

let GRID: Grid;
const CELL_SIZE = 5;
let CELL_COUNT_X: number;

const sketch = (p: p5) => {
  p.setup = () => {
    CELL_COUNT_X = Math.ceil(p.windowWidth / CELL_SIZE);
    GRID = new Grid(p.windowWidth, p.windowHeight, CELL_SIZE);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(60);
  };

  p.draw = () => {
    p.background(0);

    for (const cell of GRID.cells) {
      switch (cell.state) {
        case cellState.Empty:
          p.noFill();
          break;
        case cellState.Sand:
          p.fill(98, 78, 33);
          break;
        case cellState.Stone:
          p.fill(59, 59, 57);
          break;
        default:
          break;
      }

      p.noStroke();

      p.rect(cell.windowX, cell.windowY, CELL_SIZE, CELL_SIZE);
    }
  };

  p.mouseClicked = (e: MouseEvent) => {
    const x = Math.floor(e.pageX / CELL_SIZE);
    const y = Math.floor(e.pageY / CELL_SIZE);
    const i = x + CELL_COUNT_X * y;

    let state: cellState;
    if (p.keyIsPressed && p.key === " ") {
      state = cellState.Stone;
    } else {
      state = cellState.Sand;
    }

    if (p.keyIsPressed && p.key === "Shift") {
      GRID.makeCircle(x, y, 10, state);
    } else {
      GRID.cells[i].state = state;
    }
  };

  p.mouseDragged = p.mouseClicked;
};

// update loop
setInterval(async () => {
  if (GRID === undefined) return;
  GRID.update();
}, 20);

new p5(sketch);
