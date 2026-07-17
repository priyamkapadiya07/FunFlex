export const INITIAL_BOARD = Array(64).fill(null);
INITIAL_BOARD[27] = 'W';
INITIAL_BOARD[28] = 'B';
INITIAL_BOARD[35] = 'B';
INITIAL_BOARD[36] = 'W';

export function getOpponent(player) {
  return player === 'B' ? 'W' : 'B';
}

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

export function getFlippedDiscs(board, index, player) {
  if (board[index] !== null) return [];

  const opponent = getOpponent(player);
  const row = Math.floor(index / 8);
  const col = index % 8;
  const flipped = [];

  for (let [dr, dc] of DIRS) {
    let r = row + dr;
    let c = col + dc;
    let tempFlipped = [];

    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === opponent) {
      tempFlipped.push(r * 8 + c);
      r += dr;
      c += dc;
    }

    if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === player) {
      flipped.push(...tempFlipped);
    }
  }

  return flipped;
}

export function isValidMove(board, index, player) {
  return getFlippedDiscs(board, index, player).length > 0;
}

export function getValidMoves(board, player) {
  const validMoves = [];
  for (let i = 0; i < 64; i++) {
    if (board[i] === null && isValidMove(board, i, player)) {
      validMoves.push(i);
    }
  }
  return validMoves;
}

export function makeMove(board, index, player) {
  const flipped = getFlippedDiscs(board, index, player);
  if (flipped.length === 0) return null;

  const newBoard = [...board];
  newBoard[index] = player;
  for (let idx of flipped) {
    newBoard[idx] = player;
  }
  return newBoard;
}

export function countScore(board) {
  let b = 0, w = 0;
  for (let cell of board) {
    if (cell === 'B') b++;
    else if (cell === 'W') w++;
  }
  return { B: b, W: w };
}

export function isGameOver(board) {
  const bMoves = getValidMoves(board, 'B').length;
  const wMoves = getValidMoves(board, 'W').length;
  return bMoves === 0 && wMoves === 0;
}
