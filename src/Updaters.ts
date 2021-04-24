import Cell, { CellState } from "./Cell";
import Grid from "./Grid";
import Neighbours from "./Neighbours";

interface Position {
  y: number;
  x: number;
  change?: CellState;
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

      if (newPos.change !== undefined) {
        GRID.emptyCell(current, newPos.change);
        return newPos;
      }

      lastY = newPos.y;
      lastX = newPos.x;

      // mark cell as static if hasn't moved this cycle
      // else mark all neighbours of last position as not static as space has opened
      if (current === last && !(current.state === CellState.Gas || current.state === CellState.Fire)) {
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

      for (const k of Object.keys(neighbours)) {
        const n = neighbours[k];

        // state changes
        if (n.state === CellState.Lava) {
          GRID.emptyCell(n);

          newPos.y = y;
          newPos.x = x;
          newPos.change = CellState.Glass;
          break;
        }
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

      for (const k of Object.keys(neighbours)) {
        const n = neighbours[k];

        // state changes
        if (n.state === CellState.Lava) {
          GRID.emptyCell(n);

          newPos.y = y;
          newPos.x = x;
          newPos.change = CellState.Rock;
          break;
        }
      }
    });
  };

  const lava = (y: number, x: number): Position => {
    return base(y, x, (cell: Cell, neighbours: Neighbours, newPos: Position) => {
      cell.velocity = 2;

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

      for (const k of Object.keys(neighbours)) {
        const n = neighbours[k];

        // state changes
        if (n.state === CellState.Water) {
          GRID.emptyCell(n);

          newPos.y = y;
          newPos.x = x;
          newPos.change = CellState.Rock;
          break;
        } else if (n.state === CellState.Sand) {
          GRID.emptyCell(n);

          newPos.y = y;
          newPos.x = x;
          newPos.change = CellState.Glass;
          break;
        }

        // light flammable neighbours
        if (n.flammable()) {
          if (Math.random() < n.flammable()) {
            n.state = CellState.Fire;
          }
        }
      }
    });
  };

  const rock = (y: number, x: number): Position => {
    return base(y, x, (cell, neighbours, newPos) => {
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

  const gas = (y: number, x: number): Position => {
    return base(y, x, (cell: Cell, neighbours: Neighbours, newPos: Position) => {
      cell.velocity = 4;

      // dissapate
      if (Math.random() < 0.0004) {
        newPos.change = CellState.Empty;
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
      }
    });
  };

  const fire = (y: number, x: number): Position => {
    return base(y, x, (cell: Cell, neighbours: Neighbours, newPos: Position) => {
      cell.velocity = 1;

      // dissapate
      if (Math.random() < 0.03) {
        newPos.change = CellState.Empty;
        return;
      }

      // get random pos
      const nx = Math.floor(Math.random() * 3) - 1;
      const ny = Math.floor(Math.random() * 2) - 1;

      const n = neighbours.get(ny, nx);
      if (cell.canPass(n) && GRID.isInGrid(newPos.y + nx, newPos.x + ny)) {
        newPos.x += nx;
        newPos.y += ny;
      }

      for (const k of Object.keys(neighbours)) {
        const n = neighbours[k];

        // light flammable neighbours
        if (n.flammable()) {
          if (Math.random() < n.flammable()) {
            n.state = CellState.Fire;
          }
        }
      }
    });
  };

  return {
    sand,
    water,
    lava,
    gas,
    fire,
    rock,
  };
}
