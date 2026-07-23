import React, { useRef, useEffect, useState } from 'react';
import GameUI from './components/UI/GameUI';
import { useGameStore } from './store/useGameStore';
import { playShootSound, playMonsterHit } from '../../utils/audio';

// 2D Game Constants
const TILE_SIZE = 50;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 40;

const GAME_SPEED = 200; // pixels per second
const SPRINT_MULTIPLIER = 1.5;
const ENEMY_SPEED = 100;
const BULLET_SPEED = 500;

const circleRectCollide = (cx, cy, cr, rx, ry, rw, rh) => {
  let testX = cx;
  let testY = cy;
  if (cx < rx) testX = rx; else if (cx > rx + rw) testX = rx + rw;
  if (cy < ry) testY = ry; else if (cy > ry + rh) testY = ry + rh;
  let distX = cx - testX;
  let distY = cy - testY;
  let distance = Math.sqrt((distX * distX) + (distY * distY));
  return distance <= cr;
};

export default function ShadowHunter() {
  const canvasRef = useRef(null);
  const takeDamage = useGameStore(state => state.takeDamage);
  const gameWon = useGameStore(state => state.gameWon);
  const gameOver = useGameStore(state => state.gameOver);
  const setGameWon = useGameStore(state => state.setGameWon);
  const completeObjective = useGameStore(state => state.completeObjective);
  const resetGame = useGameStore(state => state.resetGame);

  // Call resetGame on mount to ensure fresh state
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Game Engine State (Refs for performance outside React state)
  const gameState = useRef({
    player: { x: MAP_WIDTH * TILE_SIZE / 2, y: MAP_HEIGHT * TILE_SIZE / 2, radius: 15, angle: 0 },
    keys: { w: false, a: false, s: false, d: false, shift: false },
    mouse: { x: 0, y: 0, down: false },
    bullets: [],
    enemies: [],
    particles: [],
    walls: [],
    generator: { x: MAP_WIDTH * TILE_SIZE / 2, y: MAP_HEIGHT * TILE_SIZE / 2 - 800, width: 60, height: 60, active: false },
    lastTime: performance.now(),
    lastShootTime: 0,
    camera: { x: 0, y: 0 },
    spawnTimer: 0
  });

  // Init Map (Walls)
  useEffect(() => {
    // Also re-init state when game resets
    if (gameOver || gameWon) return;

    const state = gameState.current;

    // Reset player position and state
    state.player.x = MAP_WIDTH * TILE_SIZE / 2;
    state.player.y = MAP_HEIGHT * TILE_SIZE / 2;
    state.generator.active = false;
    state.enemies = [];
    state.bullets = [];

    state.walls = [];

    // Outer boundaries
    state.walls.push({ x: 0, y: 0, width: MAP_WIDTH * TILE_SIZE, height: TILE_SIZE });
    state.walls.push({ x: 0, y: 0, width: TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE });
    state.walls.push({ x: 0, y: (MAP_HEIGHT - 1) * TILE_SIZE, width: MAP_WIDTH * TILE_SIZE, height: TILE_SIZE });
    state.walls.push({ x: (MAP_WIDTH - 1) * TILE_SIZE, y: 0, width: TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE });

    // Randomize Generator Location (Must be at least 700px from center player at 1000, 1000)
    let validGen = false;
    while (!validGen) {
      state.generator.x = Math.random() * (MAP_WIDTH - 6) * TILE_SIZE + 3 * TILE_SIZE;
      state.generator.y = Math.random() * (MAP_HEIGHT - 6) * TILE_SIZE + 3 * TILE_SIZE;
      const dx = state.generator.x - 1000;
      const dy = state.generator.y - 1000;
      if (Math.sqrt(dx * dx + dy * dy) > 700) validGen = true;
    }

    // Generate random maze walls
    for (let i = 0; i < 60; i++) {
      let wx, wy, wwidth, wheight;
      let valid = false;
      while(!valid) {
        wx = Math.random() * (MAP_WIDTH - 4) * TILE_SIZE + 2 * TILE_SIZE;
        wy = Math.random() * (MAP_HEIGHT - 4) * TILE_SIZE + 2 * TILE_SIZE;
        wwidth = (Math.random() * 3 + 1) * TILE_SIZE;
        wheight = (Math.random() * 3 + 1) * TILE_SIZE;
        
        const playerSafe = (wx + wwidth < 800 || wx > 1200 || wy + wheight < 800 || wy > 1200);
        const genSafe = (wx + wwidth < state.generator.x - 50 || wx > state.generator.x + 110 || wy + wheight < state.generator.y - 50 || wy > state.generator.y + 110);
        
        if (playerSafe && genSafe) valid = true;
      }
      state.walls.push({ x: wx, y: wy, width: wwidth, height: wheight });
    }

    // Spawn some initial enemies
    for (let i = 0; i < 8; i++) {
      spawnEnemy(state);
    }
  }, [gameOver, gameWon]);

  const spawnEnemy = (state) => {
    let ex, ey;
    let validSpawn = false;
    let attempts = 0; // prevent infinite loops
    
    while (!validSpawn && attempts < 50) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const distance = 800 + Math.random() * 500;
      
      ex = state.player.x + Math.cos(angle) * distance;
      ey = state.player.y + Math.sin(angle) * distance;
      
      ex = Math.max(100, Math.min(MAP_WIDTH * TILE_SIZE - 100, ex));
      ey = Math.max(100, Math.min(MAP_HEIGHT * TILE_SIZE - 100, ey));
      
      validSpawn = true;
      for (const w of state.walls) {
        if (circleRectCollide(ex, ey, 15, w.x, w.y, w.width, w.height)) {
          validSpawn = false;
          break;
        }
      }
    }
    
    state.enemies.push({
      x: ex,
      y: ey,
      radius: 15,
      hp: 100
    });
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w') gameState.current.keys.w = true;
      if (key === 'a') gameState.current.keys.a = true;
      if (key === 's') gameState.current.keys.s = true;
      if (key === 'd') gameState.current.keys.d = true;
      if (key === 'shift') gameState.current.keys.shift = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w') gameState.current.keys.w = false;
      if (key === 'a') gameState.current.keys.a = false;
      if (key === 's') gameState.current.keys.s = false;
      if (key === 'd') gameState.current.keys.d = false;
      if (key === 'shift') gameState.current.keys.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse / Canvas events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      gameState.current.mouse.x = e.clientX - rect.left;
      gameState.current.mouse.y = e.clientY - rect.top;
    };

    const handleMouseDown = () => { gameState.current.mouse.down = true; };
    const handleMouseUp = () => { gameState.current.mouse.down = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);



  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const loop = (now) => {
      const state = gameState.current;
      const delta = (now - state.lastTime) / 1000;
      state.lastTime = now;

      // Prevent massive jumps if tab is backgrounded
      if (delta > 0.1) {
        animationId = requestAnimationFrame(loop);
        return;
      }

      const p = state.player;

      // Update camera dimensions to match resize and forced rotation
      const isCurrentlyPortrait = window.innerHeight > window.innerWidth;
      const forceRotate = isTouchDevice && isCurrentlyPortrait;
      canvas.width = forceRotate ? window.innerHeight : window.innerWidth;
      canvas.height = forceRotate ? window.innerWidth : window.innerHeight;

      // Get latest mobile inputs without triggering React re-renders
      const { mobileMove, mobileLook, mobileShoot } = useGameStore.getState();

      if (!gameOver && !gameWon) {
      // --- INPUT LOGIC ---
      let vx = 0, vy = 0;

      // Keyboard
      if (state.keys.w) vy -= 1;
      if (state.keys.s) vy += 1;
      if (state.keys.a) vx -= 1;
      if (state.keys.d) vx += 1;

      // Mobile Move Joystick
      if (mobileMove.x !== 0 || mobileMove.y !== 0) {
        vx = mobileMove.x;
        vy = mobileMove.y;
      }

      if (vx !== 0 || vy !== 0) {
        const len = Math.sqrt(vx * vx + vy * vy);
        vx /= len; vy /= len;
      }

      const speed = GAME_SPEED * (state.keys.shift ? SPRINT_MULTIPLIER : 1);

      let nextX = p.x + vx * speed * delta;
      let nextY = p.y + vy * speed * delta;

      // Collision with walls (simple sliding)
      let hitX = false, hitY = false;
      for (const w of state.walls) {
        if (circleRectCollide(nextX, p.y, p.radius, w.x, w.y, w.width, w.height)) hitX = true;
        if (circleRectCollide(p.x, nextY, p.radius, w.x, w.y, w.width, w.height)) hitY = true;
      }

      if (!hitX) p.x = nextX;
      if (!hitY) p.y = nextY;

      // Player rotation (Mouse or Mobile Look)
      if (mobileLook.x !== 0 || mobileLook.y !== 0) {
        p.angle = Math.atan2(mobileLook.y, mobileLook.x);
      } else if (!isTouchDevice) {
        // Mouse look relative to center of screen (where player is drawn)
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        p.angle = Math.atan2(state.mouse.y - screenCenterY, state.mouse.x - screenCenterX);
      }

      // Shooting
      const soundEnabled = JSON.parse(localStorage.getItem('funflex_sound') ?? 'true');
      const isShooting = state.mouse.down || mobileShoot;
      if (isShooting && now - state.lastShootTime > 300) {
        state.lastShootTime = now;
        if (soundEnabled) playShootSound();
        state.bullets.push({
          x: p.x, y: p.y,
          vx: Math.cos(p.angle) * BULLET_SPEED,
          vy: Math.sin(p.angle) * BULLET_SPEED,
          life: 1.5
        });
      }

      // Camera Follows Player
      state.camera.x = p.x - canvas.width / 2;
      state.camera.y = p.y - canvas.height / 2;

      // --- ENEMY LOGIC ---
      state.spawnTimer += delta;
      if (state.spawnTimer > 5) {
        state.spawnTimer = 0;
        spawnEnemy(state);
      }

      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Chase player
        if (dist > 0 && dist < 1200) {
          const evx = (dx / dist) * ENEMY_SPEED * delta;
          const evy = (dy / dist) * ENEMY_SPEED * delta;

          let enextX = e.x + evx;
          let enextY = e.y + evy;

          let ehitX = false, ehitY = false;
          for (const w of state.walls) {
            if (circleRectCollide(enextX, e.y, e.radius, w.x, w.y, w.width, w.height)) ehitX = true;
            if (circleRectCollide(e.x, enextY, e.radius, w.x, w.y, w.width, w.height)) ehitY = true;
          }
          if (!ehitX) e.x = enextX;
          if (!ehitY) e.y = enextY;
        }

        // Damage Player
        if (dist < p.radius + e.radius && !gameOver && !gameWon) {
          takeDamage(20 * delta); // continuous damage
        }
      }

      // --- BULLET LOGIC ---
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx * delta;
        b.y += b.vy * delta;
        b.life -= delta;

        let remove = false;
        if (b.life <= 0) remove = true;

        // Wall collision
        for (const w of state.walls) {
          if (b.x > w.x && b.x < w.x + w.width && b.y > w.y && b.y < w.y + w.height) {
            remove = true;
            break;
          }
        }

        // Enemy collision
        if (!remove) {
          for (let j = state.enemies.length - 1; j >= 0; j--) {
            const e = state.enemies[j];
            const dx = b.x - e.x;
            const dy = b.y - e.y;
            if (Math.sqrt(dx * dx + dy * dy) < e.radius + 5) {
              e.hp -= 50;
              remove = true;
              if (e.hp <= 0) {
                if (soundEnabled) playMonsterHit();
                state.enemies.splice(j, 1);
              }
              break;
            }
          }
        }

        // Generator collision
        if (!remove && !state.generator.active) {
          const g = state.generator;
          if (b.x > g.x && b.x < g.x + g.width && b.y > g.y && b.y < g.y + g.height) {
            remove = true;
            state.generator.active = true;
            completeObjective('1');
            completeObjective('2');
            setTimeout(() => setGameWon(true), 2500);
          }
        }

        if (remove) state.bullets.splice(i, 1);
      }
      } // End of if (!gameOver && !gameWon)

      // --- RENDERING ---
      ctx.fillStyle = '#0a0a0a'; // Floor background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-state.camera.x, -state.camera.y);

      // Draw Walls (subtle visibility in dark)
      ctx.fillStyle = '#1a1a1a';
      for (const w of state.walls) {
        ctx.fillRect(w.x, w.y, w.width, w.height);
      }

      // Draw Generator
      const g = state.generator;
      if (g.active) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 40;
        ctx.fillRect(g.x, g.y, g.width, g.height);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(g.x, g.y, g.width, g.height);
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(g.x + g.width / 2, g.y + g.height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }



      // Draw Player
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bullets
      ctx.fillStyle = '#fff';
      for (const b of state.bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // --- MASKING (DARKNESS / FLASHLIGHT) ---
      // We draw darkness over an offscreen canvas, cutting out a hole for the flashlight, then draw it over the main canvas
      if (!g.active && !gameOver) { // if generator is active, lights are on!
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const mCtx = maskCanvas.getContext('2d');

        mCtx.fillStyle = 'rgba(0, 0, 0, 0.99)';
        mCtx.fillRect(0, 0, canvas.width, canvas.height);

        mCtx.globalCompositeOperation = 'destination-out';

        // Create gradient cone
        const playerScreenX = canvas.width / 2;
        const playerScreenY = canvas.height / 2;

        const grad = mCtx.createRadialGradient(
          playerScreenX, playerScreenY, 0,
          playerScreenX, playerScreenY, 500
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        mCtx.fillStyle = grad;
        mCtx.beginPath();
        mCtx.moveTo(playerScreenX, playerScreenY);
        mCtx.arc(playerScreenX, playerScreenY, 500, p.angle - 0.6, p.angle + 0.6);
        mCtx.lineTo(playerScreenX, playerScreenY);
        mCtx.fill();

        // Small ambient circle around player
        const ambient = mCtx.createRadialGradient(
          playerScreenX, playerScreenY, 0,
          playerScreenX, playerScreenY, 100
        );
        ambient.addColorStop(0, 'rgba(255,255,255,1)');
        ambient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
        ambient.addColorStop(1, 'rgba(255,255,255,0)');
        mCtx.fillStyle = ambient;
        mCtx.beginPath();
        mCtx.arc(playerScreenX, playerScreenY, 100, 0, Math.PI * 2);
        mCtx.fill();

        ctx.drawImage(maskCanvas, 0, 0);
      }

      // Draw Enemies ON TOP of darkness so they are always visible
      ctx.save();
      ctx.translate(-state.camera.x, -state.camera.y);
      for (const e of state.enemies) {
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eyes (blinking)
        const blink = (Math.sin(Date.now() / 150) + 1) / 2;
        ctx.fillStyle = `rgba(255, 0, 0, ${0.4 + blink * 0.6})`;
        const eyeDist = 8;
        const eyeAngle1 = Math.atan2(p.y - e.y, p.x - e.x) - 0.4;
        const eyeAngle2 = Math.atan2(p.y - e.y, p.x - e.x) + 0.4;

        ctx.beginPath();
        ctx.arc(e.x + Math.cos(eyeAngle1) * eyeDist, e.y + Math.sin(eyeAngle1) * eyeDist, 3 + blink, 0, Math.PI * 2);
        ctx.arc(e.x + Math.cos(eyeAngle2) * eyeDist, e.y + Math.sin(eyeAngle2) * eyeDist, 3 + blink, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [takeDamage, completeObjective, setGameWon, gameOver, gameWon]);

  // Hook to detect if we are on a portrait mobile device
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const forceRotate = isTouchDevice && isPortrait;

  return (
    <div style={{ 
      width: forceRotate ? '100vh' : '100vw', 
      height: forceRotate ? '100vw' : '100vh', 
      position: 'fixed', 
      top: forceRotate ? '50vh' : 0, 
      left: forceRotate ? '50vw' : 0, 
      transform: forceRotate ? 'translate(-50%, -50%) rotate(90deg)' : 'none',
      transformOrigin: 'center center',
      overflow: 'hidden', 
      backgroundColor: 'black' 
    }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
      />
      <GameUI isRotated={forceRotate} />
    </div>
  );
}
