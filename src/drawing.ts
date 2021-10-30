import { CellState } from "./Cell";

const GRID = window.GRID;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const rects: Rect[] = [];

const findNotVisited = (visited: Uint8Array) => {
  for (let i = 0; i < visited.length; i++) {
    if (!visited[i]) {
      return {
        x: i % GRID.CELL_COUNT_X,
        y: Math.floor(i / GRID.CELL_COUNT_X),
      };
    }
  }

  return {
    x: -1,
    y: -1,
  };
};

const addRect = (
  currRect: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  state: number,
  colors: { [index: number]: string }
) => {
  if (rects[currRect]) {
    rects[currRect].x = startX;
    rects[currRect].y = startY;
    rects[currRect].width = width;
    rects[currRect].height = height;
    rects[currRect].color = colors[state];
  } else {
    rects.push({
      x: startX,
      y: startY,
      width,
      height,
      color: colors[state],
    });
  }
};

export function greedyMesh(ctx: CanvasRenderingContext2D, colors: { [index: number]: string }) {
  const cells = GRID.cells;
  const visited = new Uint8Array(GRID.CELL_COUNT_X * GRID.CELL_COUNT_Y);
  visited.set([1], 0);

  // mark empty cells as visited so they are not drawn
  for (let y = 0; y < GRID.CELL_COUNT_Y; y++) {
    for (let x = 0; x < GRID.CELL_COUNT_X; x++) {
      if (cells[y][x].state === CellState.Empty || cells[y][x].state === CellState.Boundary) {
        visited.set([1], y * GRID.CELL_COUNT_X + x);
      }
    }
  }

  let currRect = 0;
  let startX: number;
  let startY: number;
  ({ x: startX, y: startY } = findNotVisited(visited));
  let cell = startX === -1 ? undefined : cells[startY][startX];

  let notVisitedHits = 0;
  let iterations = 0;

  while (cell) {
    iterations++;
    let currX = 0;
    let currY = 0;
    let width = 0;
    let height = 0;

    // find width of rect we are trying to merge
    while (startX + width < GRID.CELL_COUNT_X && cells[startY][startX + width].state === cell.state) {
      width++;
    }

    currY = 1;
    height = 1;
    while (cells[startY + currY] && cells[startY + currY][startX + currX].state === cell.state) {
      currX++;

      if (currX > width - 1) {
        currY++;
        currX = 0;

        height++;
      }
    }

    addRect(currRect, startX, startY, width, height, cell.state, colors);
    currRect++;

    // mark cells in rect as visited
    const states = new Uint8Array(width).fill(1);
    for (let row = startY; row < startY + height; row++) {
      visited.set(states, row * GRID.CELL_COUNT_X + startX);
    }

    // console.log(currY);
    // console.log(rects[currRect - 1]);

    // console.log(visited.slice(0, GRID.CELL_COUNT_X));

    let x = startX + width + 1;
    let y = startY;
    if (visited[y * GRID.CELL_COUNT_X + x]) {
      ({ x, y } = findNotVisited(visited));
      notVisitedHits++;
    }

    if (x === -1) {
      cell = undefined;
    } else {
      cell = cells[y][x];
      startX = x;
      startY = y;
    }
  }

  for (let i = 0; i < currRect; i++) {
    ctx.fillStyle = rects[i].color;
    ctx.fillRect(
      rects[i].x * window.CELL_SIZE,
      rects[i].y * window.CELL_SIZE,
      rects[i].width * window.CELL_SIZE,
      rects[i].height * window.CELL_SIZE
    );

    ctx.strokeStyle = "red";
    ctx.strokeRect(
      rects[i].x * window.CELL_SIZE,
      rects[i].y * window.CELL_SIZE,
      rects[i].width * window.CELL_SIZE,
      rects[i].height * window.CELL_SIZE
    );
  }
}

export function linearGreedyMesh(ctx: CanvasRenderingContext2D, colors: { [index: number]: string }) {
  let lastState: CellState;
  let stateChangeMarker: number;

  for (let y = 0; y < GRID.CELL_COUNT_Y; y++) {
    lastState = CellState.Empty;
    stateChangeMarker = null;

    for (let x = 0; x < GRID.CELL_COUNT_X; x++) {
      const cell = GRID.cells[y][x];

      if (stateChangeMarker === null) {
        stateChangeMarker = x;
      }

      if (cell.state !== lastState) {
        if (lastState !== CellState.Empty && lastState !== CellState.Boundary) {
          ctx.fillStyle = colors[lastState];

          let diff = x - stateChangeMarker;

          ctx.fillRect(
            stateChangeMarker * window.CELL_SIZE,
            y * window.CELL_SIZE,
            window.CELL_SIZE * diff,
            window.CELL_SIZE
          );
        }

        stateChangeMarker = x;
        lastState = cell.state;
      }

      // draw debug cells
      // if (cell.state !== CellState.Empty && cell.state !== CellState.Boundary) {
      //   y % 2 === 0 ? (ctx.strokeStyle = "green") : (ctx.strokeStyle = "pink");
      //   ctx.strokeRect(x * window.CELL_SIZE, y * window.CELL_SIZE, window.CELL_SIZE, window.CELL_SIZE);
      //   ctx.strokeStyle = "";
      // }
    }
  }
}
