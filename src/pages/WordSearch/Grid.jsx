import React, { useState, useRef, useEffect } from 'react';

export default function Grid({ grid, foundWords, onWordFound, soundEnabled }) {
  const [selection, setSelection] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef(null);
  
  // Calculate index from touch/mouse coordinates
  const getCellFromEvent = (e) => {
    if (!gridRef.current) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Using elementFromPoint to find the cell under pointer during drag
    const el = document.elementFromPoint(clientX, clientY);
    if (el && el.dataset.row != null && el.dataset.col != null) {
      return {
        row: parseInt(el.dataset.row, 10),
        col: parseInt(el.dataset.col, 10)
      };
    }
    return null;
  };

  const startSelection = (row, col) => {
    setIsSelecting(true);
    setSelection([{ row, col }]);
  };

  const updateSelection = (row, col) => {
    if (!isSelecting || selection.length === 0) return;
    
    const start = selection[0];
    
    // Check if move is valid (horizontal, vertical, diagonal)
    const dr = row - start.row;
    const dc = col - start.col;
    
    // Must be a straight line
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return;
    
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) {
      setSelection([start]);
      return;
    }
    
    const rStep = dr === 0 ? 0 : dr / steps;
    const cStep = dc === 0 ? 0 : dc / steps;
    
    const newSelection = [];
    for (let i = 0; i <= steps; i++) {
      newSelection.push({
        row: start.row + i * rStep,
        col: start.col + i * cStep
      });
    }
    
    setSelection(newSelection);
  };

  const endSelection = () => {
    setIsSelecting(false);
    if (selection.length > 1) {
      const selectedWord = selection.map(s => grid[s.row][s.col]).join('');
      const selectedWordReversed = selectedWord.split('').reverse().join('');
      onWordFound(selectedWord, selectedWordReversed);
    }
    setSelection([]);
  };

  // Touch Event Handlers for smooth dragging
  const handleTouchMove = (e) => {
    if (!isSelecting) return;
    e.preventDefault(); // Prevent scrolling while selecting
    const cell = getCellFromEvent(e);
    if (cell) updateSelection(cell.row, cell.col);
  };

  // Prevent default context menu on long press
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const el = gridRef.current;
    if (el) {
      el.addEventListener('contextmenu', handleContextMenu);
    }
    return () => {
      if (el) el.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  if (!grid || grid.length === 0) return null;

  const size = grid.length;
  // Calculate cell size based on grid dimension to ensure it fits mobile screens
  // max width usually ~350px on small mobile, minus padding = ~300px
  // If size is 20, cell size is 15px. We will use CSS Grid to manage it.

  return (
    <div 
      ref={gridRef}
      style={{
        ...styles.gridContainer,
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`
      }}
      onMouseLeave={() => { if(isSelecting) endSelection(); }}
      onMouseUp={endSelection}
      onTouchEnd={endSelection}
      onTouchCancel={endSelection}
    >
      {grid.map((row, rIdx) => (
        row.map((letter, cIdx) => {
          const isSelected = selection.some(s => s.row === rIdx && s.col === cIdx);
          
          // Found words state
          const isFound = foundWords.some(fw => fw.some(s => s.row === rIdx && s.col === cIdx));
          
          let bgColor = 'var(--color-surface)';
          let color = 'var(--color-text)';
          let scale = 1;

          if (isSelected) {
            bgColor = 'var(--color-primary)';
            color = '#fff';
            scale = 1.1;
          } else if (isFound) {
            bgColor = 'var(--color-success-light)';
            color = 'var(--color-success)';
          }

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              data-row={rIdx}
              data-col={cIdx}
              style={{
                ...styles.cell,
                backgroundColor: bgColor,
                color,
                transform: `scale(${scale})`,
                fontSize: size > 14 ? '14px' : '18px', // Smaller font for bigger grids
              }}
              onMouseDown={() => startSelection(rIdx, cIdx)}
              onMouseEnter={() => updateSelection(rIdx, cIdx)}
              onTouchStart={(e) => {
                const cell = getCellFromEvent(e);
                if (cell) startSelection(cell.row, cell.col);
              }}
              onTouchMove={handleTouchMove}
            >
              {letter}
            </div>
          );
        })
      ))}
    </div>
  );
}

const styles = {
  gridContainer: {
    display: 'grid',
    gap: '2px',
    backgroundColor: 'var(--color-primary-alpha)', // Subtle border/gap color
    padding: '4px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    touchAction: 'none', // Critical for preventing scroll while drawing on touch devices
    userSelect: 'none', // Prevent text selection
    WebkitUserSelect: 'none',
    margin: '0 auto',
    width: '100%',
    maxWidth: '500px', // max width to prevent it getting too big on desktop
    aspectRatio: '1 / 1', // Keep it square
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s, transform 0.1s',
  }
};
