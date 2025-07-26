import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface MobileControlsProps {
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPause: () => void;
  gameStatus: string;
}

export function MobileControls({ onDirectionChange, onPause, gameStatus }: MobileControlsProps) {
  const lastInputTimeRef = useRef<number>(0);
  
  const handleTouch = (direction: 'up' | 'down' | 'left' | 'right') => {
    const now = Date.now();
    
    // Prevent rapid successive inputs that could cause conflicts
    // Allow only one input every 50ms to prevent simultaneous button issues
    if (now - lastInputTimeRef.current < 50) {
      return;
    }
    
    lastInputTimeRef.current = now;
    onDirectionChange(direction);
    
    // Optimized haptic feedback - reduced duration for snappier feel
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  return (
    <div className="w-full bg-slate-750 rounded-lg p-4 border border-slate-600 shadow-lg">
      <div className="text-sm text-slate-400 text-center mb-4 font-medium">Touch Controls</div>
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        <div></div>
        <Button
          variant="secondary"
          className="control-button bg-slate-700 hover:bg-slate-600 active:bg-slate-500 w-full h-14 rounded-xl border-2 border-slate-600 hover:border-emerald-500 transition-colors duration-100 shadow-lg hover:shadow-xl touch-manipulation user-select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTouch('up');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('up');
          }}
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-emerald-400 text-2xl font-bold select-none">↑</span>
        </Button>
        <div></div>
        
        <Button
          variant="secondary"
          className="control-button bg-slate-700 hover:bg-slate-600 active:bg-slate-500 w-full h-14 rounded-xl border-2 border-slate-600 hover:border-emerald-500 transition-colors duration-100 shadow-lg hover:shadow-xl touch-manipulation user-select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTouch('left');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('left');
          }}
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-emerald-400 text-2xl font-bold select-none">←</span>
        </Button>
        
        <Button
          variant="secondary"
          className="control-button bg-amber-600 hover:bg-amber-700 active:bg-amber-500 w-full h-14 rounded-xl border-2 border-amber-500 hover:border-amber-400 transition-colors duration-100 shadow-lg hover:shadow-xl touch-manipulation user-select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPause();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onPause();
          }}
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-white text-lg font-bold select-none">⏸️</span>
        </Button>
        
        <Button
          variant="secondary"
          className="control-button bg-slate-700 hover:bg-slate-600 active:bg-slate-500 w-full h-14 rounded-xl border-2 border-slate-600 hover:border-emerald-500 transition-colors duration-100 shadow-lg hover:shadow-xl touch-manipulation user-select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTouch('right');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('right');
          }}
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-emerald-400 text-2xl font-bold select-none">→</span>
        </Button>
        
        <div></div>
        <Button
          variant="secondary"
          className="control-button bg-slate-700 hover:bg-slate-600 active:bg-slate-500 w-full h-14 rounded-xl border-2 border-slate-600 hover:border-emerald-500 transition-colors duration-100 shadow-lg hover:shadow-xl touch-manipulation user-select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTouch('down');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('down');
          }}
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-emerald-400 text-2xl font-bold select-none">↓</span>
        </Button>
        <div></div>
      </div>
    </div>
  );
}