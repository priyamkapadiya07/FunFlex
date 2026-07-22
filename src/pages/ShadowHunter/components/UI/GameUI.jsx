import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Battery, Heart, Zap, Crosshair, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import Joystick from './Joystick';

export default function GameUI({ isRotated = false }) {
  const { health, maxHealth, isFlashlightOn, ammo, equippedWeapon } = useGameStore();
  const setMobileMove = useGameStore(state => state.setMobileMove);
  const setMobileLook = useGameStore(state => state.setMobileLook);
  const setMobileShoot = useGameStore(state => state.setMobileShoot);
  const objectives = useGameStore(state => state.objectives);
  const gameWon = useGameStore(state => state.gameWon);
  const gameOver = useGameStore(state => state.gameOver);
  const resetGame = useGameStore(state => state.resetGame);
  
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const healthPercent = (health / maxHealth) * 100;

  return (
    <div style={styles.container}>
      {/* Top Left: Return to menu */}
      <div style={styles.topBar}>
        <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
          <Link to="/" style={styles.backButton}>Exit</Link>
          
          {/* Health Bar moved to top on mobile */}
          <div style={{...styles.hudSection, marginBottom: 0, padding: '8px 16px', minWidth: '150px'}}>
            <Heart size={20} color="var(--color-primary-dark)" />
            <div style={styles.barContainer}>
              <div style={{...styles.barFill, width: `${healthPercent}%`, backgroundColor: 'var(--color-primary-dark)'}} />
            </div>
            <span style={{fontWeight: 'bold'}}>{Math.round(health)}</span>
          </div>

          <div style={styles.objectivesPanel}>
            <h3 style={styles.objectivesTitle}>Objectives</h3>
            {objectives.map(obj => (
              <div key={obj.id} style={{...styles.objectiveItem, textDecoration: obj.completed ? 'line-through' : 'none', opacity: obj.completed ? 0.5 : 1}}>
                • {obj.text}
              </div>
            ))}
          </div>
        </div>
        
        {!isTouchDevice && (
          <div style={styles.controlsGuide}>
            <strong>Controls:</strong><br />
            WASD - Move<br />
            Mouse - Look & Shoot<br />
            F - Flashlight<br />
            Space - Jump
          </div>
        )}
      </div>

      {/* WIN SCREEN */}
      {gameWon && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', zIndex: 100, color: 'var(--color-success)'
        }}>
          <h1 style={{fontSize: '4rem', textShadow: '0 0 20px var(--color-success)'}}>POWER RESTORED</h1>
          <p style={{fontSize: '1.5rem', color: 'white', marginTop: '20px'}}>You survived the darkness.</p>
          <button 
            style={{
              marginTop: '40px', padding: '12px 24px', backgroundColor: 'var(--color-success)',
              color: '#000', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1.2rem',
              fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px var(--color-success)'
            }} 
            onClick={() => resetGame()}
          >
            Play Again
          </button>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameOver && !gameWon && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(50, 0, 0, 0.85)', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', zIndex: 100, color: 'var(--color-diff-expert)'
        }}>
          <h1 style={{fontSize: '4rem', textShadow: '0 0 20px var(--color-diff-expert)'}}>YOU DIED</h1>
          <p style={{fontSize: '1.5rem', color: 'white', marginTop: '20px'}}>The shadows consumed you.</p>
          <button 
            style={{
              marginTop: '40px', padding: '12px 24px', backgroundColor: 'var(--color-diff-expert)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1.2rem',
              fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px var(--color-diff-expert)'
            }} 
            onClick={() => resetGame()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Crosshair */}
      <div style={styles.crosshair}>
        <div style={styles.dot} />
      </div>

      {/* Bottom HUD - Hidden on Mobile */}
      {!isTouchDevice && (
        <div style={styles.bottomHud}>
          <div style={styles.hudSection}>
            <Heart size={24} color="var(--color-primary-dark)" />
            <div style={styles.barContainer}>
              <div style={{...styles.barFill, width: `${healthPercent}%`, backgroundColor: 'var(--color-primary-dark)'}} />
            </div>
            <span style={{fontWeight: 'bold'}}>{Math.round(health)}</span>
          </div>
          
          <div style={styles.weaponSection}>
            <Zap size={24} color="var(--color-diff-medium)" />
            <span style={styles.weaponText}>{equippedWeapon.toUpperCase()}</span>
            <span style={styles.ammoText}>{ammo[equippedWeapon]} / ∞</span>
          </div>
        </div>
      )}
      
      {/* Mobile Controls Overlay */}
      {isTouchDevice && (
        <div style={styles.mobileControls}>
          <div style={styles.joystickLeft}>
            <Joystick onChange={(pos) => setMobileLook(pos)} size={100} isRotated={isRotated} />
          </div>
          <div style={styles.joystickRight}>
            <button 
               style={{...styles.actionButton, backgroundColor: 'rgba(200, 50, 50, 0.6)'}} 
               onTouchStart={() => setMobileShoot(true)} 
               onTouchEnd={() => setMobileShoot(false)}
            >
               <Target size={28} color="#fff" />
            </button>
            <Joystick onChange={(pos) => setMobileMove(pos)} size={100} isRotated={isRotated} />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Let clicks pass through to the canvas
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text)',
    zIndex: 10,
  },
  topBar: {
    pointerEvents: 'auto',
  },
  backButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    textDecoration: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 'bold',
    boxShadow: 'var(--shadow-sm)',
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: '4px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    boxShadow: '0 0 4px rgba(0,0,0,0.5)',
  },
  bottomHud: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    pointerEvents: 'auto',
  },
  hudSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--color-surface)',
    padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '12px',
    minWidth: '200px',
  },
  barContainer: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--color-background)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    transition: 'width var(--transition-fast)',
  },
  weaponSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--color-surface)',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '12px',
  },
  weaponText: {
    fontWeight: 'bold',
    fontSize: '18px',
  },
  ammoText: {
    fontSize: '16px',
    color: 'var(--color-text-muted)',
  },
  objectivesPanel: {
    pointerEvents: 'auto',
    backgroundColor: 'rgba(30, 10, 10, 0.5)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    maxWidth: '200px',
    backdropFilter: 'blur(4px)',
  },
  objectivesTitle: {
    color: 'var(--color-primary-dark)',
    fontSize: '12px',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  objectiveItem: {
    fontSize: '11px',
    color: '#ddd',
    marginBottom: '2px',
  },
  controlsGuide: {
    pointerEvents: 'auto',
    backgroundColor: 'var(--color-surface)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    marginTop: '16px',
    maxWidth: '250px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--color-text-muted)',
  },
  mobileControls: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'auto',
    zIndex: 20,
  },
  joystickLeft: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  joystickRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
    backdropFilter: 'blur(4px)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
  }
};
