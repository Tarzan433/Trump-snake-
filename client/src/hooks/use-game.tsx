import { useState, useEffect, useRef, useCallback } from "react";

interface GameState {
  snake: Array<{ x: number; y: number }>;
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  status: 'waiting' | 'playing' | 'paused' | 'gameOver';
  score: number;
  gameTime: number;
}

interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  gameMode: 'classic' | 'portal' | 'speed-boost';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 200, y: 200 }],
    food: { x: 100, y: 100 },
    direction: 'right',
    status: 'waiting',
    score: 0,
    gameTime: 0
  });

  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'medium',
    gameMode: 'classic',
    soundEnabled: true,
    vibrationEnabled: true
  });

  const gameLoopRef = useRef<number>();
  const timeRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);

  const generateFood = useCallback((): { x: number; y: number } => {
    const maxPos = CANVAS_SIZE - GRID_SIZE;
    return {
      x: Math.floor(Math.random() * (maxPos / GRID_SIZE)) * GRID_SIZE,
      y: Math.floor(Math.random() * (maxPos / GRID_SIZE)) * GRID_SIZE
    };
  }, []);

  const getGameSpeed = (difficulty: string, gameMode: string): number => {
    let baseSpeed;
    switch (difficulty) {
      case 'easy': baseSpeed = 200; break;
      case 'medium': baseSpeed = 150; break;
      case 'hard': baseSpeed = 100; break;
      case 'expert': baseSpeed = 75; break;
      default: baseSpeed = 150;
    }
    
    // Speed boost mode increases game speed
    if (gameMode === 'speed-boost') {
      return Math.max(50, baseSpeed - 40); // Significantly faster in speed-boost mode
    }
    
    return baseSpeed;
  };

  const checkCollision = useCallback((head: { x: number; y: number }, snake: Array<{ x: number; y: number }>) => {
    // Handle wall collision based on game mode
    const hitWall = head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE;
    
    if (hitWall && settings.gameMode === 'classic') {
      return true; // Game over on wall collision in classic mode
    }

    // Self collision (applies to all modes) - check against body segments only (skip head at index 0)
    // Only check if snake has more than 1 segment to prevent false positives on short snakes
    if (snake.length > 1) {
      return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    return false;
  }, [settings.gameMode]);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.status !== 'playing') return prevState;

      // Use current direction from state (already updated immediately)
      const currentDirection = prevState.direction;

      const head = { ...prevState.snake[0] };
      
      switch (currentDirection) {
        case 'up': head.y -= GRID_SIZE; break;
        case 'down': head.y += GRID_SIZE; break;
        case 'left': head.x -= GRID_SIZE; break;
        case 'right': head.x += GRID_SIZE; break;
      }

      // Handle different game modes for wall wrapping
      if (settings.gameMode === 'portal') {
        // Wrap around walls in portal mode only
        if (head.x < 0) head.x = CANVAS_SIZE - GRID_SIZE;
        if (head.x >= CANVAS_SIZE) head.x = 0;
        if (head.y < 0) head.y = CANVAS_SIZE - GRID_SIZE;
        if (head.y >= CANVAS_SIZE) head.y = 0;
      }

      // Check collision
      if (checkCollision(head, prevState.snake)) {

        return { ...prevState, status: 'gameOver' };
      }

      const newSnake = [head, ...prevState.snake];
      let newFood = prevState.food;
      let newScore = prevState.score;

      // Check if food is eaten
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        newFood = generateFood();
        
        // Calculate score based on game mode
        let scoreIncrease = 10;
        if (settings.gameMode === 'portal') {
          scoreIncrease = 20; // 2x score for portal mode (teleport bonus)
        } else if (settings.gameMode === 'speed-boost') {
          scoreIncrease = 15; // 1.5x score for speed boost mode (challenge bonus)
        }
        
        newScore += scoreIncrease;
        
        // Play sound effect with reusable AudioContext
        if (settings.soundEnabled) {
          try {
            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            
            const audioContext = audioContextRef.current;
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
          } catch (error) {
            // Silently fail if audio context creation fails
            console.warn('Audio playback failed:', error);
          }
        }

        // Vibrate on mobile
        if (settings.vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate(100);
        }
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore,
        direction: currentDirection
      };
    });
  }, [checkCollision, generateFood, settings.soundEnabled, settings.vibrationEnabled, settings.gameMode]);

  const startGame = useCallback(() => {
    setGameState({
      snake: [{ x: 200, y: 200 }],
      food: generateFood(),
      direction: 'right',
      status: 'playing',
      score: 0,
      gameTime: 0
    });
  }, [generateFood]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'waiting' }));
  }, []);

  const changeDirection = useCallback((newDirection: 'up' | 'down' | 'left' | 'right') => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;
      
      // Prevent reversing into self - this is critical for preventing crashes
      const opposites = {
        up: 'down', down: 'up', left: 'right', right: 'left'
      };
      
      // Check against current direction to prevent immediate reversal
      if (opposites[newDirection] === prev.direction) {
        // Ignore invalid input, keep current direction
        return prev;
      }
      
      // Additional safety check: if snake has more than 1 segment,
      // ensure new direction won't cause immediate collision with second segment
      if (prev.snake.length > 1) {
        const head = prev.snake[0];
        const secondSegment = prev.snake[1];
        
        // Calculate where head would move with new direction
        const newHead = { ...head };
        switch (newDirection) {
          case 'up': newHead.y -= GRID_SIZE; break;
          case 'down': newHead.y += GRID_SIZE; break;
          case 'left': newHead.x -= GRID_SIZE; break;
          case 'right': newHead.x += GRID_SIZE; break;
        }
        
        // If new head position would collide with second segment, ignore the input
        if (newHead.x === secondSegment.x && newHead.y === secondSegment.y) {
          return prev;
        }
      }
      
      // Apply valid direction change
      return { ...prev, direction: newDirection };
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Game loop using setInterval for consistent timing
  useEffect(() => {
    if (gameState.status === 'playing') {
      const gameSpeed = getGameSpeed(settings.difficulty, settings.gameMode);
      
      gameLoopRef.current = window.setInterval(() => {
        moveSnake();
      }, gameSpeed);
      
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState.status, settings.difficulty, settings.gameMode, moveSnake]);

  // Game timer
  useEffect(() => {
    if (gameState.status === 'playing') {
      timeRef.current = window.setInterval(() => {
        setGameState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
      }, 1000);
      return () => {
        if (timeRef.current) {
          clearInterval(timeRef.current);
        }
      };
    }
  }, [gameState.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    gameState,
    settings,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    changeDirection,
    updateSettings
  };
}
