import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import DifficultySelector from '../../components/DifficultySelector';
import { useDifficulty } from '../../hooks/useDifficulty';
import { useAppContext } from '../../context/AppContext';
import { Board } from './components/Board';
import { INITIAL_BOARD, getValidMoves, makeMove, countScore, isGameOver } from './logic/GameLogic';
import { recordGameResult } from './utils/statistics';
import { playOthelloFlip, playOthelloPlace, playOthelloEnd } from '../../utils/audio';
import AiWorker from './logic/aiWorker?worker';
import './Othello.css';
import { Undo2, RotateCcw, Info } from 'lucide-react';
export default function Othello() {
  const [difficulty, setDifficulty] = useDifficulty('othello', 'Medium');
  const { soundEnabled } = useAppContext();

  const [gameMode, setGameMode] = useState('single');
  const [playerColor, setPlayerColor] = useState('B');

  const [board, setBoard] = useState(INITIAL_BOARD);
  const [history, setHistory] = useState([{ board: INITIAL_BOARD, turn: 'B', lastMove: null }]);

  const [currentTurn, setCurrentTurn] = useState('B');
  const [lastMove, setLastMove] = useState(null);

  const [validMoves, setValidMoves] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [turnSkippedMessage, setTurnSkippedMessage] = useState('');
  const [showRules, setShowRules] = useState(false);

  const workerRef = useRef(null);

  const scores = countScore(board);

  useEffect(() => {
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';

    workerRef.current = new AiWorker();

    return () => {
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const playPlaceSound = () => { if (soundEnabled) playOthelloPlace(); };
  const playFlipSound = () => { if (soundEnabled) playOthelloFlip(); };
  const playEndSound = (isWin) => { if (soundEnabled) playOthelloEnd(isWin); };

  const handleDifficultyChange = (newDiff) => {
    if (newDiff !== difficulty) {
      setDifficulty(newDiff);
      resetGame();
    }
  };

  const resetGame = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = new AiWorker();
    }
    setBoard(INITIAL_BOARD);
    setHistory([{ board: INITIAL_BOARD, turn: 'B', lastMove: null }]);
    setCurrentTurn('B');
    setLastMove(null);
    setWinnerInfo(null);
    setIsAiThinking(false);
    window.othelloSuccessSoundPlayed = false;
  };

  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const handlePlayerColorChange = (color) => {
    setPlayerColor(color);
    resetGame();
  };

  const undoMove = () => {
    if (history.length <= 1 || isAiThinking) return;

    let targetState;
    if (gameMode === 'single') {
      if (history.length > 2) {
        const newHist = history.slice(0, history.length - 2);
        targetState = newHist[newHist.length - 1];
        setHistory(newHist);
      } else {
        const newHist = history.slice(0, 1);
        targetState = newHist[0];
        setHistory(newHist);
      }
    } else {
      const newHist = history.slice(0, history.length - 1);
      targetState = newHist[newHist.length - 1];
      setHistory(newHist);
    }

    if (targetState) {
      setBoard(targetState.board);
      setCurrentTurn(targetState.turn);
      setLastMove(targetState.lastMove);
      setWinnerInfo(null);
    }
  };

  // check valid moves whenever board or turn changes
  useEffect(() => {
    if (winnerInfo) return;

    const moves = getValidMoves(board, currentTurn);
    setValidMoves(moves);

    if (moves.length === 0) {
      if (!isGameOver(board)) {
        const playerName = currentTurn === 'B' ? 'Black' : 'White';
        setTurnSkippedMessage(`${playerName} has no valid moves! Skipping turn...`);
        const timer = setTimeout(() => {
          setTurnSkippedMessage('');
          const nextTurn = currentTurn === 'B' ? 'W' : 'B';
          setCurrentTurn(nextTurn);
          setHistory(prev => [...prev, { board, turn: nextTurn, lastMove }]);
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        handleGameOver(board);
      }
    }
  }, [board, currentTurn, winnerInfo, lastMove]);

  const handleGameOver = useCallback((finalBoard) => {
    const finalScores = countScore(finalBoard);
    let result = 'draw';
    if (finalScores.B > finalScores.W) result = playerColor === 'B' ? 'win' : 'loss';
    else if (finalScores.W > finalScores.B) result = playerColor === 'W' ? 'win' : 'loss';

    if (gameMode === 'multi') {
      result = finalScores.B > finalScores.W ? 'B' : (finalScores.W > finalScores.B ? 'W' : 'draw');
    }

    setWinnerInfo({ result, scores: finalScores });

    if (gameMode === 'single') {
      recordGameResult(result, difficulty, true);
    }
  }, [gameMode, playerColor, difficulty]);

  const applyMove = (index, player) => {
    const newBoard = makeMove(board, index, player);
    if (!newBoard) return;

    playPlaceSound();
    setTimeout(playFlipSound, 150);

    setBoard(newBoard);
    setLastMove(index);

    const nextTurn = player === 'B' ? 'W' : 'B';
    setCurrentTurn(nextTurn);

    setHistory(prev => [...prev, { board: newBoard, turn: nextTurn, lastMove: index }]);

    if (isGameOver(newBoard)) {
      handleGameOver(newBoard);
    }
  };

  const handleCellClick = (index) => {
    if (winnerInfo || isAiThinking) return;
    if (gameMode === 'single' && currentTurn !== playerColor) return;
    if (!validMoves.includes(index)) return;

    applyMove(index, currentTurn);
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameMode === 'single' && !winnerInfo && currentTurn !== playerColor && validMoves.length > 0) {
      setIsAiThinking(true);

      const timer = setTimeout(() => {
        workerRef.current.onmessage = (e) => {
          const aiMove = e.data;
          setIsAiThinking(false);
          if (aiMove !== -1) {
            applyMove(aiMove, currentTurn);
          }
        };
        workerRef.current.postMessage({ board, player: currentTurn, difficulty });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, playerColor, winnerInfo, difficulty, validMoves]);

  useEffect(() => {
    if (winnerInfo && soundEnabled && !window.othelloSuccessSoundPlayed) {
      window.othelloSuccessSoundPlayed = true;
      if (gameMode === 'single') {
        playEndSound(winnerInfo.result === 'win');
      } else {
        playEndSound(winnerInfo.result !== 'draw');
      }
    }
  }, [winnerInfo, soundEnabled, gameMode]);

  const getWinnerText = () => {
    if (winnerInfo.result === 'draw') return 'It\'s a Draw!';
    if (gameMode === 'single') {
      return winnerInfo.result === 'win' ? 'You Won!' : 'AI Won!';
    }
    return `Player ${winnerInfo.result === 'B' ? 'Black' : 'White'} Won!`;
  };

  return (
    <>
      <Header />
      <main className="othello-container" style={{ position: 'relative' }}>
        
        <button 
          className="othello-btn-secondary"
          onClick={() => setShowRules(true)}
          title="Game Rules"
          style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
        >
          <Info size={24} />
        </button>

        {/* Top Controls */}
        <div className="othello-controls">
          <div className="othello-selector-wrapper">
            <button
              className={gameMode === 'single' ? 'othello-tab-active' : 'othello-tab-inactive'}
              onClick={() => handleGameModeChange('single')}
            >
              1-Player
            </button>
            <button
              className={gameMode === 'multi' ? 'othello-tab-active' : 'othello-tab-inactive'}
              onClick={() => handleGameModeChange('multi')}
            >
              2-Player
            </button>
          </div>

          {gameMode === 'single' && (
            <div className="othello-selector-wrapper">
              <span className="othello-tab-inactive" style={{ paddingRight: 4, cursor: 'default', color: 'var(--color-text)' }}>You:</span>
              <button
                className={playerColor === 'B' ? 'othello-tab-active' : 'othello-tab-inactive'}
                onClick={() => handlePlayerColorChange('B')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#111' }}></div> Black
              </button>
              <button
                className={playerColor === 'W' ? 'othello-tab-active' : 'othello-tab-inactive'}
                onClick={() => handlePlayerColorChange('W')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '1px solid #ddd' }}></div> White
              </button>
            </div>
          )}
        </div>

        {gameMode === 'single' && (
          <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
        )}

        <div className="othello-game-area">
          <div className="othello-score-panel">
            <div className={`othello-score-box ${currentTurn === 'B' ? 'active' : ''}`}>
              <div className="othello-score-disc black"></div>
              <span>{scores.B}</span>
            </div>
            <div className={`othello-score-box ${currentTurn === 'W' ? 'active' : ''}`}>
              <div className="othello-score-disc white"></div>
              <span>{scores.W}</span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {isAiThinking && (
              <div className="othello-ai-thinking">
                Thinking <div className="loader-dots"><span></span><span></span><span></span></div>
              </div>
            )}
            <div className="othello-board-wrapper">
              <Board
                board={board}
                validMoves={validMoves}
                lastMove={lastMove}
                onCellClick={handleCellClick}
              />
              {turnSkippedMessage && (
                <div className="othello-toast">
                  {turnSkippedMessage}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
            <button
              className="othello-btn-secondary"
              onClick={undoMove}
              disabled={history.length <= 1 || isAiThinking}
              title="Undo Move"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
            >
              <Undo2 size={24} />
            </button>
            <button
              className="othello-btn-secondary"
              onClick={resetGame}
              title="Restart"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        {winnerInfo && (
          <div className="othello-modal-overlay">
            <div className="othello-modal">
              <h2>{getWinnerText()}</h2>
              <p>Black: {winnerInfo.scores.B}</p>
              <p>White: {winnerInfo.scores.W}</p>
              {gameMode === 'single' && <p>Difficulty: {difficulty}</p>}
              <button className="othello-btn-primary" onClick={resetGame}>Play Again</button>
              <button className="othello-btn-secondary" onClick={() => window.history.back()}>Exit</button>
            </div>
          </div>
        )}

        {showRules && (
          <div className="othello-modal-overlay">
            <div className="othello-modal" style={{ textAlign: 'left', maxWidth: '400px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: 16 }}>How to Play</h2>
              <ul style={{ paddingLeft: 20, marginBottom: 24, lineHeight: '1.6', color: 'var(--color-text)' }}>
                <li><strong>Goal:</strong> Have the majority of discs displaying your color when the board is full.</li>
                <li><strong>Placing:</strong> You must place a disc on the board so that one or more of your opponent's discs are trapped or sandwiched in a straight line between your newly placed disc and another disc of your color.</li>
                <li><strong>Flipping:</strong> All flanked opponent discs flip to your color.</li>
                <li><strong>Passing:</strong> If you cannot make a valid move that flanks and flips an opponent's disc, your turn is automatically skipped.</li>
                <li><strong>End Game:</strong> The game ends when neither player has a valid move.</li>
                <li><strong>More Info:</strong> Visit <a href="http://worldothello.org/about/about-othello/othello-rules/official-rules/english" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Reversi</a></li>
              </ul>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="othello-btn-primary" onClick={() => setShowRules(false)}>Got it!</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
