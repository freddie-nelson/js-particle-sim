import Cell, { CellState } from "./Cell";

export default class Grid {
  CELL_COUNT_X: number;
  CELL_COUNT_Y: number;

  cells: Cell[] = [];
  // changed: boolean[] = [];

  constructor(width: number, height: number, cellSize: number) {
    const xCellsNum = Math.ceil(width / cellSize);
    this.CELL_COUNT_X = xCellsNum;

    const yCellsNum = Math.ceil(height / cellSize);
    this.CELL_COUNT_Y = yCellsNum;

    for (let i = 0; i < xCellsNum * yCellsNum; i++) {
      this.cells[i] = new Cell(i % xCellsNum, Math.floor(i / xCellsNum));
      // this.changed[i] = false;
    }
  }

  update() {
    // go along each row from rtl and ltr
    for (const direction of [0, 1]) {
      for (let y = this.CELL_COUNT_Y - 1; y >= 0; y--) {
        for (let x = 0; x < this.CELL_COUNT_X; x++) {
          const cell = this.getCell(direction === 0 ? x : this.CELL_COUNT_X - x - 1, y);

          // simulate particles
          switch (cell.state) {
            case CellState.Sand:
              const start = Date.now();
              this.calculateNextPosition(cell);
              if (Date.now() - start >= 10) {
                console.log(`X: ${cell.x}, Y: ${cell.y}, I: ${cell.x + this.CELL_COUNT_X * cell.y}`);
              }
              break;
            case CellState.Water:
              this.calculateNextPosition(cell, true);
              break;
            case CellState.Gas:
              this.calculateNextPosition(cell, false, -1);
              break;
            default:
              break;
          }
        }
      }
    }
  }

  calculateNextPosition(cell: Cell, spread: boolean = false, yOffset: number = 1) {
    let last = cell;
    const currentV = cell.velocity;

    for (let i = 0; i < currentV; i++) {
      // calculate xOffset
      let xOffset;
      if (last.y + yOffset < 0 || last.y + yOffset >= this.CELL_COUNT_Y) break;
      else if (cell.canPass(this.getCell(last.x, last.y + yOffset))) {
        xOffset = 0;
      } else if (last.x + 1 < this.CELL_COUNT_X && last.canPass(this.getCell(last.x + 1, last.y + yOffset))) {
        // move to right
        xOffset = 1;
      } else if (last.x - 1 >= 0 && last.canPass(this.getCell(last.x - 1, last.y + yOffset))) {
        // move to left
        xOffset = -1;
      } else if (spread) {
        yOffset = 0;
        if (last.x + 1 < this.CELL_COUNT_X && last.canPass(this.getCell(last.x + 1, last.y))) {
          xOffset = 1;
        } else if (last.x - 1 >= 0 && last.canPass(this.getCell(last.x - 1, last.y))) {
          xOffset = -1;
        }
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
      // this.changed[this.getCellIndex(cell)] = true;
      // this.changed[this.getCellIndex(last)] = true;
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
    cell.stopped = false;
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
