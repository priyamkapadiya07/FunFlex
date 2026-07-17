import { getValidMoves, countScore } from './GameLogic';

// Standard 8x8 weight matrix for Othello
const WEIGHT_MATRIX = [
  120, -20,  20,   5,   5,  20, -20, 120,
  -20, -40,  -5,  -5,  -5,  -5, -40, -20,
   20,  -5,  15,   3,   3,  15,  -5,  20,
    5,  -5,   3,   3,   3,   3,  -5,   5,
    5,  -5,   3,   3,   3,   3,  -5,   5,
   20,  -5,  15,   3,   3,  15,  -5,  20,
  -20, -40,  -5,  -5,  -5,  -5, -40, -20,
  120, -20,  20,   5,   5,  20, -20, 120
];

export function evaluateBoard(board, player) {
  const opponent = player === 'B' ? 'W' : 'B';
  let myScore = 0;
  let oppScore = 0;
  
  // 1. Matrix Weight & Parity
  let myTiles = 0, oppTiles = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i] === player) {
      myScore += WEIGHT_MATRIX[i];
      myTiles++;
    } else if (board[i] === opponent) {
      oppScore += WEIGHT_MATRIX[i];
      oppTiles++;
    }
  }
  
  // 2. Mobility
  const myMoves = getValidMoves(board, player).length;
  const oppMoves = getValidMoves(board, opponent).length;
  
  // 3. Corners
  const corners = [0, 7, 56, 63];
  let myCorners = 0, oppCorners = 0;
  corners.forEach(c => {
    if (board[c] === player) myCorners++;
    else if (board[c] === opponent) oppCorners++;
  });
  
  // Phase of the game
  const totalTiles = myTiles + oppTiles;
  
  let p = 0;
  if (myTiles > oppTiles) p = (100.0 * myTiles) / (myTiles + oppTiles);
  else if (myTiles < oppTiles) p = -(100.0 * oppTiles) / (myTiles + oppTiles);
  else p = 0;

  let m = 0;
  if (myMoves > oppMoves) m = (100.0 * myMoves) / (myMoves + oppMoves + 1);
  else if (myMoves < oppMoves) m = -(100.0 * oppMoves) / (myMoves + oppMoves + 1);
  else m = 0;

  let c = 0;
  if (myCorners > oppCorners) c = (100.0 * myCorners) / (myCorners + oppCorners);
  else if (myCorners < oppCorners) c = -(100.0 * oppCorners) / (myCorners + oppCorners);
  else c = 0;

  // Weight combination changes over time
  // Early game: mobility and corners are king, parity doesn't matter
  // Late game: parity (actual disc count) matters more
  let score = 0;
  if (totalTiles < 20) {
    score = (10 * myScore - 10 * oppScore) + 50 * m + 1000 * c;
  } else if (totalTiles < 50) {
    score = (10 * myScore - 10 * oppScore) + 20 * m + 1000 * c + 10 * p;
  } else {
    score = (10 * myScore - 10 * oppScore) + 1000 * c + 500 * p;
  }
  
  return score;
}
