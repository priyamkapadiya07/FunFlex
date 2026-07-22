import React from 'react';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import { Type, Smile, Hash, Calculator, CircleDot, Target, Flashlight } from 'lucide-react';

export default function Home() {
  const games = [
    {
      id: 'word-search',
      title: 'Word Search',
      description: 'Find the hidden words in the grid. Relaxing and infinite.',
      icon: Type,
      route: '/word-search',
    },
    {
      id: 'find-emoji',
      title: 'Find the Emoji',
      description: 'Spot the odd emoji out in the grid before your eyes cross.',
      icon: Smile,
      route: '/find-emoji',
    },
    {
      id: 'tic-tac-toe',
      title: 'Tic-Tac-Toe',
      description: 'Classic game. The AI ranges from silly to mathematically impossible.',
      icon: Hash,
      route: '/tic-tac-toe',
    },
    {
      id: 'mental-math',
      title: 'Mental Math',
      description: 'Sharpen your brain with rapid-fire equations. Easy to insane.',
      icon: Calculator,
      route: '/mental-math',
    },
    {
      id: 'othello',
      title: 'Othello (Reversi)',
      description: 'Classic Reversi game with an intelligent AI opponent. Outsmart the computer!',
      icon: CircleDot,
      route: '/othello',
    },
    {
      id: 'billiards',
      title: 'Premium Billiards',
      description: 'Relaxing classic physics or mind-bending trick shots. Fully offline.',
      icon: Target,
      route: '/billiards',
    },
    {
      id: 'shadow-hunter',
      title: 'Shadow Hunter',
      description: 'Premium 3D horror shooter. Use your flashlight to survive the darkness.',
      icon: Flashlight,
      route: '/shadow-hunter',
    }
  ];

  return (
    <>
      <Header />
      <main style={styles.container}>
        <div style={styles.hero}>
          <h2 style={styles.greeting}>Ready to play?</h2>
          <p style={styles.subtitle}>Select a game to start relaxing.</p>
        </div>
        
        <div style={styles.grid}>
          {games.map(game => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </main>
    </>
  );
}

const styles = {
  container: {
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  greeting: {
    fontSize: '36px',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: 'var(--color-text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  }
};
