export enum cellState {
  Empty,
  Sand,
  Stone,
  Water,
  Lava,
  Gas,
}

export default class Cell {
  state: cellState;
  x: number;
  y: number;
  windowX: number;
  windowY: number;

  constructor(x: number, y: number, size: number, state: cellState = cellState.Empty) {
    this.x = x;
    this.y = y;

    this.windowX = x * size;
    this.windowY = y * size;

    this.state = state;
  }
}
