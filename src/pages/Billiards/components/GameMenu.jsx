import React, { useState } from 'react';
import { ArrowLeft, Target, Disc, Volume2, VolumeX, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameMenu({ onStart, currentDifficulty, soundEnabled, toggleSound }) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [localDiff, setLocalDiff] = useState(currentDifficulty);

  const difficulties = [
    { id: 'easy', label: 'Easy', color: 'var(--color-diff-easy)' },
    { id: 'medium', label: 'Medium', color: 'var(--color-diff-medium)' },
    { id: 'hard', label: 'Hard', color: 'var(--color-diff-hard)' },
    { id: 'expert', label: 'Expert', color: 'var(--color-diff-expert)' },
    { id: 'impossible', label: 'Impossible', color: 'var(--color-diff-impossible)' },
  ];

  return (
    <div style={styles.menuContainer}>
      <div style={styles.header}>
        <button style={styles.iconButton} onClick={() => navigate('/')}>
          <ArrowLeft size={24} color="var(--color-primary-dark)" />
        </button>
        <button style={styles.iconButton} onClick={() => setShowSettings(!showSettings)}>
          <Settings size={24} color="var(--color-primary-dark)" />
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title} className="title-gradient">Billiards</h1>
        
        {showSettings ? (
          <div className="glass-panel" style={styles.settingsPanel}>
            <h2 style={styles.subtitle}>Settings</h2>
            
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>Sound Effects</span>
              <button style={styles.soundButton} onClick={toggleSound}>
                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>

            <div style={styles.settingRowVertical}>
              <span style={styles.settingLabel}>Difficulty</span>
              <div style={styles.difficultyGrid}>
                {difficulties.map(d => (
                  <button 
                    key={d.id}
                    style={{
                      ...styles.diffButton,
                      backgroundColor: localDiff === d.id ? d.color : 'transparent',
                      color: localDiff === d.id ? '#fff' : 'var(--color-text)',
                      borderColor: d.color
                    }}
                    onClick={() => setLocalDiff(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button style={styles.doneButton} onClick={() => setShowSettings(false)}>
              Done
            </button>
          </div>
        ) : (
          <div style={styles.modeCards}>
            <button 
              className="glass-panel" 
              style={styles.card}
              onClick={() => onStart('classic', localDiff)}
            >
              <Disc size={48} color="var(--color-primary)" style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Classic</h3>
              <p style={styles.cardDesc}>Relaxing practice mode with a standard table setup. Play at your own pace.</p>
            </button>

            <button 
              className="glass-panel" 
              style={styles.card}
              onClick={() => onStart('trick', localDiff)}
            >
              <Target size={48} color="var(--color-primary-dark)" style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Trick Shot</h3>
              <p style={styles.cardDesc}>Puzzle mode. Complete the procedurally generated shot challenges.</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  menuContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  iconButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform var(--transition-fast)',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    fontSize: '48px',
    fontWeight: 800,
    marginBottom: '48px',
    textAlign: 'center',
  },
  modeCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  card: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
    cursor: 'pointer',
  },
  cardIcon: {
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '16px',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  settingsPanel: {
    width: '100%',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
    textAlign: 'center',
    marginBottom: '16px',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingRowVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  settingLabel: {
    fontSize: '18px',
    fontWeight: 600,
  },
  soundButton: {
    padding: '8px',
    color: 'var(--color-primary-dark)',
  },
  difficultyGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  diffButton: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-full)',
    border: '2px solid',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all var(--transition-fast)',
  },
  doneButton: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-primary-dark)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 700,
    boxShadow: 'var(--shadow-sm)',
  }
};
