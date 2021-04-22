import Cell from "./Cell";
import Grid from "./Grid";

export default class Neighbours {
  [index: string]: Cell;
  top?: Cell;
  bottom?: Cell;
  right?: Cell;
  left?: Cell;
  bRight?: Cell;
  tRight?: Cell;
  bLeft?: Cell;
  tLeft?: Cell;

  constructor(grid: Grid, y: number, x: number) {
    // right
    let right = false;
    if (grid.isInGrid(y, x + 1)) {
      this.right = grid.cells[y][x + 1];
      right = true;
    }

    // left
    let left = false;
    if (grid.isInGrid(y, x - 1)) {
      this.left = grid.cells[y][x - 1];
      left = true;
    }

    // top
    if (grid.isInGrid(y - 1, x)) {
      this.top = grid.cells[y - 1][x];

      // top right and left
      if (right) {
        this.tRight = grid.cells[y - 1][x + 1];
      }
      if (left) {
        this.tLeft = grid.cells[y - 1][x - 1];
      }
    }

    // bottom
    if (grid.isInGrid(y + 1, x)) {
      this.bottom = grid.cells[y + 1][x];

      // bottom right and left
      if (right) {
        this.bRight = grid.cells[y + 1][x + 1];
      }
      if (left) {
        this.bLeft = grid.cells[y + 1][x - 1];
      }
    }
  }

  // @ts-ignore
  get(y: number, x: number): Cell {
    if (y === 1) {
      switch (x) {
        case 0:
          return this.bottom;
        case 1:
          return this.bRight;
        case -1:
          return this.bLeft;
      }
    } else if (y === -1) {
      switch (x) {
        case 0:
          return this.top;
        case 1:
          return this.tRight;
        case -1:
          return this.tLeft;
      }
    } else {
      switch (x) {
        case 1:
          return this.right;
        case -1:
          return this.left;
      }
    }
  }
}
