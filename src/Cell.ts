export enum CellState {
  Empty,
  Sand,
  Stone,
  Water,
  Lava,
  Gas,
  Boundary,
}

export default class Cell {
  state: CellState;
  velocity: number = 0;
  static: boolean = false;

  constructor(state: CellState = CellState.Empty) {
    this.state = state;
  }

  canPass(pass: Cell): boolean {
    if (pass === undefined) return false;

    switch (this.state) {
      case CellState.Sand:
        return pass.state === CellState.Empty || pass.state === CellState.Water;
      case CellState.Water:
        return pass.state === CellState.Empty;
      case CellState.Gas:
        return (
          pass.state === CellState.Empty || pass.state === CellState.Sand || pass.state === CellState.Water
        );
      default:
        return false;
    }
  }
}
