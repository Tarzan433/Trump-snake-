import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type HighScore } from "@shared/schema";

interface LeaderboardProps {
  scores: HighScore[];
  onRefresh: () => void;
}

export function Leaderboard({ scores, onRefresh }: LeaderboardProps) {
  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "bg-emerald-600";
      case 1: return "bg-slate-600";
      case 2: return "bg-amber-600";
      default: return "bg-slate-700";
    }
  };

  const getScoreColor = (index: number) => {
    switch (index) {
      case 0: return "text-emerald-400";
      case 1: return "text-slate-300";
      case 2: return "text-amber-400";
      default: return "text-slate-300";
    }
  };

  return (
    <Card className="bg-slate-750 border-slate-600 p-6">
      <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center">
        <span className="mr-2">🏆</span>
        Leaderboard
      </h3>
      <div className="space-y-2">
        {scores.length === 0 ? (
          <div className="text-center text-slate-400 py-4">
            No scores yet. Be the first!
          </div>
        ) : (
          scores.slice(0, 10).map((score, index) => (
            <div key={score.id} className="flex items-center justify-between py-2 border-b border-slate-600 last:border-b-0">
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 ${getRankColor(index)} rounded-full flex items-center justify-center text-xs font-bold`}>
                  {index + 1}
                </span>
                <span className="text-slate-300">{score.playerName}</span>
              </div>
              <span className={`font-semibold ${getScoreColor(index)}`}>{score.score}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-600">
        <Button 
          onClick={onRefresh}
          variant="secondary"
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 px-4 rounded-lg text-sm"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </Button>
      </div>
    </Card>
  );
}