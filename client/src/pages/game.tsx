import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "../hooks/use-game";
import { useFirebase } from "../hooks/use-firebase";
import { GameCanvas } from "../components/ui/game-canvas";
import { MobileControls } from "../components/ui/mobile-controls";
import { GameStats } from "../components/ui/game-stats";
import { Leaderboard } from "../components/ui/leaderboard";
import { Web3GameWrapper } from "../components/ui/web3-game-wrapper";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Game() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const gameRef = useRef<HTMLCanvasElement>(null);
  
  const {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    changeDirection,
    settings,
    updateSettings
  } = useGame(gameRef);

  const {
    submitScore,
    topScores,
    isSubmittingScore,
    refetchScores
  } = useFirebase();

  const [showGameOver, setShowGameOver] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const [playerName, setPlayerName] = useState("Anonymous");

  // Handle game state changes
  useEffect(() => {
    if (gameState.status === 'gameOver') {
      setShowGameOver(true);
      
      // Check if it's a new high score
      if (topScores.length === 0 || gameState.score > topScores[0].score) {
        setShowNewHighScore(true);
      }
    } else if (gameState.status === 'paused') {
      setShowPause(true);
    } else {
      setShowGameOver(false);
      setShowPause(false);
      setShowNewHighScore(false);
    }
  }, [gameState.status, gameState.score, topScores]);

  // Keyboard controls with input throttling
  const lastKeyInputTime = useRef<number>(0);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' && gameState.status !== 'paused') return;
      
      const now = Date.now();
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          
          // Throttle direction inputs to prevent simultaneous key issues
          if (now - lastKeyInputTime.current < 50) {
            return;
          }
          
          lastKeyInputTime.current = now;
          
          if (e.key === 'ArrowUp') changeDirection('up');
          else if (e.key === 'ArrowDown') changeDirection('down');
          else if (e.key === 'ArrowLeft') changeDirection('left');
          else if (e.key === 'ArrowRight') changeDirection('right');
          break;
          
        case ' ':
          e.preventDefault();
          if (gameState.status === 'playing') {
            pauseGame();
          } else if (gameState.status === 'paused') {
            resumeGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, changeDirection, pauseGame, resumeGame]);

  const handleStartGame = () => {
    startGame();
  };

  const handleRestartGame = async () => {
    if (gameState.score > 0) {
      try {
        await submitScore({
          playerName,
          score: gameState.score,
          gameTime: gameState.gameTime,
          snakeLength: gameState.snake.length
        });
        refetchScores();
        toast({
          title: "Score Saved!",
          description: `Your score of ${gameState.score} has been saved to the leaderboard.`
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to save score",
          description: "Your score couldn't be saved to the leaderboard."
        });
      }
    }
    setShowGameOver(false);
    setShowNewHighScore(false);
    startGame();
  };

  const handlePauseResume = () => {
    if (gameState.status === 'playing') {
      pauseGame();
    } else if (gameState.status === 'paused') {
      resumeGame();
      setShowPause(false);
    }
  };

  const handleEndGame = () => {
    endGame();
    setShowPause(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case 'classic': return '🏛️';
      case 'portal': return '🌀';
      case 'speed-boost': return '🚀';
      default: return '🎮';
    }
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'classic': return 'text-blue-400';
      case 'portal': return 'text-purple-400';
      case 'speed-boost': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Web3GameWrapper 
      onGameStart={handleStartGame}
      onGameEnd={(score) => handleGameEnd(score)}
      gameScore={gameState.score}
      gameStatus={gameState.status}
    >
      <div className="min-h-screen bg-slate-850 text-slate-100">
      {/* Header */}
      <header className="bg-slate-750 border-b border-slate-600 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-emerald-500 text-2xl">🐍</div>
            <h1 className="text-xl font-bold text-emerald-400">Snake Classic</h1>
            <div className="flex items-center space-x-2">
              <span className={`text-lg ${getGameModeColor(settings.gameMode)}`}>
                {getGameModeIcon(settings.gameMode)}
              </span>
              <span className={`text-sm font-medium capitalize ${getGameModeColor(settings.gameMode)}`}>
                {settings.gameMode} Mode
              </span>
            </div>

          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wide">Score</div>
              <div className="text-lg font-bold text-emerald-400">{gameState.score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wide">High Score</div>
              <div className="text-lg font-bold text-amber-400">
                {topScores.length > 0 ? topScores[0].score : 0}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 min-h-screen">
        <div className="grid lg:grid-cols-3 gap-6 mb-4">
          
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-750 border-slate-600 p-6 min-h-fit">
              {/* Game Canvas */}
              <div className="relative mb-4">
                <GameCanvas 
                  ref={gameRef}
                  gameState={gameState}
                  className="game-canvas rounded-lg bg-slate-800 w-full max-w-lg mx-auto block"
                />
                
                {/* Start Overlay */}
                {gameState.status === 'waiting' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-90 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400 mb-4">Get Ready!</div>
                      <Button 
                        onClick={handleStartGame}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold neon-glow"
                      >
                        Start Game
                      </Button>
                    </div>
                  </div>
                )}

                {/* Game Over Overlay - Always visible when game ends */}
                {gameState.status === 'gameOver' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-95 rounded-lg">
                    <div className="text-center bg-slate-800 rounded-xl p-8 border-2 border-red-500">
                      <div className="text-6xl mb-4">💀</div>
                      <div className="text-2xl font-bold text-red-400 mb-4">Game Over!</div>
                      <div className="text-lg text-emerald-400 mb-6">Final Score: {gameState.score}</div>
                      <div className="space-y-3">
                        <Button 
                          onClick={handleRestartGame}
                          disabled={isSubmittingScore}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold neon-glow"
                        >
                          {isSubmittingScore ? "Saving..." : "Play Again"}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            endGame();
                            setShowGameOver(false);
                          }}
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 px-6 py-2 rounded-lg"
                        >
                          Back to Menu
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls - Always visible for better accessibility */}
              <div className="mt-6">
                {/* Desktop keyboard hints - shown on larger screens only */}
                <div className="hidden md:block text-center mb-6">
                  <div className="text-sm text-slate-400 mb-2">Keyboard Controls</div>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs">↑</span>
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs">↓</span>
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs">←</span>
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs">→</span>
                      </div>
                      <span className="text-xs text-slate-400">Arrow Keys</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs">Space</span>
                      <span className="text-xs text-slate-400">Pause</span>
                    </div>
                  </div>
                </div>

                {/* Touch Controls - Always visible for accessibility */}
                <div className="pb-6">
                  <MobileControls 
                    onDirectionChange={changeDirection}
                    onPause={handlePauseResume}
                    gameStatus={gameState.status}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GameStats 
              snakeLength={gameState.snake.length}
              gameTime={formatTime(gameState.gameTime)}
              speed={`${settings.difficulty === 'easy' ? '1' : settings.difficulty === 'medium' ? '2' : settings.difficulty === 'hard' ? '3' : '4'}x${settings.gameMode === 'speed-boost' ? ' 🚀' : ''}`}
              level={Math.floor(gameState.score / 100) + 1}
            />
            
            <Leaderboard scores={topScores} onRefresh={refetchScores} />

            {/* Settings */}
            <Card className="bg-slate-750 border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-400 block mb-2">Game Mode</Label>
                  <Select
                    value={settings.gameMode}
                    onValueChange={(value: 'classic' | 'portal' | 'speed-boost') => 
                      updateSettings({ gameMode: value })
                    }
                  >
                    <SelectTrigger className="w-full bg-slate-700 text-slate-100 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="portal">Portal</SelectItem>
                      <SelectItem value="speed-boost">Speed Boost</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-slate-500 mt-1">
                    {settings.gameMode === 'classic' && "Hit walls = game over"}
                    {settings.gameMode === 'portal' && "Teleport through walls to opposite side (2x score bonus)"}
                    {settings.gameMode === 'speed-boost' && "Ultra-fast gameplay with challenge bonus scoring"}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-400 block mb-2">Difficulty</Label>
                  <Select
                    value={settings.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard' | 'expert') => 
                      updateSettings({ difficulty: value })
                    }
                  >
                    <SelectTrigger className="w-full bg-slate-700 text-slate-100 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="soundToggle"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ soundEnabled: !!checked })
                    }
                  />
                  <Label htmlFor="soundToggle" className="text-sm">Enable sounds</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="vibrationToggle"
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ vibrationEnabled: !!checked })
                    }
                  />
                  <Label htmlFor="vibrationToggle" className="text-sm">Enable vibration (Mobile)</Label>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      <Dialog open={showGameOver} onOpenChange={setShowGameOver}>
        <DialogContent className="bg-slate-750 border-slate-600 max-w-md" aria-describedby="game-over-description">
          <DialogHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">💀</div>
              <DialogTitle className="text-2xl font-bold text-red-400 mb-2">Game Over!</DialogTitle>
              <DialogDescription id="game-over-description" className="text-slate-400 mb-6">
                Better luck next time!
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{gameState.score}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {topScores.length > 0 ? topScores[0].score : 0}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Best Score</div>
              </div>
            </div>
          </div>

          {showNewHighScore && (
            <div className="bg-amber-900 bg-opacity-30 border border-amber-600 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-amber-400">
                <span>🏆</span>
                <span className="font-semibold">New High Score!</span>
                <span>⭐</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleRestartGame}
              disabled={isSubmittingScore}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold neon-glow"
            >
              {isSubmittingScore ? "Saving..." : "Play Again"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Modal */}
      <Dialog open={showPause} onOpenChange={setShowPause}>
        <DialogContent className="bg-slate-750 border-slate-600 max-w-sm" aria-describedby="pause-description">
          <DialogHeader>
            <div className="text-center">
              <div className="text-4xl mb-4">⏸️</div>
              <DialogTitle className="text-xl font-bold text-amber-400 mb-6">Game Paused</DialogTitle>
              <DialogDescription id="pause-description" className="sr-only">
                Game is paused. Choose to resume or end the game.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                resumeGame();
                setShowPause(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold"
            >
              Resume
            </Button>
            <Button 
              onClick={handleEndGame}
              variant="secondary"
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 px-6 rounded-lg font-semibold"
            >
              End Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </Web3GameWrapper>
  );
}