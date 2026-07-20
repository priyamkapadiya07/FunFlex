import { Ball, TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS } from './physics';

const colors = [
  '#fadb14', // 1 yellow
  '#0050b3', // 2 blue
  '#cf1322', // 3 red
  '#531dab', // 4 purple
  '#d4380d', // 5 orange
  '#389e0d', // 6 green
  '#873800', // 7 maroon
  '#000000', // 8 black
];

// Returns an array of Balls
export const generateClassicLayout = (difficulty) => {
  let balls = [];
  
  // Cue ball
  balls.push(new Ball('cue', TABLE_WIDTH * 0.25, TABLE_HEIGHT / 2, 'cue', '#ffffff'));

  // Determine number of rows based on difficulty
  let rows = 3; // easy: 6 balls
  if (difficulty === 'medium') rows = 4; // 10 balls
  if (difficulty === 'hard') rows = 5; // 15 balls
  if (difficulty === 'expert' || difficulty === 'impossible') rows = 5; // Max standard rack

  let startX = TABLE_WIDTH * 0.65;
  let startY = TABLE_HEIGHT / 2;
  let id = 1;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
      let x = startX + i * (BALL_RADIUS * 1.732); // sqrt(3)
      let y = startY - (i * BALL_RADIUS) + (j * BALL_RADIUS * 2);
      
      let type = id === 8 ? '8ball' : (id < 8 ? 'solid' : 'stripe');
      let color = id === 8 ? '#000000' : colors[(id - 1) % colors.length];
      
      balls.push(new Ball(`ball-${id}`, x, y, type, color, id));
      id++;
    }
  }

  return balls;
};

// Simple random coordinate within table (padded)
const randomPoint = (pad) => ({
  x: pad + Math.random() * (TABLE_WIDTH - pad * 2),
  y: pad + Math.random() * (TABLE_HEIGHT - pad * 2)
});

// Trick shot procedural generator
export const generateTrickShot = (difficulty) => {
  let balls = [];
  
  // Number of obstacles based on difficulty
  let numObstacles = 0;
  if (difficulty === 'medium') numObstacles = 2;
  if (difficulty === 'hard') numObstacles = 5;
  if (difficulty === 'expert') numObstacles = 8;
  if (difficulty === 'impossible') numObstacles = 12;

  // Ensure no overlap when placing
  const isClear = (x, y) => {
    for (let b of balls) {
      if (Math.hypot(b.x - x, b.y - y) < BALL_RADIUS * 2.5) return false;
    }
    return true;
  };

  const placeBall = (id, type, color) => {
    let point;
    let attempts = 0;
    do {
      point = randomPoint(BALL_RADIUS * 4);
      attempts++;
    } while (!isClear(point.x, point.y) && attempts < 50);
    
    balls.push(new Ball(id, point.x, point.y, type, color));
  };

  // Target ball
  placeBall('target', 'target', 'var(--color-primary-dark)');
  
  // Cue ball
  placeBall('cue', 'cue', '#ffffff');

  // Obstacles
  for (let i = 0; i < numObstacles; i++) {
    placeBall(`obs-${i}`, 'obstacle', '#555555');
  }

  return balls;
};
