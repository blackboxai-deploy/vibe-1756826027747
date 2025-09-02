import { GameConfig } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 800,
    height: 600,
  },
  ball: {
    radius: 8,
    initialSpeed: 5,
    maxSpeed: 12,
    speedIncrement: 0.5,
  },
  paddle: {
    width: 100,
    height: 12,
    speed: 8,
    minY: 500, // Paddle Y position from top
  },
  blocks: {
    width: 70,
    height: 20,
    rows: 8,
    cols: 10,
    padding: 4,
    margin: 60, // Top margin from canvas top
  },
  game: {
    initialLives: 3,
    pointsPerBlock: 10,
    levelCompleteBonus: 500,
  },
};

// Color scheme for different block rows
export const BLOCK_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FFB347', // Orange
  '#87CEEB', // Sky Blue
];

// Game controls
export const CONTROLS = {
  PADDLE_LEFT: ['ArrowLeft', 'KeyA'],
  PADDLE_RIGHT: ['ArrowRight', 'KeyD'],
  PAUSE: ['Space'],
  START: ['Enter'],
};

export const PHYSICS = {
  PADDLE_BOUNCE_FACTOR: 0.1, // How much paddle movement affects ball direction
  WALL_BOUNCE_DAMPING: 0.98, // Slight energy loss on wall bounces
  MIN_BOUNCE_ANGLE: Math.PI / 6, // 30 degrees minimum bounce angle
  MAX_BOUNCE_ANGLE: (5 * Math.PI) / 6, // 150 degrees maximum bounce angle
};