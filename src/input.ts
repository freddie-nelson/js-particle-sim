import { CellState } from "./Cell";
import Grid from "./Grid";

// handle key events
let keyIsPressed = false;
let key = "";

window.addEventListener("keydown", (e: KeyboardEvent) => {
  keyIsPressed = true;
  key = e.key;
});

window.addEventListener("keyup", () => {
  keyIsPressed = false;
  key = "";
});

// handle mouse events
let isMouseDown = false;
let MOUSE_X = 0;
let MOUSE_Y = 0;

window.addEventListener("mouseup", () => (isMouseDown = false));
window.addEventListener("mousedown", (e: MouseEvent) => {
  isMouseDown = true;
  MOUSE_X = e.pageX;
  MOUSE_Y = e.pageY;
});
window.addEventListener("mousemove", (e: MouseEvent) => {
  MOUSE_X = e.pageX;
  MOUSE_Y = e.pageY;
});

export function usePaintBrush(CELL_SIZE: number, GRID: Grid) {
  return {
    paintCircle: () => {
      if (!isMouseDown) return;

      const x = Math.floor(MOUSE_X / CELL_SIZE);
      const y = Math.floor(MOUSE_Y / CELL_SIZE);

      let state: CellState;
      if (keyIsPressed) {
        switch (key) {
          case "s":
            state = CellState.Stone;
            break;
          case "e":
            state = CellState.Empty;
            break;
          case "w":
            state = CellState.Water;
            break;
          case "g":
            state = CellState.Gas;
            break;
        }
      }

      if (state === undefined) state = CellState.Sand;

      const brushSize = Math.floor(window.innerWidth / 40 / CELL_SIZE);
      GRID.makeCircle(x, y, brushSize, state);
    },
  };
}
