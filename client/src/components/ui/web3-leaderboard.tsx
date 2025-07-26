import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { web3Manager } from "@/lib/web3";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  address: string;
  score: number;
}

interface Web3LeaderboardProps {
  currentWallet?: string;
  className?: string;
}

// Example wallet addresses for the leaderboard
const DEMO_WALLETS = [
  "0x742d35Cc6634C0532925a3b8D4bD73FbE095Bf2D",
  "0x8ba1f109551bD432803012645Hac136c22C0d2cA",
  "0x9F5c1E4e0b4A1B9b8C7d6e5f4a3b2c1d0e9F8a7b",
  "0xaB3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c",
  "0xbC2d3E4f5A6b7C8d9E0f1A2b3C4d5E6f7A8b9C0d"
];

export function Web3Leaderboard({ currentWallet, className }: Web3LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [currentWallet]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create list of wallets to check (including current wallet if connected)
      const walletsToCheck = [...DEMO_WALLETS];
      if (currentWallet && !walletsToCheck.includes(currentWallet)) {
        walletsToCheck.unshift(currentWallet);
      }

      // Call getHighScore() for multiple wallet addresses
      const leaderboardData = await web3Manager.getLeaderboard(walletsToCheck);
      
      // Filter out zero scores for cleaner display
      const filteredData = leaderboardData.filter(entry => entry.score > 0);
      
      setLeaderboard(filteredData);
    } catch (error: any) {
      console.error("Failed to load leaderboard:", error);
      setError("Contracts not deployed yet. Deploy contracts to see leaderboard.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-slate-400 font-bold">{index + 1}</span>;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className={`bg-slate-800 border-slate-600 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-300">🏆 Blockchain Leaderboard</h3>
        <button
          onClick={loadLeaderboard}
          disabled={isLoading}
          className="text-emerald-400 hover:text-emerald-300 text-sm disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : leaderboard.length === 0 && !isLoading ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm">No scores recorded yet. Play to be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <div
              key={entry.address}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.address === currentWallet
                  ? "bg-emerald-900/30 border border-emerald-500/30"
                  : "bg-slate-750 hover:bg-slate-700"
              } transition-colors`}
            >
              <div className="flex items-center space-x-3">
                {getRankIcon(index)}
                <div>
                  <div className="font-mono text-sm text-slate-300">
                    {formatAddress(entry.address)}
                  </div>
                  {entry.address === currentWallet && (
                    <div className="text-xs text-emerald-400">You</div>
                  )}
                </div>
              </div>
              <div className="text-emerald-400 font-bold text-lg">
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-600">
        <p className="text-xs text-slate-400 text-center">
          Scores fetched directly from smart contract using getHighScore()
        </p>
      </div>
    </Card>
  );
}