export enum CellState {
  Empty,
  Sand,
  Stone,
  Water,
  Lava,
  Gas,
  Wood,
  Fire,
  Rock,
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
    if (!pass) return false;

    switch (this.state) {
      case CellState.Sand:
        return (
          pass.state === CellState.Empty || pass.state === CellState.Water || pass.state === CellState.Gas
        );
      case CellState.Water:
        return pass.state === CellState.Empty || pass.state === CellState.Gas;
      case CellState.Gas:
        return pass.state === CellState.Empty;
      case CellState.Lava:
        return pass.state === CellState.Empty || pass.state === CellState.Gas;
      case CellState.Fire:
        return pass.state === CellState.Empty;
      case CellState.Rock:
        return (
          pass.state === CellState.Empty || pass.state === CellState.Water || pass.state === CellState.Gas
        );
      default:
        return false;
    }
  }

  flammable(): number {
    switch (this.state) {
      case CellState.Gas:
        return 0.1;
      case CellState.Wood:
        return 0.005;
    }

    return 0;
  }
}
