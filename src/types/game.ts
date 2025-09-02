// Game type definitions for Block Breaker

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Ball {
  position: Position;
  velocity: Velocity;
  radius: number;
  speed: number;
}

export interface Paddle {
  position: Position;
  size: Size;
  speed: number;
}

export interface Block {
  position: Position;
  size: Size;
  color: string;
  points: number;
  destroyed: boolean;
  id: string;
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  blocksDestroyed: number;
  totalBlocks: number;
}

export interface GameCanvas {
  width: number;
  height: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete' | 'victory';

export interface GameConfig {
  canvas: GameCanvas;
  ball: {
    radius: number;
    initialSpeed: number;
    maxSpeed: number;
    speedIncrement: number;
  };
  paddle: {
    width: number;
    height: number;
    speed: number;
    minY: number;
  };
  blocks: {
    width: number;
    height: number;
    rows: number;
    cols: number;
    padding: number;
    margin: number;
  };
  game: {
    initialLives: number;
    pointsPerBlock: number;
    levelCompleteBonus: number;
  };
}

export interface InputState {
  mouseX: number;
  leftPressed: boolean;
  rightPressed: boolean;
  spacePressed: boolean;
  enterPressed: boolean;
}