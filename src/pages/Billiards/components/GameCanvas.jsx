import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { updatePhysics, TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS, POCKETS, POCKET_RADIUS } from '../logic/physics';
import { generateClassicLayout, generateTrickShot } from '../logic/levelGenerator';

const CANVAS_PAD = 40;
const ACTUAL_WIDTH = TABLE_WIDTH + CANVAS_PAD * 2;
const ACTUAL_HEIGHT = TABLE_HEIGHT + CANVAS_PAD * 2;

// Audio Context for offline synthesized sounds
let audioCtx;
const playSound = (type, enabled) => {
  if (!enabled) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === 'hit') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'pocket') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } else if (type === 'win') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }
};

export default function GameCanvas({ mode, difficulty, soundEnabled, onMenu }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing, won
  const ballsRef = useRef([]);
  const aimRef = useRef({ active: false, startX: 0, startY: 0, currX: 0, currY: 0 });
  const isMovingRef = useRef(false);
  const timeoutRef = useRef([]);
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);

  // Initialize level
  const initLevel = () => {
    setGameState('playing');
    if (mode === 'classic') {
      ballsRef.current = generateClassicLayout(difficulty);
    } else {
      ballsRef.current = generateTrickShot(difficulty);
    }
  };

  useEffect(() => {
    initLevel();
  }, [mode, difficulty]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const portrait = rect.height > rect.width;
      setIsPortrait(portrait);

      if (portrait) {
        const scaleW = rect.width / ACTUAL_HEIGHT;
        const scaleH = rect.height / ACTUAL_WIDTH;
        setScale(Math.min(scaleW, scaleH) * 0.95); // 0.95 for padding
      } else {
        const scaleW = rect.width / ACTUAL_WIDTH;
        const scaleH = rect.height / ACTUAL_HEIGHT;
        setScale(Math.min(scaleW, scaleH) * 0.95);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, ACTUAL_WIDTH, ACTUAL_HEIGHT);

      // 1. Premium Wood Rim with Gradient
      const woodGrad = ctx.createLinearGradient(0, 0, ACTUAL_WIDTH, ACTUAL_HEIGHT);
      woodGrad.addColorStop(0, '#5D4037'); // Lighter brown
      woodGrad.addColorStop(0.5, '#3E2723'); // Darker
      woodGrad.addColorStop(1, '#271915'); // Very dark
      ctx.fillStyle = woodGrad;
      ctx.fillRect(0, 0, ACTUAL_WIDTH, ACTUAL_HEIGHT);

      // Gold inset border
      ctx.strokeStyle = '#FFC107'; // Gold
      ctx.lineWidth = 4;
      ctx.strokeRect(CANVAS_PAD - 4, CANVAS_PAD - 4, TABLE_WIDTH + 8, TABLE_HEIGHT + 8);

      ctx.save();
      ctx.translate(CANVAS_PAD, CANVAS_PAD);

      // 2. Green Felt with Spotlight effect
      const feltGrad = ctx.createRadialGradient(
        TABLE_WIDTH / 2, TABLE_HEIGHT / 2, 0,
        TABLE_WIDTH / 2, TABLE_HEIGHT / 2, Math.max(TABLE_WIDTH, TABLE_HEIGHT) * 0.8
      );
      feltGrad.addColorStop(0, '#2ecc71'); // Bright emerald green center
      feltGrad.addColorStop(1, '#115a31'); // Dark green edges
      ctx.fillStyle = feltGrad; 
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
      
      // 3. Realistic Cushions (Inner shadow + Bumper shapes)
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; // Shadow of cushion
      ctx.fillRect(0, 0, TABLE_WIDTH, 14); // Top
      ctx.fillRect(0, TABLE_HEIGHT - 14, TABLE_WIDTH, 14); // Bottom
      ctx.fillRect(0, 0, 14, TABLE_HEIGHT); // Left
      ctx.fillRect(TABLE_WIDTH - 14, 0, 14, TABLE_HEIGHT); // Right
      
      // 4. Premium Pockets
      POCKETS.forEach(p => {
        // Metallic Rim
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#7f8c8d'; // Silver
        ctx.fill();

        // Deep hole
        const holeGrad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, POCKET_RADIUS);
        holeGrad.addColorStop(0, '#000000');
        holeGrad.addColorStop(1, '#111111');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = holeGrad;
        ctx.fill();
        
        // Inner shadow inside pocket to show depth
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      // 5. 3D Balls
      ballsRef.current.forEach(ball => {
        if (!ball.active) return;
        
        // Ball shadow on the table
        ctx.beginPath();
        ctx.arc(ball.x + 5, ball.y + 5, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();
        
        // 3D Sphere shading (drawn over the color/stripes/numbers)
        const sphereGrad = ctx.createRadialGradient(
          ball.x - BALL_RADIUS * 0.3, ball.y - BALL_RADIUS * 0.3, 1,
          ball.x, ball.y, BALL_RADIUS
        );
        sphereGrad.addColorStop(0, 'rgba(255,255,255,0.7)'); // Glossy highlight
        sphereGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)');
        sphereGrad.addColorStop(0.8, 'rgba(0,0,0,0.1)');
        sphereGrad.addColorStop(1, 'rgba(0,0,0,0.7)'); // Core shadow

        if (ball.type === 'stripe') {
          // Fill white base
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = '#fdfdfd';
          ctx.fill();
          
          // Draw the stripe perfectly clipped to the circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.clip(); 
          ctx.fillStyle = ball.color;
          ctx.fillRect(ball.x - BALL_RADIUS, ball.y - BALL_RADIUS * 0.5, BALL_RADIUS * 2, BALL_RADIUS);
          ctx.restore();
        } else {
          // Solid ball
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = ball.color;
          ctx.fill();
        }

        // Number circle
        if (ball.number) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, BALL_RADIUS * 0.55, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ball.number, ball.x, ball.y + 1);
        }

        // Apply the 3D shading overlay!
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.fill();
      });

      // 6. Extended Aiming Laser
      if (aimRef.current.active && !isMovingRef.current) {
        const cue = ballsRef.current.find(b => b.type === 'cue');
        if (cue && cue.active) {
          const dx = aimRef.current.currX - aimRef.current.startX;
          const dy = aimRef.current.currY - aimRef.current.startY;
          
          // Only draw if we have pulled back a bit
          if (Math.hypot(dx, dy) > 5) {
            const length = 1000;
            const angle = Math.atan2(-dy, -dx); // opposite direction of pull
            
            ctx.beginPath();
            ctx.moveTo(cue.x, cue.y);
            ctx.lineTo(cue.x + Math.cos(angle) * length, cue.y + Math.sin(angle) * length);
            
            // Solid transparent backing
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Dotted laser line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.setLineDash([6, 8]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      
      ctx.restore();
    };

    const update = () => {
      let previousMoving = isMovingRef.current;
      isMovingRef.current = updatePhysics(ballsRef.current, (pocketedBall) => {
        playSound('pocket', soundEnabled);
        
        // Check win condition for Trick shot
        if (mode === 'trick') {
          if (pocketedBall.type === 'target') {
            setGameState('won');
            playSound('win', soundEnabled);
          } else if (pocketedBall.type === 'cue' || pocketedBall.type === 'obstacle') {
            // Failed, restart trick shot
            const tid = setTimeout(() => initLevel(), 500);
            timeoutRef.current.push(tid);
          }
        } else if (mode === 'classic') {
          if (pocketedBall.type === 'cue') {
            // Scratch! Respawn cue ball at the starting position
            const tid = setTimeout(() => {
              pocketedBall.active = true;
              pocketedBall.vx = 0;
              pocketedBall.vy = 0;
              pocketedBall.x = TABLE_WIDTH * 0.25;
              pocketedBall.y = TABLE_HEIGHT / 2;
            }, 500);
            timeoutRef.current.push(tid);
          } else {
            // Check win condition for Classic Mode
            const remainingBalls = ballsRef.current.filter(b => b.type !== 'cue' && b.active);
            if (remainingBalls.length === 0) {
              setGameState('won');
              playSound('win', soundEnabled);
            }
          }
        }
      });

      // Sound on hit (simple heuristic: if moving state changes and not from a shot)
      if (isMovingRef.current && !previousMoving && !aimRef.current.active) {
        // Technically this catches the start of the shot, but true collision sound requires deeper physics hook
        // For now, a shot sound
        playSound('hit', soundEnabled);
      }

      render();
      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      timeoutRef.current.forEach(clearTimeout);
      timeoutRef.current = [];
    };
  }, [mode, difficulty, soundEnabled]);

  // Input Handling
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    if (isPortrait) {
      // Handle rotated coordinates
      const scaleX = ACTUAL_WIDTH / rect.height; 
      const scaleY = ACTUAL_HEIGHT / rect.width; 
      return {
        x: ((clientY - rect.top) * scaleX) - CANVAS_PAD,
        y: ((rect.width - (clientX - rect.left)) * scaleY) - CANVAS_PAD
      };
    } else {
      const scaleX = ACTUAL_WIDTH / rect.width;
      const scaleY = ACTUAL_HEIGHT / rect.height;
      return {
        x: ((clientX - rect.left) * scaleX) - CANVAS_PAD,
        y: ((clientY - rect.top) * scaleY) - CANVAS_PAD
      };
    }
  };

  const handleStart = (e) => {
    if (isMovingRef.current || gameState !== 'playing') return;
    const cue = ballsRef.current.find(b => b.type === 'cue');
    if (!cue || !cue.active) return;
    
    const pos = getMousePos(e);
    aimRef.current = { active: true, startX: pos.x, startY: pos.y, currX: pos.x, currY: pos.y };
  };

  const handleMove = (e) => {
    if (!aimRef.current.active) return;
    const pos = getMousePos(e);
    aimRef.current.currX = pos.x;
    aimRef.current.currY = pos.y;
  };

  const handleEnd = () => {
    if (!aimRef.current.active) return;
    aimRef.current.active = false;
    
    const cue = ballsRef.current.find(b => b.type === 'cue');
    if (!cue || !cue.active) return;

    const dx = aimRef.current.currX - aimRef.current.startX;
    const dy = aimRef.current.currY - aimRef.current.startY;
    const force = 0.2; // Increased from 0.05
    
    // Cap maximum force
    const magnitude = Math.hypot(dx, dy);
    const maxPull = 300; // Increased from 150
    let actualDx = dx;
    let actualDy = dy;
    
    if (magnitude > maxPull) {
      actualDx = (dx / magnitude) * maxPull;
      actualDy = (dy / magnitude) * maxPull;
    }

    if (Math.hypot(actualDx, actualDy) > 5) {
      cue.applyForce(-actualDx * force, -actualDy * force);
      playSound('hit', soundEnabled);
    }
  };

  return (
    <div style={styles.container} ref={containerRef}>
      <div style={styles.header}>
        <button style={styles.iconButton} onClick={onMenu}>
          <ArrowLeft size={24} color="var(--color-primary-dark)" />
        </button>
        <div style={styles.titleContainer}>
          <span style={styles.modeText}>{mode === 'classic' ? 'Classic' : 'Trick Shot'}</span>
          <span style={styles.diffText}>{difficulty.toUpperCase()}</span>
        </div>
        <button style={styles.iconButton} onClick={initLevel}>
          <RotateCcw size={24} color="var(--color-primary-dark)" />
        </button>
      </div>

      <div style={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={ACTUAL_WIDTH}
          height={ACTUAL_HEIGHT}
          style={{
            ...styles.canvas,
            transform: `scale(${scale}) ${isPortrait ? 'rotate(90deg)' : ''}`,
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {gameState === 'won' && (
          <div style={styles.overlay}>
            <div className="glass-panel" style={styles.modal}>
              <h2>{mode === 'trick' ? '🎉 Challenge Complete' : '🎉 Table Cleared!'}</h2>
              <div style={styles.modalButtons}>
                <button style={styles.primaryButton} onClick={initLevel}>
                  {mode === 'trick' ? 'Next Challenge' : 'Play Again'}
                </button>
                <button style={styles.secondaryButton} onClick={onMenu}>Menu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a', // Dark background around table
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  iconButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-background)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modeText: {
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--color-text)',
  },
  diffText: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    letterSpacing: '1px',
  },
  canvasContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    display: 'block',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    borderRadius: '16px',
    touchAction: 'none', // Prevent scrolling on mobile while aiming
    flexShrink: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    padding: '32px',
    textAlign: 'center',
    animation: 'popIn 0.3s ease-out',
  },
  modalButtons: {
    marginTop: '24px',
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--color-primary-dark)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontWeight: 700,
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-primary-alpha)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 700,
  }
};
