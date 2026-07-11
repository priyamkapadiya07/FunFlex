import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GameCard({ id, title, description, icon: Icon, route }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="glass-panel"
      style={{ ...styles.card, transform: isHovered ? 'translateY(-4px)' : 'translateY(0)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(route)}
    >
      <div style={styles.iconContainer}>
        <Icon size={48} color="var(--color-primary-dark)" />
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
    </div>
  );
}

const styles = {
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    backgroundColor: 'var(--color-surface)',
  },
  iconContainer: {
    padding: '16px',
    backgroundColor: 'var(--color-primary-alpha)',
    borderRadius: 'var(--radius-full)',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--color-text)',
  },
  description: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  }
};
