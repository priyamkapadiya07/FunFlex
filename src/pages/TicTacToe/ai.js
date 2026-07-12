export function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: lines[i] };
    }
  }
  if (!board.includes(null)) return { winner: 'draw' };
  return null;
}

export function getAIMove(board, difficulty, aiPiece = 'O') {
  const playerPiece = aiPiece === 'X' ? 'O' : 'X';

  function minimax(board, depth, isMaximizing) {
    const result = checkWinner(board);
    if (result) {
      if (result.winner === aiPiece) return 10 - depth;
      if (result.winner === playerPiece) return depth - 10;
      return 0; // draw
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = aiPiece;
          let score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = playerPiece;
          let score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  const availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
  if (availableMoves.length === 0) return -1;

  let optimalProb = 0;
  switch (difficulty) {
    case 'Easy': optimalProb = 0; break;
    case 'Medium': optimalProb = 0.4; break;
    case 'Hard': optimalProb = 0.7; break;
    case 'Expert': optimalProb = 0.9; break;
    case 'Impossible': optimalProb = 1.0; break;
  }

  // Random move if we don't hit the optimal probability
  if (Math.random() > optimalProb) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Optimal move via Minimax
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiPiece;
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}
