import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import DifficultySelector from '../../components/DifficultySelector';
import SuccessScreen from '../../components/SuccessScreen';
import { generateEmojiGrid } from './emojiPairs';
import { useDifficulty } from '../../hooks/useDifficulty';
import { useAppContext } from '../../context/AppContext';
import { playStandardPop, playErrorSound as playError, playSuccessChime } from '../../utils/audio';

export default function FindEmoji() {
  const [difficulty, setDifficulty] = useDifficulty('findEmoji', 'Easy');
  const { soundEnabled } = useAppContext();
  
  const [gridData, setGridData] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongAnimation, setWrongAnimation] = useState(null); // id of wrong cell

  const loadPuzzle = useCallback((diff) => {
    setIsComplete(false);
    setWrongAnimation(null);
    setGridData(generateEmojiGrid(diff));
  }, []);

  useEffect(() => {
    loadPuzzle(difficulty);
  }, [difficulty, loadPuzzle]);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isComplete && soundEnabled && !window.successSoundPlayedThisRound) {
      window.successSoundPlayedThisRound = true;
      setTimeout(playSuccessSound, 100);
    }
  }, [isComplete, soundEnabled]);

  // Disable pull-to-refresh on mobile while playing the game
  useEffect(() => {
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  const handleDifficultyChange = (newDiff) => {
    if (newDiff !== difficulty) {
      setDifficulty(newDiff);
    }
  };

  const playPopSound = () => {
    if (soundEnabled) playStandardPop();
  };

  const playErrorSound = () => {
    if (soundEnabled) playError();
  };

  const playSuccessSound = () => {
    if (soundEnabled) playSuccessChime();
  };

  const handleCellClick = (cell) => {
    if (isComplete) return;

    if (cell.isOdd) {
      if (soundEnabled) playPopSound();
      setIsComplete(true);
    } else {
      if (soundEnabled) playErrorSound();
      setWrongAnimation(cell.id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setWrongAnimation(null), 400); // clear animation
    }
  };

  return (
    <>
      <Header />
      <main style={styles.container}>
        <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
        
        {isComplete ? (
          <div style={{animation: 'fadeIn 0.5s'}}>
            <SuccessScreen 
              onNext={() => {
                window.successSoundPlayedThisRound = false;
                loadPuzzle(difficulty);
              }}
              onReplay={() => {
                window.successSoundPlayedThisRound = false;
                loadPuzzle(difficulty);
              }}
            />
          </div>
        ) : gridData ? (
          <div style={styles.gameArea}>
            <div style={styles.gridContainer}>
              <div 
                style={{
                  ...styles.grid,
                  gridTemplateColumns: `repeat(${gridData.size}, 1fr)`,
                  gap: gridData.size > 8 ? '2px' : '6px'
                }}
              >
                {gridData.grid.map((row) => 
                  row.map((cell) => {
                    let fSize = 'clamp(32px, 10vw, 56px)'; // easy
                    if (gridData.size >= 12) fSize = 'clamp(12px, 4vw, 24px)'; // impossible
                    else if (gridData.size >= 10) fSize = 'clamp(14px, 5vw, 28px)'; // expert
                    else if (gridData.size >= 8) fSize = 'clamp(18px, 6vw, 32px)'; // hard
                    else if (gridData.size >= 6) fSize = 'clamp(24px, 8vw, 42px)'; // medium
                    
                    return (
                      <button
                        key={cell.id}
                        onClick={() => handleCellClick(cell)}
                        style={{
                          ...styles.cell,
                          fontSize: fSize,
                          animation: wrongAnimation === cell.id ? 'shake 0.4s' : 'none'
                        }}
                        className={wrongAnimation === cell.id ? 'error-cell' : ''}
                      >
                        {cell.char}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-5deg); }
          50% { transform: translateX(4px) rotate(5deg); }
          75% { transform: translateX(-4px) rotate(-5deg); }
          100% { transform: translateX(0); }
        }
        .error-cell {
          background-color: var(--color-primary-alpha) !important;
        }
      `}</style>
    </>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  gameArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    animation: 'fadeIn 0.3s ease-out forwards',
  },
  gridContainer: {
    width: '100%',
    maxWidth: '500px',
    padding: '8px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  },
  grid: {
    display: 'grid',
    aspectRatio: '1 / 1',
    width: '100%',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 'var(--radius-sm)',
    transition: 'background-color 0.2s',
    padding: 0,
    margin: 0,
    lineHeight: 1,
  }
};
