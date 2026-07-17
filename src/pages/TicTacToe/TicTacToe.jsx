import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DifficultySelector from '../../components/DifficultySelector';
import { useDifficulty } from '../../hooks/useDifficulty';
import { useAppContext } from '../../context/AppContext';
import { checkWinner, getAIMove } from './ai';
import { playTicTacToePop, playTicTacToeEnd } from '../../utils/audio';

export default function TicTacToe() {
  const [difficulty, setDifficulty] = useDifficulty('ticTacToe', 'Easy');
  const { soundEnabled } = useAppContext();
  
  const [gameMode, setGameMode] = useState('single'); // 'single' | 'multi'
  const [playerPiece, setPlayerPiece] = useState('X'); // 'X' | 'O' for single player

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X'); // X always goes first
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
    if (soundEnabled) playTicTacToePop(type);
  };

  const playEndSound = (isWin) => {
    if (soundEnabled) playTicTacToeEnd(isWin);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setWinnerInfo(null);
    window.successSoundPlayedThisRound = false;
  };

  // When gameMode or playerPiece changes, immediately reset
  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const handlePlayerPieceChange = (piece) => {
    setPlayerPiece(piece);
    resetGame();
  };

  const handleCellClick = (index) => {
    if (board[index] || winnerInfo) return;

    // Block if it's Single Player and it's currently the AI's turn
    if (gameMode === 'single' && currentTurn !== playerPiece) return;

    playPopSound(currentTurn);
    const newBoard = [...board];
    newBoard[index] = currentTurn;
    setBoard(newBoard);

    const winCheck = checkWinner(newBoard);
    if (winCheck) {
      setWinnerInfo(winCheck);
      return;
    }

    setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameMode === 'single' && !winnerInfo && currentTurn !== playerPiece) {
      const aiPiece = playerPiece === 'X' ? 'O' : 'X';
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty, aiPiece);
        if (aiMove !== -1) {
          playPopSound(aiPiece);
          const newBoard = [...board];
          newBoard[aiMove] = aiPiece;
          setBoard(newBoard);
          
          const winCheck = checkWinner(newBoard);
          if (winCheck) {
            setWinnerInfo(winCheck);
          } else {
            setCurrentTurn(playerPiece);
          }
        }
      }, 500); // Small delay to feel natural
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, playerPiece, board, difficulty, winnerInfo]);

  // End Game Sound Logic
  useEffect(() => {
    if (winnerInfo && soundEnabled && !window.successSoundPlayedThisRound) {
      window.successSoundPlayedThisRound = true;
      if (gameMode === 'single') {
        playEndSound(winnerInfo.winner === playerPiece);
      } else {
        // In multiplayer, any non-draw is a win for someone
        playEndSound(winnerInfo.winner !== 'draw');
      }
    }
  }, [winnerInfo, soundEnabled, gameMode, playerPiece]);

  const getWinnerText = () => {
    if (winnerInfo.winner === 'draw') return 'It\'s a Draw!';
    if (gameMode === 'single') {
      return winnerInfo.winner === playerPiece ? 'You Won!' : 'AI Won!';
    }
    return `Player ${winnerInfo.winner} Won!`;
  };

  return (
    <>
      <Header />
      <main style={styles.container}>
        
        {/* Top Controls */}
        <div style={styles.controlsRow}>
          <div style={styles.selectorWrapper}>
            <button 
              style={gameMode === 'single' ? styles.activeTab : styles.inactiveTab}
              onClick={() => handleGameModeChange('single')}
            >
              1-Player
            </button>
            <button 
              style={gameMode === 'multi' ? styles.activeTab : styles.inactiveTab}
              onClick={() => handleGameModeChange('multi')}
            >
              2-Player
            </button>
          </div>

          {gameMode === 'single' && (
            <div style={styles.selectorWrapper}>
              <span style={{...styles.inactiveTab, paddingRight: 4, cursor: 'default', color: 'var(--color-text)'}}>You:</span>
              <button 
                style={playerPiece === 'X' ? styles.activeTab : styles.inactiveTab}
                onClick={() => handlePlayerPieceChange('X')}
              >
                X
              </button>
              <button 
                style={playerPiece === 'O' ? styles.activeTab : styles.inactiveTab}
                onClick={() => handlePlayerPieceChange('O')}
              >
                O
              </button>
            </div>
          )}
        </div>

        {gameMode === 'single' && (
          <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
        )}

        {/* Turn Indicator for Multiplayer */}
        {gameMode === 'multi' && !winnerInfo && (
          <div style={styles.turnIndicator}>
            Player {currentTurn}'s Turn
          </div>
        )}
        
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
                  disabled={!!cell || !!winnerInfo || (gameMode === 'single' && currentTurn !== playerPiece)}
                >
                  {cell}
                </button>
              ))}
            </div>
          </div>
        </div>

        {winnerInfo && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            animation: 'fadeIn 0.5s',
            pointerEvents: 'auto',
          }}>
            <div style={styles.resultBox}>
              <h2>{getWinnerText()}</h2>
              <button style={styles.replayBtn} onClick={() => resetGame()}>Play Again</button>
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
  controlsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease-out',
  },
  selectorWrapper: {
    display: 'flex',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-full)',
    padding: '4px',
    boxShadow: 'var(--shadow-sm)',
  },
  activeTab: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'var(--transition-fast)',
  },
  inactiveTab: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'var(--transition-fast)',
  },
  turnIndicator: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '18px',
    marginBottom: '16px',
    color: 'var(--color-text)',
    animation: 'fadeIn 0.3s',
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
