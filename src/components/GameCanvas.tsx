"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import { useInput } from '@/hooks/useInput';
import { GAME_CONFIG } from '@/lib/gameConfig';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { inputState, resetKeys } = useInput();
  const {
    gameState,
    gameStats,
    ball,
    paddle,
    blocks,
    startGame,
    togglePause,
    updatePaddle,
  } = useGame();

  // Handle input state changes
  useEffect(() => {
    if (gameState === 'playing') {
      updatePaddle(inputState);
    }

    // Handle pause toggle
    if (inputState.spacePressed && gameState === 'playing') {
      togglePause();
      resetKeys();
    } else if (inputState.spacePressed && gameState === 'paused') {
      togglePause();
      resetKeys();
    }

    // Handle start game
    if (inputState.enterPressed && (gameState === 'menu' || gameState === 'gameOver')) {
      startGame();
      resetKeys();
    }
  }, [inputState, gameState, updatePaddle, togglePause, startGame, resetKeys]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing' || gameState === 'paused') {
      // Draw blocks
      blocks.forEach(block => {
        if (!block.destroyed) {
          ctx.fillStyle = block.color;
          ctx.fillRect(
            block.position.x,
            block.position.y,
            block.size.width,
            block.size.height
          );
          
          // Add block border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            block.position.x,
            block.position.y,
            block.size.width,
            block.size.height
          );
        }
      });

      // Draw paddle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        paddle.position.x,
        paddle.position.y,
        paddle.size.width,
        paddle.size.height
      );

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Draw pause overlay
      if (gameState === 'paused') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 60);
      }
    }

    // Draw game over screen
    else if (gameState === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${gameStats.score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText('Press ENTER to play again', canvas.width / 2, canvas.height / 2 + 60);
    }

    // Draw menu screen
    else if (gameState === 'menu') {
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#16213e');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BLOCK BREAKER', canvas.width / 2, canvas.height / 2 - 100);

      // Draw subtitle
      ctx.font = '28px Arial';
      ctx.fillStyle = '#4ECDC4';
      ctx.fillText('Classic Arcade Game', canvas.width / 2, canvas.height / 2 - 40);

      // Draw instructions
      ctx.font = '20px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Move paddle with mouse or arrow keys', canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText('Press SPACE to pause', canvas.width / 2, canvas.height / 2 + 70);
      ctx.fillText('Press ENTER to start!', canvas.width / 2, canvas.height / 2 + 120);
    }
  }, [gameState, gameStats, ball, paddle, blocks]);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [render]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Game Stats HUD */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <Card className="mb-4 p-4 bg-slate-800 border-slate-700">
          <div className="flex gap-6 text-white">
            <div className="text-center">
              <div className="text-sm text-slate-400">Score</div>
              <div className="text-xl font-bold">{gameStats.score.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Level</div>
              <div className="text-xl font-bold">{gameStats.level}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Lives</div>
              <div className="text-xl font-bold">{'❤️'.repeat(gameStats.lives)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Blocks</div>
              <div className="text-xl font-bold">
                {gameStats.totalBlocks - gameStats.blocksDestroyed}/{gameStats.totalBlocks}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width={GAME_CONFIG.canvas.width}
        height={GAME_CONFIG.canvas.height}
        className="border-2 border-slate-600 rounded-lg shadow-2xl bg-slate-900"
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      {/* Control Buttons */}
      <div className="mt-4 flex gap-4">
        {gameState === 'menu' && (
          <Button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            Start Game
          </Button>
        )}
        
        {gameState === 'playing' && (
          <Button
            onClick={togglePause}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Pause
          </Button>
        )}
        
        {gameState === 'paused' && (
          <Button
            onClick={togglePause}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Resume
          </Button>
        )}
        
        {gameState === 'gameOver' && (
          <Button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            Play Again
          </Button>
        )}
      </div>

      {/* Mobile Controls Info */}
      <div className="mt-4 text-center text-slate-400 text-sm max-w-md">
        <p className="mb-1">
          <strong>Desktop:</strong> Move mouse to control paddle, SPACE to pause
        </p>
        <p>
          <strong>Mobile:</strong> Touch and drag to control paddle
        </p>
      </div>
    </div>
  );
}