import Cell, { CellState } from "./Cell";
import Grid, { Neighbours } from "./Grid";

interface Position {
  y: number;
  x: number;
}

export default function useUpdaters(GRID: Grid) {
  const base = (
    y: number,
    x: number,
    rules: (cell: Cell, neighbours: Neighbours, newPos: Position) => void
  ) => {
    const cell = GRID.cells[y][x];
    let lastX = x;
    let lastY = y;

    const currentV = cell.velocity;
    for (let i = 0; i < currentV; i++) {
      const last = GRID.cells[lastY][lastX];
      const neighbours = GRID.getNeighbours(lastY, lastX);

      // calculate new position
      const newPos: Position = {
        y: lastY,
        x: lastX,
      };
      rules(last, neighbours, newPos);

      const current = GRID.cells[newPos.y][newPos.x];
      if (current === undefined) break;
      lastY = newPos.y;
      lastX = newPos.x;

      // mark cell as static if hasn't moved this cycle
      // else mark all neighbours of last position as not static as space has opened
      if (current === last) {
        current.static = true;
        break;
      } else {
        current.static = false;
        Object.keys(neighbours).forEach((k) => {
          if (neighbours[k]) neighbours[k].static = false;
        });
      }

      GRID.swapCells(last, current);
    }

    return { y: lastY, x: lastX };
  };

  const sand = (y: number, x: number): Position => {
    return base(y, x, (cell: Cell, neighbours: Neighbours, newPos: Position) => {
      let picked: Cell;
      if (cell.canPass(neighbours.bottom)) {
        // move down
        newPos.y++;
        picked = neighbours.bottom;
      } else if (cell.canPass(neighbours.bRight)) {
        // move down right
        newPos.x++;
        newPos.y++;
        picked = neighbours.bRight;
      } else if (cell.canPass(neighbours.bLeft)) {
        // move down left
        newPos.x--;
        newPos.y++;
        picked = neighbours.bLeft;
      }

      // slow sand down if it is in water
      if (picked && picked.state === CellState.Water) {
        cell.velocity -= 0.6;
        if (cell.velocity >= 8) cell.velocity = 8;
        if (cell.velocity <= 2) cell.velocity = 2;
      }
    });
  };

  const water = (y: number, x: number): Position => {
    return base(y, x, (last: Cell, neighbours: Neighbours, newPos: Position) => {
      if (last.canPass(neighbours.bottom)) {
        // move down
        newPos.y++;
      } else if (last.canPass(neighbours.bRight)) {
        // move down right
        newPos.x++;
        newPos.y++;
      } else if (last.canPass(neighbours.bLeft)) {
        // move down left
        newPos.x--;
        newPos.y++;
      } else if (last.canPass(neighbours.right)) {
        // move right
        newPos.x++;
      } else if (last.canPass(neighbours.left)) {
        // move left
        newPos.x--;
      }
    });
  };

  const gas = (y: number, x: number): Position => {
    return base(y, x, (last: Cell, neighbours: Neighbours, newPos: Position) => {
      if (last.canPass(neighbours.top)) {
        // move up
        newPos.y--;
      } else if (last.canPass(neighbours.tRight)) {
        // move up right
        newPos.x++;
        newPos.y--;
      } else if (last.canPass(neighbours.tLeft)) {
        // move up left
        newPos.x--;
        newPos.y--;
      } else if (last.canPass(neighbours.right)) {
        // move right
        newPos.x++;
      } else if (last.canPass(neighbours.left)) {
        // move left
        newPos.x--;
      }
    });
  };

  return {
    sand,
    water,
    gas,
  };
}
