import * as p5 from "p5";
import Grid from "./Grid";

let GRID: Grid;

const sketch = (p: p5) => {
  p.setup = () => {
    GRID = new Grid(p.windowWidth, p.windowHeight, 10);
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(0);
  };

  p.mouseClicked = (e: MouseEvent) => {};
};

new p5(sketch);
