import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import DifficultySelector from '../../components/DifficultySelector';
import { useDifficulty } from '../../hooks/useDifficulty';
import { useAppContext } from '../../context/AppContext';
import { generateMathProblem } from './mathLogic';
import { playMentalMathPop, playErrorSound as playError } from '../../utils/audio';

export default function MentalMath() {
  const [difficulty, setDifficulty] = useDifficulty('mentalMath', 'Easy');
  const { soundEnabled } = useAppContext();
  
  const [problem, setProblem] = useState(null);
  const [streak, setStreak] = useState(0);
  const [wrongAnimation, setWrongAnimation] = useState(null); // id of wrong option button
  const [correctAnimation, setCorrectAnimation] = useState(null); // id of correct option button

  const loadPuzzle = useCallback((diff) => {
    setWrongAnimation(null);
    setCorrectAnimation(null);
    setProblem(generateMathProblem(diff));
  }, []);

  useEffect(() => {
    // Reset streak on difficulty change
    setStreak(0);
    loadPuzzle(difficulty);
  }, [difficulty, loadPuzzle]);

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
    if (soundEnabled) playMentalMathPop();
  };

  const playErrorSound = () => {
    if (soundEnabled) playError();
  };

  const handleOptionClick = (opt, idx) => {
    if (correctAnimation !== null || wrongAnimation !== null) return; // Wait for animation

    if (opt === problem.answer) {
      playPopSound();
      setCorrectAnimation(idx);
      setStreak(s => s + 1);
      setTimeout(() => loadPuzzle(difficulty), 300); // Load next quickly
    } else {
      playErrorSound();
      setWrongAnimation(idx);
      setStreak(0);
      setTimeout(() => setWrongAnimation(null), 400); // clear animation
    }
  };

  return (
    <>
      <Header />
      <main style={styles.container}>
        <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
        
        <div style={styles.gameArea}>
          {problem && (
            <div style={styles.mathCard} className="glass-panel">
              <div style={styles.streakIndicator}>
                Streak: <span style={{color: streak > 0 ? 'var(--color-success)' : 'inherit'}}>{streak} 🔥</span>
              </div>
              
              <div style={styles.equation}>
                {problem.equation}
              </div>

              <div style={styles.optionsGrid}>
                {problem.options.map((opt, idx) => {
                  let btnStyle = { ...styles.optionBtn };
                  let className = '';
                  if (correctAnimation === idx) {
                    btnStyle.backgroundColor = 'var(--color-success)';
                    btnStyle.color = '#fff';
                    btnStyle.borderColor = 'var(--color-success)';
                  } else if (wrongAnimation === idx) {
                    btnStyle.backgroundColor = 'var(--color-primary-alpha)';
                    btnStyle.borderColor = 'var(--color-primary)';
                    className = 'shake';
                  }

                  return (
                    <button
                      key={idx}
                      className={className}
                      style={btnStyle}
                      onClick={() => handleOptionClick(opt, idx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .shake {
          animation: shake 0.4s;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-2deg); }
          50% { transform: translateX(4px) rotate(2deg); }
          75% { transform: translateX(-4px) rotate(-2deg); }
          100% { transform: translateX(0); }
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
  mathCard: {
    width: '100%',
    maxWidth: '500px',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
  },
  streakIndicator: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    alignSelf: 'flex-end',
    marginTop: '-20px',
  },
  equation: {
    fontSize: 'clamp(48px, 10vw, 72px)',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
    textAlign: 'center',
    letterSpacing: '-1px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
  },
  optionBtn: {
    padding: '20px',
    fontSize: '28px',
    fontWeight: 600,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid rgba(0,0,0,0.05)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.15s ease-out',
  }
};
