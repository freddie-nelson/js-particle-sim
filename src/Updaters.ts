import Cell, { CellState } from "./Cell";
import Grid from "./Grid";
import Neighbours from "./Neighbours";

interface Position {
  y: number;
  x: number;
  empty?: boolean;
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
      const neighbours = new Neighbours(GRID, lastY, lastX);

      // calculate new position
      const newPos: Position = {
        y: lastY,
        x: lastX,
      };
      rules(last, neighbours, newPos);

      const current = GRID.cells[newPos.y][newPos.x];
      if (current === undefined) break;

      if (newPos.empty) {
        GRID.emptyCell(current);
        return newPos;
      }

      lastY = newPos.y;
      lastX = newPos.x;

      // mark cell as static if hasn't moved this cycle
      // else mark all neighbours of last position as not static as space has opened
      if (current === last && current.state !== CellState.Gas) {
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
    return base(y, x, (cell: Cell, neighbours: Neighbours, newPos: Position) => {
      if (cell.canPass(neighbours.bottom)) {
        // move down
        newPos.y++;
      } else if (cell.canPass(neighbours.bRight)) {
        // move down right
        newPos.x++;
        newPos.y++;
      } else if (cell.canPass(neighbours.bLeft)) {
        // move down left
        newPos.x--;
        newPos.y++;
      } else if (cell.canPass(neighbours.right)) {
        // move right
        newPos.x++;
      } else if (cell.canPass(neighbours.left)) {
        // move left
        newPos.x--;
      }
    });
  };

  const gas = (y: number, x: number): Position => {
    return base(y, x, (cell: Cell, neighbours: Neighbours, newPos: Position) => {
      cell.velocity = 4;

      // dissapate
      if (Math.random() < 0.0004) {
        newPos.empty = true;
        return;
      }

      // get random pos
      const nx = Math.floor(Math.random() * 3) - 1;
      const ny = Math.floor(Math.random() * 3) - 1;
      if (nx === 0 && ny === 0) return;

      const n = neighbours.get(ny, nx);
      if (cell.canPass(n) && GRID.isInGrid(newPos.y, newPos.x)) {
        newPos.x += nx;
        newPos.y += ny;
        if (GRID.cells[newPos.y][newPos.x].state === CellState.Sand) console.log("passed sand");
      }
    });
  };

  return {
    sand,
    water,
    gas,
  };
}
