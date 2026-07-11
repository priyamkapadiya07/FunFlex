import React from 'react';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import { Type, Grid3X3, BrainCircuit } from 'lucide-react';

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
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Coming soon. Train your visual memory.',
      icon: Grid3X3,
      route: '/',
    },
    {
      id: 'pattern-memory',
      title: 'Pattern Memory',
      description: 'Coming soon. Remember the glowing patterns.',
      icon: BrainCircuit,
      route: '/',
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
