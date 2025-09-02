"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Ball, Paddle, Block, GameStats, GameState, InputState } from '@/types/game';
import { GAME_CONFIG, BLOCK_COLORS } from '@/lib/gameConfig';
import {
  checkCircleRectCollision,
  calculatePaddleBounce,
  calculateBlockBounce,
  createBlocks,
  isBallOutOfBounds,
  areAllBlocksDestroyed,
  clampPaddlePosition,
  resetBallPosition,
} from '@/lib/gameUtils';

export function useGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: GAME_CONFIG.game.initialLives,
    blocksDestroyed: 0,
    totalBlocks: 0,
  });

  // Game objects
  const [ball, setBall] = useState<Ball>(() => {
    const { position, velocity } = resetBallPosition();
    return {
      position,
      velocity,
      radius: GAME_CONFIG.ball.radius,
      speed: GAME_CONFIG.ball.initialSpeed,
    };
  });

  const [paddle, setPaddle] = useState<Paddle>({
    position: {
      x: GAME_CONFIG.canvas.width / 2 - GAME_CONFIG.paddle.width / 2,
      y: GAME_CONFIG.paddle.minY,
    },
    size: {
      width: GAME_CONFIG.paddle.width,
      height: GAME_CONFIG.paddle.height,
    },
    speed: GAME_CONFIG.paddle.speed,
  });

  const [blocks, setBlocks] = useState<Block[]>([]);

  // Animation frame ref
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Initialize blocks for current level
  const initializeLevel = useCallback((level: number) => {
    const newBlocks = createBlocks(level, BLOCK_COLORS);
    setBlocks(newBlocks);
    setGameStats(prev => ({
      ...prev,
      level,
      totalBlocks: newBlocks.length,
      blocksDestroyed: 0,
    }));

    // Reset ball position
    const { position, velocity } = resetBallPosition();
    setBall(prev => ({
      ...prev,
      position,
      velocity,
    }));

    // Reset paddle position
    setPaddle(prev => ({
      ...prev,
      position: {
        x: GAME_CONFIG.canvas.width / 2 - GAME_CONFIG.paddle.width / 2,
        y: GAME_CONFIG.paddle.minY,
      },
    }));
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    setGameStats({
      score: 0,
      level: 1,
      lives: GAME_CONFIG.game.initialLives,
      blocksDestroyed: 0,
      totalBlocks: 0,
    });
    initializeLevel(1);
    setGameState('playing');
  }, [initializeLevel]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // Update paddle position
  const updatePaddle = useCallback((inputState: InputState) => {
    setPaddle(prev => {
      let newX = prev.position.x;

      // Mouse control (primary)
      if (inputState.mouseX > 0) {
        newX = inputState.mouseX - prev.size.width / 2;
      }
      // Keyboard control (secondary)
      else if (inputState.leftPressed) {
        newX = prev.position.x - prev.speed;
      } else if (inputState.rightPressed) {
        newX = prev.position.x + prev.speed;
      }

      return {
        ...prev,
        position: {
          ...prev.position,
          x: clampPaddlePosition(newX, prev.size.width),
        },
      };
    });
  }, []);

  // Update ball position and handle collisions
  const updateBall = useCallback(() => {
    setBall(prev => {
      let newPosition = {
        x: prev.position.x + prev.velocity.x,
        y: prev.position.y + prev.velocity.y,
      };
      let newVelocity = { ...prev.velocity };

      // Wall collisions (left, right, top)
      if (newPosition.x <= prev.radius || newPosition.x >= GAME_CONFIG.canvas.width - prev.radius) {
        newVelocity.x = -newVelocity.x;
        newPosition.x = prev.position.x; // Reset to prevent wall penetration
      }
      if (newPosition.y <= prev.radius) {
        newVelocity.y = -newVelocity.y;
        newPosition.y = prev.position.y; // Reset to prevent wall penetration
      }

      // Check if ball is out of bounds (bottom)
      if (isBallOutOfBounds({ ...prev, position: newPosition })) {
        setGameStats(prevStats => {
          const newLives = prevStats.lives - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
          }
          return { ...prevStats, lives: newLives };
        });

        // Reset ball position
        const { position: resetPos, velocity: resetVel } = resetBallPosition();
        return {
          ...prev,
          position: resetPos,
          velocity: resetVel,
        };
      }

      return {
        ...prev,
        position: newPosition,
        velocity: newVelocity,
      };
    });
  }, []);

  // Check paddle collision
  const checkPaddleCollision = useCallback(() => {
    setBall(prevBall => {
      if (checkCircleRectCollision(prevBall.position, prevBall.radius, paddle.position, paddle.size)) {
        const newVelocity = calculatePaddleBounce(prevBall, paddle);
        return {
          ...prevBall,
          velocity: newVelocity,
        };
      }
      return prevBall;
    });
  }, [paddle]);

  // Check block collisions
  const checkBlockCollisions = useCallback(() => {
    setBall(prevBall => {
      let newVelocity = { ...prevBall.velocity };
      let collisionOccurred = false;

      setBlocks(prevBlocks => {
        return prevBlocks.map(block => {
          if (block.destroyed) return block;

          if (checkCircleRectCollision(prevBall.position, prevBall.radius, block.position, block.size)) {
            if (!collisionOccurred) {
              newVelocity = calculateBlockBounce(prevBall, block);
              collisionOccurred = true;
            }

            // Update score
            setGameStats(prevStats => ({
              ...prevStats,
              score: prevStats.score + block.points,
              blocksDestroyed: prevStats.blocksDestroyed + 1,
            }));

            return { ...block, destroyed: true };
          }
          return block;
        });
      });

      return {
        ...prevBall,
        velocity: newVelocity,
      };
    });
  }, []);

  // Check win condition
  useEffect(() => {
    if (gameState === 'playing' && areAllBlocksDestroyed(blocks) && blocks.length > 0) {
      setGameStats(prev => ({
        ...prev,
        score: prev.score + GAME_CONFIG.game.levelCompleteBonus,
        level: prev.level + 1,
      }));
      
      // Start next level after a brief delay
      setTimeout(() => {
        initializeLevel(gameStats.level + 1);
      }, 1000);
    }
  }, [blocks, gameState, gameStats.level, initializeLevel]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState !== 'playing') return;

    const deltaTime = currentTime - lastTimeRef.current;
    
    // Update at 60fps
    if (deltaTime >= 16.67) {
      updateBall();
      checkPaddleCollision();
      checkBlockCollisions();
      lastTimeRef.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateBall, checkPaddleCollision, checkBlockCollisions]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameLoop]);

  return {
    gameState,
    gameStats,
    ball,
    paddle,
    blocks,
    startGame,
    togglePause,
    updatePaddle,
    initializeLevel,
  };
}