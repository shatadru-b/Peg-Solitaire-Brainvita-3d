export type Position = {
  r: number;
  c: number;
};

export type MarbleState = {
  id: string; // Unique ID for the marble to help with React keys/animation
  position: Position; // Current grid position. If null, it's removed from board.
  removed: boolean;
  textureSeed: number; // To generate consistent random textures per marble
};

export type BoardState = {
  grid: (string | null)[][]; // 7x7 grid storing Marble IDs. null means empty hole or invalid space. 'empty' string means valid hole but no marble.
  marbles: Record<string, MarbleState>; // Map of marble ID to state
};

export type Move = {
  from: Position;
  to: Position;
  jumped: Position;
  marbleId: string;
  jumpedMarbleId: string;
};

export const GRID_SIZE = 7;

// Helper to check if pos is valid on the English board
export const isValidPos = (r: number, c: number): boolean => {
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
  // The corners of the 7x7 grid are invalid
  // 0,0 0,1 ... 0,5 0,6
  // Invalid zones: 
  // Top-Left: (0,0), (0,1), (1,0), (1,1)
  // Top-Right: (0,5), (0,6), (1,5), (1,6)
  // Bottom-Left: (5,0), (5,1), (6,0), (6,1)
  // Bottom-Right: (5,5), (5,6), (6,5), (6,6)
  
  const invalid = (
    (r < 2 && c < 2) ||
    (r < 2 && c > 4) ||
    (r > 4 && c < 2) ||
    (r > 4 && c > 4)
  );
  return !invalid;
};