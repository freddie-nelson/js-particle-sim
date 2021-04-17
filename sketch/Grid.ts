enum cellState {
  Empty,
  Sand,
  Stone,
  Water,
  Lava,
  Gas,
}

class Cell {
  state: cellState;
  x: number;
  y: number;

  constructor(x: number, y: number, state: cellState = cellState.Empty) {
    this.x = x;
    this.y = y;
    this.state = state;
  }
}

export default class Grid {
  cells: Cell[] = [];

  constructor(width: number, height: number, sizeOfCell: number) {
    const xCellsNum = width / sizeOfCell;
    const yCellsNum = height / sizeOfCell;

    for (let i = 0; i < xCellsNum * yCellsNum; i++) {
      this.cells[i] = new Cell(xCellsNum % yCellsNum, yCellsNum % xCellsNum);
    }
    console.log(this.cells);
  }
}
