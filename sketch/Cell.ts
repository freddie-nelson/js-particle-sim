export enum CellState {
  Empty,
  Sand,
  Stone,
  Water,
  Lava,
  Gas,
}

export default class Cell {
  state: CellState;
  x: number;
  y: number;
  windowX: number;
  windowY: number;
  velocity: number = 1;
  lastX: number = -1;
  lastY: number = -1;
  stopped: boolean = false;
  v = Math.floor(Math.random() * 7) - 3;

  constructor(x: number, y: number, size: number, state: CellState = CellState.Empty) {
    this.x = x;
    this.y = y;

    this.windowX = x * size;
    this.windowY = y * size;

    this.state = state;
  }

  canPass(pass: Cell): boolean {
    if (pass === undefined) return false;

    switch (this.state) {
      case CellState.Sand:
        return (
          pass.state === CellState.Empty ||
          (pass.state === CellState.Water && Math.random() > 0.2) ||
          pass.state === CellState.Gas
        );
      case CellState.Water:
        return pass.state === CellState.Empty || pass.state === CellState.Gas;
      case CellState.Gas:
        return (
          pass.state === CellState.Empty || pass.state === CellState.Sand || pass.state === CellState.Water
        );
      default:
        return false;
    }
  }
}
