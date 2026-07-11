import React from 'react';
import { PartyPopper, RefreshCw, ArrowRight } from 'lucide-react';

export default function SuccessScreen({ onNext, onReplay }) {
  return (
    <div className="glass-panel" style={styles.container}>
      <PartyPopper size={64} color="var(--color-primary-dark)" style={styles.icon} />
      <h2 style={styles.title} className="title-gradient">Amazing!</h2>
      <p style={styles.subtitle}>You found all the words.</p>
      
      <div style={styles.actions}>
        <button style={styles.secondaryBtn} onClick={onReplay}>
          <RefreshCw size={20} />
          Play Again
        </button>
        <button style={styles.primaryBtn} onClick={onNext}>
          Next Challenge
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '48px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '40px auto',
    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
  },
  icon: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: 'var(--color-text-muted)',
    marginBottom: '32px',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    flexDirection: 'column',
    width: '100%',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-primary-dark)',
    color: '#fff',
    padding: '16px 24px',
    borderRadius: 'var(--radius-full)',
    fontSize: '18px',
    fontWeight: 600,
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition-fast)',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-primary-alpha)',
    color: 'var(--color-primary-dark)',
    padding: '16px 24px',
    borderRadius: 'var(--radius-full)',
    fontSize: '18px',
    fontWeight: 600,
    transition: 'var(--transition-fast)',
  }
};

// Add global animation via JS since we can't easily append to CSS from here
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}
