import React from 'react';

export function Disc({ color }) {
  if (!color) return null;
  return (
    <div className={`othello-disc-container ${color === 'B' ? 'black' : 'white'}`}>
      <div className="othello-disc-side othello-disc-black"></div>
      <div className="othello-disc-side othello-disc-white" style={{ transform: 'rotateY(180deg)' }}></div>
    </div>
  );
}

export function Cell({ index, value, isValidMove, isLastMove, onClick }) {
  return (
    <div 
      className={`othello-cell ${isValidMove ? 'valid-move' : ''}`} 
      onClick={() => onClick(index)}
    >
      <Disc color={value} />
      {isValidMove && <div className="othello-valid-indicator"></div>}
      {isLastMove && <div className="othello-last-move-indicator"></div>}
    </div>
  );
}

export function Board({ board, validMoves, lastMove, onCellClick }) {
  return (
    <div className="othello-board">
      {board.map((cell, idx) => (
        <Cell 
          key={idx}
          index={idx}
          value={cell}
          isValidMove={validMoves.includes(idx)}
          isLastMove={lastMove === idx}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}
