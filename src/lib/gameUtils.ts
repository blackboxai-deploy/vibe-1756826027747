import { Ball, Paddle, Block, Position, Velocity, Size } from '@/types/game';
import { PHYSICS, GAME_CONFIG } from './gameConfig';

// Collision detection utilities
export function checkCircleRectCollision(
  circlePos: Position,
  circleRadius: number,
  rectPos: Position,
  rectSize: Size
): boolean {
  // Find the closest point on the rectangle to the circle
  const closestX = Math.max(rectPos.x, Math.min(circlePos.x, rectPos.x + rectSize.width));
  const closestY = Math.max(rectPos.y, Math.min(circlePos.y, rectPos.y + rectSize.height));

  // Calculate distance between circle center and closest point
  const distanceX = circlePos.x - closestX;
  const distanceY = circlePos.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared < circleRadius * circleRadius;
}

// Calculate ball bounce off paddle
export function calculatePaddleBounce(ball: Ball, paddle: Paddle): Velocity {
  // Calculate relative hit position on paddle (-1 to 1)
  const paddleCenter = paddle.position.x + paddle.size.width / 2;
  const hitPos = (ball.position.x - paddleCenter) / (paddle.size.width / 2);
  
  // Calculate bounce angle based on hit position
  const bounceAngle = hitPos * (PHYSICS.MAX_BOUNCE_ANGLE - PHYSICS.MIN_BOUNCE_ANGLE) / 2 + Math.PI / 2;
  
  // Apply current ball speed to new direction
  const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
  
  return {
    x: Math.cos(bounceAngle) * speed,
    y: -Math.sin(bounceAngle) * speed, // Negative Y to go upward
  };
}

// Calculate ball bounce off block
export function calculateBlockBounce(ball: Ball, block: Block): Velocity {
  const ballCenter = { x: ball.position.x, y: ball.position.y };
  const blockCenter = {
    x: block.position.x + block.size.width / 2,
    y: block.position.y + block.size.height / 2,
  };

  // Determine which side of the block was hit
  const deltaX = ballCenter.x - blockCenter.x;
  const deltaY = ballCenter.y - blockCenter.y;
  
  const absDelataX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  // Collision from top/bottom
  if (absDelataX / block.size.width < absDeltaY / block.size.height) {
    return {
      x: ball.velocity.x,
      y: -ball.velocity.y,
    };
  }
  // Collision from left/right
  else {
    return {
      x: -ball.velocity.x,
      y: ball.velocity.y,
    };
  }
}

// Create blocks for a level
export function createBlocks(level: number, colors: string[]): Block[] {
  const blocks: Block[] = [];
  const { blocks: blockConfig } = GAME_CONFIG;
  
  // Calculate number of rows based on level (minimum 3, maximum 8)
  const numRows = Math.min(3 + level, 8);
  
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < blockConfig.cols; col++) {
      const x = col * (blockConfig.width + blockConfig.padding) + blockConfig.padding;
      const y = row * (blockConfig.height + blockConfig.padding) + blockConfig.margin;
      
      blocks.push({
        id: `block-${row}-${col}`,
        position: { x, y },
        size: { width: blockConfig.width, height: blockConfig.height },
        color: colors[row % colors.length],
        points: GAME_CONFIG.game.pointsPerBlock * (row + 1), // Higher rows worth more points
        destroyed: false,
      });
    }
  }
  
  return blocks;
}

// Check if ball is out of bounds (bottom)
export function isBallOutOfBounds(ball: Ball): boolean {
  return ball.position.y > GAME_CONFIG.canvas.height + ball.radius;
}

// Check if all blocks are destroyed
export function areAllBlocksDestroyed(blocks: Block[]): boolean {
  return blocks.every(block => block.destroyed);
}

// Clamp paddle position within canvas bounds
export function clampPaddlePosition(x: number, paddleWidth: number): number {
  return Math.max(0, Math.min(GAME_CONFIG.canvas.width - paddleWidth, x));
}

// Reset ball to starting position
export function resetBallPosition(): { position: Position; velocity: Velocity } {
  return {
    position: {
      x: GAME_CONFIG.canvas.width / 2,
      y: GAME_CONFIG.paddle.minY - 20,
    },
    velocity: {
      x: (Math.random() - 0.5) * 4, // Random horizontal direction
      y: -GAME_CONFIG.ball.initialSpeed,
    },
  };
}

// Calculate distance between two points
export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Normalize a vector
export function normalizeVector(velocity: Velocity): Velocity {
  const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  
  return {
    x: velocity.x / magnitude,
    y: velocity.y / magnitude,
  };
}