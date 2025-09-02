"use client";

import { useState, useEffect, useCallback } from 'react';
import { InputState } from '@/types/game';
import { CONTROLS } from '@/lib/gameConfig';

export function useInput() {
  const [inputState, setInputState] = useState<InputState>({
    mouseX: 0,
    leftPressed: false,
    rightPressed: false,
    spacePressed: false,
    enterPressed: false,
  });

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = event.target as HTMLCanvasElement;
    if (canvas && canvas.tagName === 'CANVAS') {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const mouseX = (event.clientX - rect.left) * scaleX;
      
      setInputState(prev => ({ ...prev, mouseX }));
    }
  }, []);

  // Handle touch movement for mobile
  const handleTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();
    const canvas = event.target as HTMLCanvasElement;
    if (canvas && canvas.tagName === 'CANVAS' && event.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const mouseX = (event.touches[0].clientX - rect.left) * scaleX;
      
      setInputState(prev => ({ ...prev, mouseX }));
    }
  }, []);

  // Handle key down
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.code;
    
    if (CONTROLS.PADDLE_LEFT.includes(key)) {
      setInputState(prev => ({ ...prev, leftPressed: true }));
    } else if (CONTROLS.PADDLE_RIGHT.includes(key)) {
      setInputState(prev => ({ ...prev, rightPressed: true }));
    } else if (CONTROLS.PAUSE.includes(key)) {
      setInputState(prev => ({ ...prev, spacePressed: true }));
    } else if (CONTROLS.START.includes(key)) {
      setInputState(prev => ({ ...prev, enterPressed: true }));
    }
  }, []);

  // Handle key up
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.code;
    
    if (CONTROLS.PADDLE_LEFT.includes(key)) {
      setInputState(prev => ({ ...prev, leftPressed: false }));
    } else if (CONTROLS.PADDLE_RIGHT.includes(key)) {
      setInputState(prev => ({ ...prev, rightPressed: false }));
    } else if (CONTROLS.PAUSE.includes(key)) {
      setInputState(prev => ({ ...prev, spacePressed: false }));
    } else if (CONTROLS.START.includes(key)) {
      setInputState(prev => ({ ...prev, enterPressed: false }));
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    const canvas = document.getElementById('gameCanvas');
    
    // Mouse events
    document.addEventListener('mousemove', handleMouseMove);
    
    // Touch events for mobile
    canvas?.addEventListener('touchmove', handleTouchMove);
    canvas?.addEventListener('touchstart', handleTouchMove);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      canvas?.removeEventListener('touchmove', handleTouchMove);
      canvas?.removeEventListener('touchstart', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleTouchMove, handleKeyDown, handleKeyUp]);

  // Reset specific input states (for one-time actions)
  const resetKeys = useCallback(() => {
    setInputState(prev => ({
      ...prev,
      spacePressed: false,
      enterPressed: false,
    }));
  }, []);

  return {
    inputState,
    resetKeys,
  };
}