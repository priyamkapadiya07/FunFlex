import React, { useState, useEffect } from 'react';
import GameMenu from './components/GameMenu';
import GameCanvas from './components/GameCanvas';

export default function Billiards() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'classic', 'trick'
  const [difficulty, setDifficulty] = useState('easy');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load preferences
  useEffect(() => {
    const savedDiff = localStorage.getItem('billiards_difficulty');
    const savedSound = localStorage.getItem('billiards_sound');
    if (savedDiff) setDifficulty(savedDiff);
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
  }, []);

  const handleStartGame = (mode, selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    localStorage.setItem('billiards_difficulty', selectedDifficulty);
    setGameState(mode);
  };

  const toggleSound = () => {
    const newSound = !soundEnabled;
    setSoundEnabled(newSound);
    localStorage.setItem('billiards_sound', newSound);
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  return (
    <div style={styles.container}>
      {gameState === 'menu' ? (
        <GameMenu 
          onStart={handleStartGame} 
          currentDifficulty={difficulty}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
        />
      ) : (
        <GameCanvas 
          mode={gameState} 
          difficulty={difficulty} 
          soundEnabled={soundEnabled}
          onMenu={returnToMenu}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100dvh', // Use dvh for mobile to account for address bars
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background)',
    position: 'relative',
    overflow: 'hidden',
  }
};
