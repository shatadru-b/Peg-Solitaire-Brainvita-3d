import React, { useState, useCallback, useMemo } from 'react';
import { createInitialBoard, checkWinCondition } from './logic';
import { BoardState, Position, Move } from './types';
import { GameScene } from './components/Scene';

// Deep copy helper for board state
const cloneBoard = (board: BoardState): BoardState => {
  const newGrid = board.grid.map(row => [...row]);
  const newMarbles = Object.keys(board.marbles).reduce((acc, key) => {
    acc[key] = { ...board.marbles[key], position: { ...board.marbles[key].position } };
    return acc;
  }, {} as typeof board.marbles);
  return { grid: newGrid, marbles: newMarbles };
};

const App: React.FC = () => {
  // History for Undo/Redo. 
  // We store the full board state for simplicity, though move diffs are more efficient. 
  // Given grid size is small (33 items), full state copy is negligible.
  const [history, setHistory] = useState<BoardState[]>([createInitialBoard()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const currentBoard = history[currentIndex];

  const gameState = useMemo(() => checkWinCondition(currentBoard), [currentBoard]);

  const handleMove = useCallback((from: Position, to: Position) => {
    const nextBoard = cloneBoard(currentBoard);
    
    // Calculate jumped position
    const jumpR = (from.r + to.r) / 2;
    const jumpC = (from.c + to.c) / 2;

    const movingMarbleId = nextBoard.grid[from.r][from.c];
    const jumpedMarbleId = nextBoard.grid[jumpR][jumpC];

    if (!movingMarbleId || !jumpedMarbleId || movingMarbleId === 'empty' || jumpedMarbleId === 'empty') {
      console.error("Invalid move logic detected");
      return;
    }

    // Update Grid
    nextBoard.grid[from.r][from.c] = 'empty';
    nextBoard.grid[jumpR][jumpC] = 'empty'; // Remove jumped
    nextBoard.grid[to.r][to.c] = movingMarbleId;

    // Update Marble States
    nextBoard.marbles[movingMarbleId].position = to;
    nextBoard.marbles[jumpedMarbleId].removed = true;
    nextBoard.marbles[jumpedMarbleId].position = { r: -1, c: -1 }; // Nowhere

    // Update History
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(nextBoard);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [currentBoard, history, currentIndex]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    setHistory([createInitialBoard()]);
    setCurrentIndex(0);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans text-white overflow-hidden">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <GameScene board={currentBoard} onMove={handleMove} />
      </div>

      {/* HUD / UI Overlay (Glassmorphism) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200 drop-shadow-sm">
              Brainvita 3D
            </h1>
            <p className="text-white/70 text-sm mt-1">Peg Solitaire</p>
          </div>
          
          <button 
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all shadow-lg"
          >
            <span className="text-xl font-bold">?</span>
          </button>
        </header>

        {/* Center Game Over Message */}
        {gameState.isOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/30 shadow-2xl text-center animate-bounce-slow">
              <h2 className="text-4xl font-bold mb-2 text-white">
                {gameState.remaining === 1 ? "Victory!" : "Game Over"}
              </h2>
              <p className="text-xl text-white/80 mb-6">
                Marbles remaining: <span className="font-mono text-yellow-300">{gameState.remaining}</span>
              </p>
              <button 
                onClick={handleReset}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <footer className="flex justify-between items-end pointer-events-auto">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex gap-4">
            <div className="flex flex-col items-center px-2">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Remaining</span>
              <span className="text-2xl font-mono font-bold">{gameState.remaining}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleUndo}
              disabled={currentIndex === 0}
              className={`p-4 rounded-2xl backdrop-blur-md border shadow-xl transition-all flex items-center gap-2
                ${currentIndex === 0 
                  ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span className="hidden sm:inline font-medium">Undo</span>
            </button>

            <button 
              onClick={handleRedo}
              disabled={currentIndex === history.length - 1}
              className={`p-4 rounded-2xl backdrop-blur-md border shadow-xl transition-all flex items-center gap-2
                ${currentIndex === history.length - 1
                  ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
            >
              <span className="hidden sm:inline font-medium">Redo</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
              </svg>
            </button>

             <button 
              onClick={handleReset}
              className="p-4 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/30 hover:bg-red-500/30 text-red-100 shadow-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </footer>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-gray-900/90 border border-white/20 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
             <button 
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">How to Play</h2>
             <ul className="space-y-3 text-white/80 text-sm leading-relaxed">
               <li className="flex items-start gap-2">
                 <span className="bg-blue-500/20 text-blue-300 p-1 rounded text-xs font-bold mt-0.5">1</span>
                 Select a marble by clicking on it. Valid target holes will light up in green.
               </li>
               <li className="flex items-start gap-2">
                 <span className="bg-blue-500/20 text-blue-300 p-1 rounded text-xs font-bold mt-0.5">2</span>
                 Click a green hole to jump over an adjacent marble into the empty spot.
               </li>
               <li className="flex items-start gap-2">
                 <span className="bg-blue-500/20 text-blue-300 p-1 rounded text-xs font-bold mt-0.5">3</span>
                 The marble you jumped over will be removed from the board.
               </li>
               <li className="flex items-start gap-2">
                 <span className="bg-blue-500/20 text-blue-300 p-1 rounded text-xs font-bold mt-0.5">4</span>
                 <strong>Goal:</strong> Leave exactly one marble in the center of the board.
               </li>
             </ul>
             <div className="mt-6 text-center">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                >
                  Got it
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;