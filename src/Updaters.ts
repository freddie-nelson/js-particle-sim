import Cell from "./Cell";
import Grid, { Neighbours } from "./Grid";

interface Position {
  y: number;
  x: number;
}

export default function useUpdaters(GRID: Grid) {
  const base = (
    y: number,
    x: number,
    rules: (last: Cell, neighbours: Neighbours, newPos: Position) => void
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
      lastY = newPos.y;
      lastX = newPos.x;

      if (current === undefined || !last.canPass(current)) {
        break;
      }

      GRID.swapCells(last, current);
    }

    return { y: lastY, x: lastX };
  };

  const sand = (y: number, x: number): Position => {
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
