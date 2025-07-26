import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

interface GameState {
  snake: Array<{ x: number; y: number }>;
  food: { x: number; y: number };
  status: 'waiting' | 'playing' | 'paused' | 'gameOver';
  score: number;
}

interface GameCanvasProps {
  gameState: GameState;
  className?: string;
}

export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ gameState, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#1E293B'; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gridSize = 20;

      // Draw grid
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (gameState.status === 'waiting') {
        return;
      }

      // Draw snake
      gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#10B981' : '#059669'; // emerald-500/600
        ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
        
        // Add glow effect for head
        if (index === 0) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 10;
          ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
          ctx.shadowBlur = 0;
        }
      });

      // Draw food
      ctx.fillStyle = '#F59E0B'; // amber-500
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(
        gameState.food.x + gridSize / 2,
        gameState.food.y + gridSize / 2,
        (gridSize - 4) / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.shadowBlur = 0;

    }, [gameState]);

    return (
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className={cn("border-2 border-emerald-500", className)}
        style={{
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
        }}
      />
    );
  }
);

GameCanvas.displayName = "GameCanvas";