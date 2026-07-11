import React from 'react';

const difficulties = [
  { label: 'Easy', color: 'var(--color-diff-easy)' },
  { label: 'Medium', color: 'var(--color-diff-medium)' },
  { label: 'Hard', color: 'var(--color-diff-hard)' },
  { label: 'Expert', color: 'var(--color-diff-expert)' },
  { label: 'Impossible', color: 'var(--color-diff-impossible)' }
];

export default function DifficultySelector({ current, onChange }) {
  return (
    <div style={styles.container}>
      {difficulties.map(diff => (
        <button
          key={diff.label}
          style={{
            ...styles.button,
            backgroundColor: current === diff.label ? diff.color : 'transparent',
            color: current === diff.label ? '#fff' : 'var(--color-text-muted)',
            border: `2px solid ${diff.color}`,
          }}
          onClick={() => onChange(diff.label)}
        >
          {diff.label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'var(--transition-fast)',
  }
};
