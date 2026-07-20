export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 400;
export const BALL_RADIUS = 12;
export const POCKET_RADIUS = 30;
export const FRICTION = 0.985;
export const MIN_VELOCITY = 0.05;

// Standard 6 pockets
export const POCKETS = [
  { x: 0, y: 0 },
  { x: TABLE_WIDTH / 2, y: -5 }, // Top middle is slightly recessed
  { x: TABLE_WIDTH, y: 0 },
  { x: 0, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT + 5 }, // Bottom middle
  { x: TABLE_WIDTH, y: TABLE_HEIGHT }
];

export class Ball {
  constructor(id, x, y, type, color, number = null) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type; // 'cue', 'solid', 'stripe', '8ball', 'target', 'obstacle'
    this.color = color;
    this.number = number;
    this.active = true; // false if pocketed
  }

  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }

  update() {
    if (!this.active) return;

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= FRICTION;
    this.vy *= FRICTION;

    if (Math.abs(this.vx) < MIN_VELOCITY) this.vx = 0;
    if (Math.abs(this.vy) < MIN_VELOCITY) this.vy = 0;
  }
}

// Distance between two points
const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const updatePhysics = (balls, onPocketed) => {
  let isMoving = false;

  // 1. Update positions and apply friction
  balls.forEach(ball => {
    if (ball.active) {
      ball.update();
      if (ball.vx !== 0 || ball.vy !== 0) isMoving = true;
    }
  });

  // 2. Ball-to-Wall Collisions
  balls.forEach(ball => {
    if (!ball.active) return;

    // Left wall
    if (ball.x - BALL_RADIUS < 0) {
      ball.x = BALL_RADIUS;
      ball.vx *= -1;
    }
    // Right wall
    else if (ball.x + BALL_RADIUS > TABLE_WIDTH) {
      ball.x = TABLE_WIDTH - BALL_RADIUS;
      ball.vx *= -1;
    }

    // Top wall
    if (ball.y - BALL_RADIUS < 0) {
      ball.y = BALL_RADIUS;
      ball.vy *= -1;
    }
    // Bottom wall
    else if (ball.y + BALL_RADIUS > TABLE_HEIGHT) {
      ball.y = TABLE_HEIGHT - BALL_RADIUS;
      ball.vy *= -1;
    }
  });

  // 3. Ball-to-Ball Collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let b1 = balls[i];
      let b2 = balls[j];

      if (!b1.active || !b2.active) continue;

      let dx = b2.x - b1.x;
      let dy = b2.y - b1.y;
      let distance = Math.hypot(dx, dy);

      if (distance < BALL_RADIUS * 2) {
        // Resolve overlap
        let overlap = (BALL_RADIUS * 2 - distance) / 2;
        let nx = dx / distance;
        let ny = dy / distance;

        b1.x -= nx * overlap;
        b1.y -= ny * overlap;
        b2.x += nx * overlap;
        b2.y += ny * overlap;

        // Calculate elastic collision (assuming equal mass)
        let kx = b1.vx - b2.vx;
        let ky = b1.vy - b2.vy;
        
        let p = 2.0 * (nx * kx + ny * ky) / 2.0; // mass is 1, so mass1+mass2 = 2

        b1.vx = b1.vx - p * nx;
        b1.vy = b1.vy - p * ny;
        b2.vx = b2.vx + p * nx;
        b2.vy = b2.vy + p * ny;
      }
    }
  }

  // 4. Pockets
  balls.forEach(ball => {
    if (!ball.active) return;
    
    for (let pocket of POCKETS) {
      if (dist(ball, pocket) < POCKET_RADIUS) {
        ball.active = false;
        ball.vx = 0;
        ball.vy = 0;
        if (onPocketed) onPocketed(ball);
        break;
      }
    }
  });

  return isMoving;
};
