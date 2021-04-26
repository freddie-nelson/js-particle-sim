import { CellState } from "./Cell";
import Grid from "./Grid";

const c = document.getElementById("canvas") as HTMLCanvasElement;

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

c.addEventListener("mouseup", () => (isMouseDown = false));
c.addEventListener("mousedown", (e: MouseEvent) => {
  isMouseDown = true;
  MOUSE_X = e.clientX;
  MOUSE_Y = e.clientY;
});
c.addEventListener("mousemove", (e: MouseEvent) => {
  MOUSE_X = e.clientX;
  MOUSE_Y = e.clientY;
});
window.addEventListener("mousemove", (e: MouseEvent) => {
  if (e.pageX > MOUSE_X || e.pageY > MOUSE_Y || e.pageX < 0) isMouseDown = false;
});

// mobile
c.addEventListener("touchstart", (e: TouchEvent) => {
  isMouseDown = true;
  MOUSE_X = e.touches[0].pageX;
  MOUSE_Y = e.touches[0].pageY;
});
c.addEventListener("touchend", () => {
  isMouseDown = false;
});
c.addEventListener("touchmove", (e: TouchEvent) => {
  MOUSE_X = e.touches[0].pageX;
  MOUSE_Y = e.touches[0].pageY;
});
window.addEventListener("touchmove", (e: TouchEvent) => {
  if (e.touches[0].pageX > MOUSE_X || e.touches[0].pageY > MOUSE_Y || e.touches[0].pageX < 0)
    isMouseDown = false;
});

export function usePaintBrush(GRID: Grid) {
  return {
    paintCircle: () => {
      if (!isMouseDown) return;

      const x = Math.floor(MOUSE_X / window.CELL_SIZE);
      const y = Math.floor(MOUSE_Y / window.CELL_SIZE);

      // let state: CellState;
      // if (keyIsPressed) {
      //   switch (key) {
      //     case "s":
      //       state = CellState.Stone;
      //       break;
      //     case "e":
      //       state = CellState.Empty;
      //       break;
      //     case "w":
      //       state = CellState.Water;
      //       break;
      //     case "g":
      //       state = CellState.Gas;
      //       break;
      //   }
      // }

      // if (state === undefined) state = CellState.Sand;

      GRID.makeCircle(x, y, window.BRUSH_SIZE, window.MATERIAL);
    },
  };
}
