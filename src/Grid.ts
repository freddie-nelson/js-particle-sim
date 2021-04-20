import Cell, { CellState } from "./Cell";

export interface Neighbours {
  top?: Cell;
  bottom?: Cell;
  right?: Cell;
  left?: Cell;
  bRight?: Cell;
  tRight?: Cell;
  bLeft?: Cell;
  tLeft?: Cell;
}

import useUpdaters from "./Updaters";

// get updaters type
const dummy = (false as true) && useUpdaters(undefined);
let updaters: typeof dummy;

export default class Grid {
  CELL_COUNT_X: number;
  CELL_COUNT_Y: number;

  cells: Cell[][] = [];
  updated: Uint8Array;

  constructor(width: number, height: number, cellSize: number) {
    const xCellsNum = Math.ceil(width / cellSize);
    this.CELL_COUNT_X = xCellsNum;

    const yCellsNum = Math.ceil(height / cellSize);
    this.CELL_COUNT_Y = yCellsNum;

    this.updated = new Uint8Array(xCellsNum * yCellsNum);

    // fill this.cells with empty cells with boundaries
    for (let y = 0; y < yCellsNum; y++) {
      const row: Cell[] = [];
      const state = y === 0 || y === yCellsNum - 1 ? CellState.Boundary : CellState.Empty;

      for (let x = 0; x < xCellsNum; x++) {
        row.push(new Cell(state));
      }

      row[0].state = CellState.Boundary;
      row[row.length - 1].state = CellState.Boundary;

      this.cells.push(row);
    }

    updaters = useUpdaters(this);
  }

  // everyCell executes callback for every cell in grid excluding boundaries
  everyCell(callback: (y: number, x: number, lastX?: number) => void, rowCallback?: (y: number) => void) {
    for (let y = 1; y < this.CELL_COUNT_Y - 1; y++) {
      if (rowCallback) rowCallback(y);

      if (y % 2 === 0) {
        for (let x = 1; x < this.CELL_COUNT_X - 1; x++) {
          callback(y, x, this.CELL_COUNT_X - 2);
        }
      } else {
        for (let x = this.CELL_COUNT_X - 2; x > 0; x--) {
          callback(y, x, 1);
        }
      }
    }
  }

  update() {
    this.everyCell((y, x) => {
      const cell = this.cells[y][x];

      // if cell has already been updated this cycle or empty, exit
      if (cell.state === CellState.Empty || this.updated[x + this.CELL_COUNT_X * y] === 1) return;

      // simulate particles
      let updatedPos: { y: number; x: number };

      switch (cell.state) {
        case CellState.Sand:
          updatedPos = updaters.sand(y, x);
          break;
        case CellState.Water:
          updatedPos = updaters.water(y, x);
          break;
        case CellState.Gas:
          // this.calculateNextPosition(y, x, false);
          break;
        default:
          break;
      }

      if (updatedPos.x === x && updatedPos.y === y) this.cells[updatedPos.y][updatedPos.x].velocity = 0;

      // mark cell as updated
      this.updated[updatedPos.x + this.CELL_COUNT_X * updatedPos.y] = 1;
    });

    // reset updated and check for newly opened cells
    for (let i = 0; i < this.updated.length; i++) {
      this.updated[i] = 0;
    }
  }

  getNeighbours(y: number, x: number): Neighbours {
    const neighbours: Neighbours = {};

    // right
    let right = false;
    if (this.isInGrid(y, x + 1)) {
      neighbours.right = this.cells[y][x + 1];
      right = true;
    }

    // left
    let left = false;
    if (this.isInGrid(y, x - 1)) {
      neighbours.left = this.cells[y][x - 1];
      left = true;
    }

    // top
    if (this.isInGrid(y - 1, x)) {
      neighbours.top = this.cells[y - 1][x];

      // top right and left
      if (right) {
        neighbours.tRight = this.cells[y - 1][x + 1];
      }
      if (left) {
        neighbours.tLeft = this.cells[y - 1][x - 1];
      }
    }

    // bottom
    if (this.isInGrid(y + 1, x)) {
      neighbours.bottom = this.cells[y + 1][x];

      // bottom right and left
      if (right) {
        neighbours.bRight = this.cells[y + 1][x + 1];
      }
      if (left) {
        neighbours.bLeft = this.cells[y + 1][x - 1];
      }
    }

    return neighbours;
  }

  emptyCell(cell: Cell, state: CellState = CellState.Empty) {
    cell.state = state;
    cell.velocity = 0;
    cell.static = false;
  }

  fillCell(cell: Cell, data: { state: number; velocity: number }) {
    cell.state = data.state;
    cell.velocity = data.velocity;
  }

  swapCells(cell: Cell, swap: Cell) {
    const data = {
      state: cell.state,
      velocity: cell.velocity,
    };

    this.fillCell(cell, { state: swap.state, velocity: swap.velocity });
    this.fillCell(swap, data);
  }

  isInGrid(y: number, x: number) {
    return y >= 1 && y < this.CELL_COUNT_Y - 1 && x >= 1 && x < this.CELL_COUNT_X - 1;
  }

  makeCircle(xCenter: number, yCenter: number, radius: number, state: CellState) {
    for (let x = xCenter - radius; x <= xCenter; x++) {
      for (let y = yCenter - radius; y <= yCenter; y++) {
        // we don't have to take the square root, it's slow
        if ((x - xCenter) * (x - xCenter) + (y - yCenter) * (y - yCenter) <= radius * radius) {
          const xSym = xCenter - (x - xCenter);
          const ySym = yCenter - (y - yCenter);

          // (x, y), (x, ySym), (xSym , y), (xSym, ySym) are in the circle
          const cells = [
            this.isInGrid(y, x) ? this.cells[y][x] : undefined,
            this.isInGrid(ySym, x) ? this.cells[ySym][x] : undefined,
            this.isInGrid(y, xSym) ? this.cells[y][xSym] : undefined,
            this.isInGrid(ySym, xSym) ? this.cells[ySym][xSym] : undefined,
          ];
          for (const cell of cells) {
            if (cell !== undefined) {
              cell.state = state;
              // this.changed[this.getCellIndex(cell)] = true;
            }
          }
        }
      }
    }
  }
}
