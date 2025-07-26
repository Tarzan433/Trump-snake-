import { Card } from "@/components/ui/card";

interface GameStatsProps {
  snakeLength: number;
  speed: string;
  gameTime: string;
  level: number;
}

export function GameStats({ snakeLength, speed, gameTime, level }: GameStatsProps) {
  return (
    <Card className="bg-slate-750 border-slate-600 p-6">
      <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Game Stats
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Length</span>
          <span className="font-semibold">{snakeLength}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Speed</span>
          <span className="font-semibold">{speed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Time</span>
          <span className="font-semibold">{gameTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Level</span>
          <span className="font-semibold text-amber-400">{level}</span>
        </div>
      </div>
    </Card>
  );
}