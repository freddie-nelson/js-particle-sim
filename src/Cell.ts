export enum CellState {
  Empty,
  Sand,
  Stone,
  Water,
  Lava,
  Gas,
}

export default class Cell {
  state: number;
  x: number;
  y: number;
  velocity: number = 1;
  stopped: boolean = false;

  constructor(x: number, y: number, state: CellState = CellState.Empty) {
    this.x = x;
    this.y = y;

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
