import { makeMove } from './src/pages/Othello/logic/GameLogic.js';

const board = Array(64).fill(null);
board[2*8 + 4] = 'W'; // (2,4)
board[3*8 + 3] = 'W'; // (3,3)
board[3*8 + 4] = 'B'; // (3,4)
board[3*8 + 5] = 'W'; // (3,5)
board[4*8 + 3] = 'B'; // (4,3)

const res = makeMove(board, 4*8 + 4, 'B'); // Play (4,4)
console.log("Result of playing (4,4):", res !== null ? "Valid (flipped)" : "Invalid (null)");
