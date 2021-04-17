import Cell, { cellState } from "./Cell";

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

      switch (cell.state) {
        case cellState.Sand:
          if (cell.y + 1 < this.CELL_COUNT_Y) {
            const below = this.getCell(cell.x, cell.y + 1);

            // prefer to move down
            if (below.state === cellState.Empty) {
              this.swapCells(cell, below);
            } else {
              // if cant move down try to move sideways and down
              let offset = Math.random() > 0.5 ? -1 : 1;
              if (cell.x + offset < 0 || cell.x + offset > this.CELL_COUNT_X) offset *= -1;

              let swap = this.getCell(cell.x + offset, cell.y + 1);
              if (swap.state !== cellState.Empty) swap = this.getCell(cell.x - offset, cell.y + 1);

              if (
                cell.x - offset >= 0 &&
                cell.x - offset <= this.CELL_COUNT_X &&
                swap.state === cellState.Empty
              )
                this.swapCells(cell, swap);
            }
          }
          break;

        default:
          break;
      }
    }
  }

  getCell(x: number, y: number) {
    return this.cells[x + this.CELL_COUNT_X * y];
  }

  getCellIndex(cell: Cell) {
    return cell.x + this.CELL_COUNT_X * cell.y;
  }

  emptyCell(cell: Cell) {
    cell.state = cellState.Empty;
  }

  fillCell(cell: Cell, state: cellState) {
    cell.state = state;
  }

  swapCells(cell: Cell, swap: Cell) {
    const state = cell.state;
    this.emptyCell(cell);
    this.fillCell(swap, state);
  }

  makeCircle(xCenter: number, yCenter: number, radius: number, state: cellState) {
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
