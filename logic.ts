import { BoardState, GRID_SIZE, isValidPos, MarbleState, Position } from './types';

export const createInitialBoard = (): BoardState => {
  const grid: (string | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const marbles: Record<string, MarbleState> = {};
  
  let marbleCount = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isValidPos(r, c)) {
        // Center hole (3,3) is initially empty
        if (r === 3 && c === 3) {
          grid[r][c] = 'empty';
        } else {
          const id = `marble-${marbleCount++}`;
          grid[r][c] = id;
          marbles[id] = {
            id,
            position: { r, c },
            removed: false,
            textureSeed: Math.random(),
          };
        }
      } else {
        grid[r][c] = null; // Invalid board area
      }
    }
  }
  return { grid, marbles };
};

export const getPossibleMoves = (board: BoardState, fromR: number, fromC: number): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { dr: -2, dc: 0, jr: -1, jc: 0 }, // Up
    { dr: 2, dc: 0, jr: 1, jc: 0 },   // Down
    { dr: 0, dc: -2, jr: 0, jc: -1 }, // Left
    { dr: 0, dc: 2, jr: 0, jc: 1 },   // Right
  ];

  directions.forEach(({ dr, dc, jr, jc }) => {
    const toR = fromR + dr;
    const toC = fromC + dc;
    const jumpR = fromR + jr;
    const jumpC = fromC + jc;

    if (isValidPos(toR, toC)) {
      // Destination must be empty
      if (board.grid[toR][toC] === 'empty') {
        // Jumped spot must have a marble
        const jumpedId = board.grid[jumpR][jumpC];
        if (jumpedId && jumpedId !== 'empty') {
          moves.push({ r: toR, c: toC });
        }
      }
    }
  });

  return moves;
};

export const checkWinCondition = (board: BoardState): { isOver: boolean; remaining: number } => {
  let remaining = 0;
  let movesAvailable = false;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = board.grid[r][c];
      if (cell && cell !== 'empty') {
        remaining++;
        if (!movesAvailable) {
           const moves = getPossibleMoves(board, r, c);
           if (moves.length > 0) movesAvailable = true;
        }
      }
    }
  }

  return { isOver: !movesAvailable, remaining };
};
