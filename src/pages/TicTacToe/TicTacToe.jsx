import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DifficultySelector from '../../components/DifficultySelector';
import SuccessScreen from '../../components/SuccessScreen';
import { useDifficulty } from '../../hooks/useDifficulty';
import { useAppContext } from '../../context/AppContext';
import { checkWinner, getAIMove } from './ai';

export default function TicTacToe() {
  const [difficulty, setDifficulty] = useDifficulty('ticTacToe', 'Easy');
  const { soundEnabled } = useAppContext();
  
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState(null); // { winner: 'X'|'O'|'draw', line: [] }

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
      resetGame();
    }
  };

  const playPopSound = (type = 'X') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type === 'X' ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(type === 'X' ? 600 : 400, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(type === 'X' ? 1000 : 800, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) {}
  };

  const playEndSound = (isWin) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      if (isWin) {
        playNote(523.25, now, 0.4);       // C5
        playNote(659.25, now + 0.15, 0.4); // E5
        playNote(783.99, now + 0.3, 0.6);  // G5
      } else {
        // Draw or lose sound
        playNote(300, now, 0.4);
        playNote(250, now + 0.2, 0.6);
      }
    } catch(e) {}
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinnerInfo(null);
    window.successSoundPlayedThisRound = false;
  };

  const handleCellClick = (index) => {
    if (board[index] || winnerInfo || !isPlayerTurn) return;

    playPopSound('X');
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const winCheck = checkWinner(newBoard);
    if (winCheck) {
      setWinnerInfo(winCheck);
      return;
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !winnerInfo) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty);
        if (aiMove !== -1) {
          playPopSound('O');
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const winCheck = checkWinner(newBoard);
          if (winCheck) {
            setWinnerInfo(winCheck);
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500); // Small delay to make it feel natural
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, difficulty, winnerInfo]);

  useEffect(() => {
    if (winnerInfo && soundEnabled && !window.successSoundPlayedThisRound) {
      window.successSoundPlayedThisRound = true;
      playEndSound(winnerInfo.winner === 'X');
    }
  }, [winnerInfo, soundEnabled]);

  return (
    <>
      <Header />
      <main style={styles.container}>
        <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
        
        {winnerInfo ? (
          <div style={{animation: 'fadeIn 0.5s', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={styles.resultBox}>
              <h2>
                {winnerInfo.winner === 'X' ? 'You Won!' : winnerInfo.winner === 'O' ? 'AI Won!' : 'It\'s a Draw!'}
              </h2>
              <button style={styles.replayBtn} onClick={resetGame}>Play Again</button>
            </div>
          </div>
        ) : (
          <div style={styles.gameArea}>
            <div style={styles.boardContainer}>
              <div style={styles.board}>
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    style={{
                      ...styles.cell,
                      color: cell === 'X' ? 'var(--color-primary-dark)' : 'var(--color-text)',
                      backgroundColor: winnerInfo?.line?.includes(idx) ? 'var(--color-primary-alpha)' : 'var(--color-surface)',
                    }}
                    disabled={!!cell || !!winnerInfo || !isPlayerTurn}
                  >
                    {cell}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
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
  boardContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px',
    backgroundColor: 'var(--color-primary-alpha)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '8px',
    aspectRatio: '1 / 1',
    width: '100%',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(48px, 15vw, 72px)',
    fontWeight: 700,
    borderRadius: 'var(--radius-md)',
    transition: 'background-color 0.2s',
    padding: 0,
    margin: 0,
    lineHeight: 1,
  },
  resultBox: {
    textAlign: 'center',
    padding: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    backdropFilter: 'blur(10px)',
  },
  replayBtn: {
    marginTop: '24px',
    padding: '12px 24px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: 'var(--color-primary)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition-fast)',
  }
};
