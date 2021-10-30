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
  Glass,
  Acid,
  FlamingMaterial,
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
    else if (pass.state === CellState.Empty) return true;

    switch (this.state) {
      case CellState.Sand:
        return (
          pass.state === CellState.Water || pass.state === CellState.Gas || pass.state === CellState.Fire
        );
      case CellState.Water:
        return pass.state === CellState.Gas || pass.state === CellState.Fire;
      case CellState.Gas:
        return pass.state === CellState.Fire;
      case CellState.Lava:
        return pass.state === CellState.Gas || pass.state === CellState.Fire;
      case CellState.Rock:
        return (
          pass.state === CellState.Water || pass.state === CellState.Gas || pass.state === CellState.Fire
        );
      default:
        return false;
    }
  }

  flammable(): number {
    switch (this.state) {
      case CellState.Gas:
        return 0.6;
      case CellState.Wood:
        return 0.008;
    }

    return 0;
  }
}
