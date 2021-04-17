import Cell, { CellState } from "./Cell";

export default class Grid {
  CELL_COUNT_X: number;
  CELL_COUNT_Y: number;

  cells: Cell[] = [];

  constructor(width: number, height: number, cellSize: number) {
    const xCellsNum = Math.ceil(width / cellSize);
    this.CELL_COUNT_X = xCellsNum;

    const yCellsNum = Math.ceil(height / cellSize);
    this.CELL_COUNT_Y = yCellsNum;

    for (let i = 0; i < xCellsNum * yCellsNum; i++) {
      this.cells[i] = new Cell(i % xCellsNum, Math.floor(i / xCellsNum), cellSize);
    }
  }

  update() {
    for (let i = this.cells.length - 1; i >= 0; i--) {
      const cell = this.cells[i];

      // simulate particles
      switch (cell.state) {
        case CellState.Sand:
          this.calculateNextPosition(cell);
          break;
        case CellState.Water:
          this.calculateNextPosition(cell);
          break;
        case CellState.Gas:
          this.calculateNextPosition(cell, -1);
        default:
          break;
      }
    }

    // spread water
    for (let i = this.cells.length - 1; i >= 0; i--) {
      const cell = this.cells[i];

      if (cell.stopped && cell.state === CellState.Water) {
        let current: Cell;
        for (let i = 10; i > 0; i--) {
          if (cell.x - i - 1 >= 0 && this.getCell(cell.x - i - 1, cell.y).state === CellState.Empty) {
            current = this.getCell(cell.x - i - 1, cell.y);
          } else if (
            cell.x + i + 1 < this.CELL_COUNT_X &&
            this.getCell(cell.x + i + 1, cell.y).state === CellState.Empty
          ) {
            current = this.getCell(cell.x + i + 1, cell.y);
          }

          if (current === undefined || current.state !== CellState.Empty) break;

          this.swapCells(cell, current);
          this.calculateNextPosition(cell);
        }
      }
    }
  }

  calculateNextPosition(cell: Cell, yOffset: number = 1) {
    let last = cell;
    const currentV = cell.velocity;

    for (let i = 1; i < currentV + 1; i++) {
      // calculate xOffset
      let xOffset;
      if (last.y + yOffset >= this.CELL_COUNT_Y) break;
      else if (cell.canPass(this.getCell(last.x, last.y + yOffset))) {
        xOffset = 0;
      } else if (last.x + 1 < this.CELL_COUNT_X && last.canPass(this.getCell(last.x + 1, last.y + yOffset))) {
        xOffset = 1;
      } else if (last.x - 1 >= 0 && last.canPass(this.getCell(last.x - 1, last.y + yOffset))) {
        xOffset = -1;
      }

      // pick current
      const current = this.getCell(last.x + xOffset, last.y + yOffset);

      if (current === undefined || !cell.canPass(current)) {
        break;
      }
      last = current;
    }

    if (cell === last) {
      if (!cell.stopped) {
        this.swapCells(cell, last);
      }

      cell.stopped = true;
    } else {
      this.swapCells(cell, last);
    }
  }

  getCell(x: number, y: number) {
    return this.cells[x + this.CELL_COUNT_X * y];
  }

  getCellIndex(cell: Cell) {
    return cell.x + this.CELL_COUNT_X * cell.y;
  }

  emptyCell(cell: Cell, state: CellState = CellState.Empty) {
    cell.state = state;
    cell.velocity = 0;
    cell.lastX = -1;
    cell.lastY = -1;
  }

  fillCell(cell: Cell, data: { state: number; velocity: number; lastX: number; lastY: number }) {
    cell.state = data.state;
    cell.velocity = data.velocity;
    cell.lastX = data.lastX;
    cell.lastY = data.lastY;
  }

  swapCells(cell: Cell, swap: Cell) {
    const data = {
      state: cell.state,
      velocity: cell.velocity,
      lastX: cell.x,
      lastY: cell.y,
    };

    this.emptyCell(cell, swap.state);
    this.fillCell(swap, data);
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
            this.getCell(x, y),
            this.getCell(x, ySym),
            this.getCell(xSym, y),
            this.getCell(xSym, ySym),
          ];
          for (const cell of cells) {
            if (cell !== undefined) cell.state = state;
          }
        }
      }
    }
  }
}
