import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import DifficultySelector from '../../components/DifficultySelector';
import SuccessScreen from '../../components/SuccessScreen';
import Grid from './Grid';
import { generatePuzzle } from './logic';
import { useDifficulty } from '../../hooks/useDifficulty';
import { useAppContext } from '../../context/AppContext';
import { playStandardPop, playSuccessChime } from '../../utils/audio';
import { Loader2, Lightbulb } from 'lucide-react';

export default function WordSearch() {
  const [difficulty, setDifficulty] = useDifficulty('wordSearch', 'Easy');
  const { soundEnabled } = useAppContext();
  
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track found words: Array of objects or arrays of coordinates
  // Or simply keep track of which words string are found
  const [foundWordStrings, setFoundWordStrings] = useState([]);
  const [foundCoordinates, setFoundCoordinates] = useState([]); // Array of coordinate arrays
  const [hintedCells, setHintedCells] = useState([]);

  const loadPuzzle = useCallback(async (diff) => {
    setLoading(true);
    setFoundWordStrings([]);
    setFoundCoordinates([]);
    setHintedCells([]);
    
    // Slight delay to allow UI to show loading state if it was very fast
    const [data] = await Promise.all([
      generatePuzzle(diff),
      new Promise(res => setTimeout(res, 200))
    ]);
    
    setGridData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPuzzle(difficulty);
  }, [difficulty, loadPuzzle]);

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

  const handleWordFound = (selectedStr, reversedStr) => {
    if (!gridData) return;
    
    let foundStr = null;
    if (gridData.wordsToFind.includes(selectedStr)) {
      foundStr = selectedStr;
    } else if (gridData.wordsToFind.includes(reversedStr)) {
      foundStr = reversedStr;
    }

    if (foundStr && !foundWordStrings.includes(foundStr)) {
      setFoundWordStrings(prev => [...prev, foundStr]);
      setHintedCells([]); // Clear hint when they find a word
      
      // Premium pop sound effect
      if (soundEnabled) {
        playPopSound();
      }

      // Note: Ideally, we should receive the coordinates from Grid.jsx 
      // But for simplicity, Grid only sends the string, and we need to pass back the coordinates.
      // Wait, since Grid handles the visual state, we can just pass down the found strings and Grid can match, 
      // or we just find the coordinates again. Actually, the Grid doesn't know what was found unless we tell it.
      // Let's modify Grid to accept the found strings or we calculate coordinates here.
      // Easiest is to search the grid for the string to find coordinates.
      const coords = findWordCoordinates(gridData.grid, foundStr);
      if (coords) {
        setFoundCoordinates(prev => [...prev, coords]);
      }
    }
  };

  const playPopSound = () => {
    if (soundEnabled) playStandardPop();
  };

  const playSuccessSound = () => {
    if (soundEnabled) playSuccessChime();
  };

  const findWordCoordinates = (grid, word) => {
    const size = grid.length;
    const dirs = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === word[0]) {
          for (const [dr, dc] of dirs) {
            let matches = true;
            const coords = [];
            for (let i = 0; i < word.length; i++) {
              const nr = r + i * dr;
              const nc = c + i * dc;
              if (nr < 0 || nr >= size || nc < 0 || nc >= size || grid[nr][nc] !== word[i]) {
                matches = false;
                break;
              }
              coords.push({ row: nr, col: nc });
            }
            if (matches) return coords;
          }
        }
      }
    }
    return null;
  };

  const handleHint = () => {
    if (!gridData) return;
    const missingWords = gridData.wordsToFind.filter(w => !foundWordStrings.includes(w));
    if (missingWords.length === 0) return;
    
    // Pick a random missing word
    const randomWord = missingWords[Math.floor(Math.random() * missingWords.length)];
    const coords = findWordCoordinates(gridData.grid, randomWord);
    
    if (coords && coords.length > 0) {
      // Hint only the first letter
      setHintedCells([coords[0]]);
      
      if (soundEnabled) {
        playPopSound();
      }
    }
  };

  const isComplete = gridData && foundWordStrings.length === gridData.wordsToFind.length;

  return (
    <>
      <Header />
      <main style={styles.container}>
        <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
        
        {loading ? (
          <div style={styles.center}>
            <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>Generating puzzle...</p>
          </div>
        ) : isComplete ? (
          <div style={{animation: 'fadeIn 0.5s'}}>
            {/* Play success sound once when completed */}
            {(() => {
              if (soundEnabled && !window.successSoundPlayedThisRound) {
                window.successSoundPlayedThisRound = true;
                setTimeout(playSuccessSound, 100);
              }
              return null;
            })()}
            <SuccessScreen 
              onNext={() => {
                window.successSoundPlayedThisRound = false;
                loadPuzzle(difficulty);
              }}
              onReplay={() => {
                window.successSoundPlayedThisRound = false;
                setFoundWordStrings([]);
                setFoundCoordinates([]);
              }}
            />
          </div>
        ) : (
          <div style={styles.gameArea}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-16px' }}>
              <button 
                onClick={handleHint}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px', borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-alpha)',
                  color: 'var(--color-primary-dark)',
                  fontSize: '14px', fontWeight: 600,
                  transition: 'var(--transition-fast)'
                }}
              >
                <Lightbulb size={16} /> Tip
              </button>
            </div>
            
            <div style={styles.gridWrapper}>
              <Grid 
                grid={gridData.grid} 
                foundWords={foundCoordinates}
                hintedCells={hintedCells}
                onWordFound={handleWordFound}
                soundEnabled={soundEnabled}
              />
            </div>
            
            <div className="glass-panel" style={styles.wordList}>
              <h4 style={styles.wordListTitle}>Words to Find</h4>
              <div style={styles.wordsGrid}>
                {gridData.wordsToFind.map((word, idx) => {
                  const isFound = foundWordStrings.includes(word);
                  return (
                    <div 
                      key={idx} 
                      style={{
                        ...styles.wordItem,
                        textDecoration: isFound ? 'line-through' : 'none',
                        color: isFound ? 'var(--color-success)' : 'var(--color-text)',
                        opacity: isFound ? 0.6 : 1,
                      }}
                    >
                      {word}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Simple global animation style for loader */}
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  gameArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animation: 'fadeIn 0.3s ease-out forwards',
  },
  gridWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  wordList: {
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
  },
  wordListTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: 'var(--color-primary-dark)',
    textAlign: 'center',
  },
  wordsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  wordItem: {
    fontSize: '16px',
    fontWeight: 500,
    transition: 'var(--transition-fast)',
    wordBreak: 'break-word',
    padding: '4px 8px',
  }
};
