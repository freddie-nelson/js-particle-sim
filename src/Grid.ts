import Cell, { CellState } from "./Cell";

export default class Grid {
  CELL_COUNT_X: number;
  CELL_COUNT_Y: number;

  cells: Cell[][] = [];
  updated: Uint8Array;
  opened: Uint8Array;

  constructor(width: number, height: number, cellSize: number) {
    const xCellsNum = Math.ceil(width / cellSize);
    this.CELL_COUNT_X = xCellsNum;

    const yCellsNum = Math.ceil(height / cellSize);
    this.CELL_COUNT_Y = yCellsNum;

    this.updated = new Uint8Array(xCellsNum * yCellsNum);
    this.opened = new Uint8Array(xCellsNum * yCellsNum);

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
  }

  // everyCell executes callback for every cell in grid excluding boundaries
  everyCell(callback: (y: number, x: number) => void, rowCallback?: (y: number) => void) {
    for (let y = this.CELL_COUNT_Y - 1; y > 0; y--) {
      if (rowCallback) rowCallback(y);

      for (let x = 1; x < this.CELL_COUNT_X - 1; x++) {
        callback(y, x);
      }
    }
  }

  update() {
    this.everyCell((y, x) => {
      const cell = this.cells[y][x];
      // simulate particles
      switch (cell.state) {
        case CellState.Sand:
          // const start = Date.now();
          this.calculateNextPosition(y, x);
          // if (Date.now() - start >= 10) {
          //   console.log(`X: ${x}, Y: ${y}, I: ${x + this.CELL_COUNT_X * y}`);
          // }
          break;
        case CellState.Water:
          this.calculateNextPosition(y, x, true);
          break;
        case CellState.Gas:
          this.calculateNextPosition(y, x, false);
          break;
        default:
          break;
      }
    });

    // reset updated and check for newly opened cells
    for (let i = 0; i < this.updated.length; i++) {
      this.updated[i] = 0;
    }
  }

  calculateNextPosition(y: number, x: number, spread: boolean = false) {
    const cell = this.cells[y][x];
    let lastX = x;
    let lastY = y;

    // if cell has already been updated this cycle, exit
    if (this.updated[x * this.CELL_COUNT_X * y] === 1) return;

    const currentV = cell.velocity;
    for (let i = 0; i < currentV; i++) {
      const last = this.cells[lastY][lastX];

      // calculate new position
      let newX = lastX;
      let newY = lastY;
      if (last.canPass(this.cells[lastY + 1][lastX])) {
        newY++;
      } else if (last.canPass(this.cells[lastY + 1][lastX + 1])) {
        // move to right
        newX++;
        newY++;
      } else if (last.canPass(this.cells[lastY + 1][lastX - 1])) {
        // move to left
        newX--;
        newY++;
      } else if (spread) {
        if (last.canPass(this.cells[lastY][lastX + 1])) {
          newX++;
        } else if (last.canPass(this.cells[lastY][lastX - 1])) {
          newX--;
        }
      }

      // pick current
      const current = this.cells[newY][newX];

      if (current === last) {
        current.velocity = 0;
      }

      lastY = newY;
      lastX = newX;

      if (current === undefined || !last.canPass(current)) {
        break;
      }

      this.swapCells(last, current);
    }

    this.updated[lastX * this.CELL_COUNT_X * lastY] = 1;
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
    return y >= 0 && y < this.CELL_COUNT_Y && x >= 0 && x < this.CELL_COUNT_X;
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
            if (cell !== undefined && cell.state !== CellState.Boundary) {
              cell.state = state;
              // this.changed[this.getCellIndex(cell)] = true;
            }
          }
        }
      }
    }
  }
}
