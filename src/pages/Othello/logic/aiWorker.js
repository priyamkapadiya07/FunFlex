import { getValidMoves, makeMove, isGameOver, countScore } from './GameLogic';
import { evaluateBoard } from './Heuristics';

function minimax(board, depth, alpha, beta, isMaximizing, player, opponent) {
  if (depth === 0 || isGameOver(board)) {
    return evaluateBoard(board, player);
  }

  const currentPlayer = isMaximizing ? player : opponent;
  const moves = getValidMoves(board, currentPlayer);

  if (moves.length === 0) {
    // Pass turn
    return minimax(board, depth - 1, alpha, beta, !isMaximizing, player, opponent);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const newBoard = makeMove(board, move, currentPlayer);
      const ev = minimax(newBoard, depth - 1, alpha, beta, false, player, opponent);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const newBoard = makeMove(board, move, currentPlayer);
      const ev = minimax(newBoard, depth - 1, alpha, beta, true, player, opponent);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(board, player, depth) {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return -1;
  if (moves.length === 1) return moves[0];

  const opponent = player === 'B' ? 'W' : 'B';
  let bestMove = -1;
  let maxEval = -Infinity;

  // Move ordering: prioritize corners
  const corners = [0, 7, 56, 63];
  moves.sort((a, b) => {
    if (corners.includes(a)) return -1;
    if (corners.includes(b)) return 1;
    return 0;
  });

  for (let move of moves) {
    const newBoard = makeMove(board, move, player);
    const ev = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player, opponent);
    if (ev > maxEval) {
      maxEval = ev;
      bestMove = move;
    }
  }
  return bestMove;
}

self.onmessage = function (e) {
  const { board, player, difficulty } = e.data;

  let depth = 3;
  let move = -1;

  if (difficulty === 'Easy') {
    // Mostly random, occasionally depth 1
    const moves = getValidMoves(board, player);
    if (moves.length > 0) {
      if (Math.random() > 0.3) {
        move = moves[Math.floor(Math.random() * moves.length)];
      } else {
        move = getBestMove(board, player, 1);
      }
    }
  } else {
    if (difficulty === 'Medium') depth = 3;
    else if (difficulty === 'Hard') depth = 5;
    else if (difficulty === 'Expert') {
      const emptyCount = board.filter(c => c === null).length;
      if (emptyCount <= 12) depth = 8;
      else if (emptyCount <= 20) depth = 6;
      else depth = 5;
    }

    move = getBestMove(board, player, depth);
  }

  self.postMessage(move);
};
