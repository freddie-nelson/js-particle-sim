import Cell, { CellState } from "./Cell";

export interface Neighbours {
  [index: string]: Cell;
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

  // everyCell executes callback for every cell in grid
  everyCell(
    callback: (y: number, x: number, lastX?: number) => void,
    rowCallback?: (y: number) => void,
    includeBoundaries: boolean = false
  ) {
    const add = includeBoundaries ? 1 : 0;
    for (let y = 1 - add; y < this.CELL_COUNT_Y - 1 + add; y++) {
      if (rowCallback) rowCallback(y);

      if (y % 2 === 0) {
        for (let x = 1 - add; x < this.CELL_COUNT_X - 1 + add; x++) {
          callback(y, x, this.CELL_COUNT_X - 2 + add);
        }
      } else {
        for (let x = this.CELL_COUNT_X - 2 + add; x >= 1 - add; x--) {
          callback(y, x, 1 - add);
        }
      }
    }
  }

  update() {
    this.everyCell((y, x) => {
      const cell = this.cells[y][x];

      // early exit conditions
      if (
        cell.state === CellState.Empty ||
        cell.static ||
        cell.state === CellState.Stone ||
        this.updated[x + this.CELL_COUNT_X * y] === 1
      )
        return;

      // update velocity
      cell.velocity += 0.5;
      if (cell.velocity >= 15) cell.velocity = 15;

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
          updatedPos = updaters.gas(y, x);
          break;
        default:
          break;
      }

      if (this.cells[updatedPos.y][updatedPos.x].static) {
        this.cells[updatedPos.y][updatedPos.x].velocity = 0;
      }

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
            this.isInGrid(y, x) ? { y, x } : undefined,
            this.isInGrid(ySym, x) ? { y: ySym, x } : undefined,
            this.isInGrid(y, xSym) ? { y, x: xSym } : undefined,
            this.isInGrid(ySym, xSym) ? { y: ySym, x: xSym } : undefined,
          ];
          for (const pos of cells) {
            if (pos !== undefined) {
              const cell = this.cells[pos.y][pos.x];
              cell.state = state;

              const neighbours = this.getNeighbours(pos.y, pos.x);
              Object.keys(neighbours).forEach((k) => (neighbours[k].static = false));
            }
          }
        }
      }
    }
  }
}
