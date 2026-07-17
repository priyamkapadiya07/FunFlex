import { makeMove, getFlippedDiscs } from './src/pages/Othello/logic/GameLogic.js';

const board = Array(64).fill(null);
board[4*8 + 2] = 'B'; // (4,2) Black
board[4*8 + 3] = 'W'; // (4,3) White

const flipped = getFlippedDiscs(board, 4*8 + 4, 'B'); // Play Black at (4,4)
console.log("Flipped indices:", flipped);
