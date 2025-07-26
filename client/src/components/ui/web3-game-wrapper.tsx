import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { web3Manager } from "@/lib/web3";
import { WalletConnect } from "./wallet-connect";
import { Web3Leaderboard } from "./web3-leaderboard";
import { WalletStatus } from "./wallet-status";
import { Trophy, Shield, Coins, Play } from "lucide-react";

interface Web3GameWrapperProps {
  children: React.ReactNode;
  onGameStart?: () => void;
  onGameEnd?: (score: number) => void;
  gameScore?: number;
  gameStatus?: string;
}

export function Web3GameWrapper({ 
  children, 
  onGameStart, 
  onGameEnd, 
  gameScore = 0, 
  gameStatus = "waiting" 
}: Web3GameWrapperProps) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [hasGameAccess, setHasGameAccess] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [hasNFT, setHasNFT] = useState<boolean>(false);
  const [monBalance, setMonBalance] = useState<string>("0");
  const { toast } = useToast();

  useEffect(() => {
    if (walletAddress) {
      loadPlayerData();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (gameStatus === 'gameOver' && gameScore > 0 && walletAddress && hasGameAccess) {
      submitScoreToBlockchain();
    }
  }, [gameStatus, gameScore, walletAddress, hasGameAccess]);

  const loadPlayerData = async () => {
    if (!walletAddress) return;

    try {
      const [score, nftStatus, balance] = await Promise.all([
        web3Manager.getHighScore(walletAddress),
        web3Manager.hasReceivedNFT(walletAddress),
        web3Manager.getMonBalance(walletAddress)
      ]);

      setHighScore(score);
      setHasNFT(nftStatus);
      setMonBalance(balance);
    } catch (error) {
      console.error("Failed to load player data:", error);
    }
  };

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
  };

  const startWeb3Game = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // New contract doesn't require MON tokens to play - games are free!
    // Players get MON rewards for high scores instead
    setIsStartingGame(true);
    try {
      // Start the game (no fee required)
      await web3Manager.startGame();
      
      setHasGameAccess(true);
      onGameStart?.();
      
      toast({
        title: "Game Started!",
        description: "Free to play! Score 50+ to earn MON rewards + NFT!",
      });

    } catch (error: any) {
      toast({
        title: "Game Start Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsStartingGame(false);
    }
  };

  const submitScoreToBlockchain = async () => {
    if (!walletAddress || gameScore === 0) return;

    setIsSubmittingScore(true);
    try {
      // Call the smart contract submitScore function using ethers.js
      const result = await web3Manager.submitScore(gameScore);
      
      // Show "Minted NFT!" message on success
      toast({
        title: "Minted NFT!",
        description: `Score ${gameScore} submitted! NFT minted to your wallet.`,
      });

      // If score >= 50, show "You earned 1 MON!" and display updated wallet balance
      if (gameScore >= 50 && result.earnedReward) {
        setTimeout(() => {
          toast({
            title: "You earned 1 MON!",
            description: "Congratulations on your high score!",
          });
        }, 1500);

        // Update wallet balance
        setTimeout(async () => {
          try {
            const newBalance = await web3Manager.getMonBalance(walletAddress);
            setMonBalance(newBalance);
          } catch (error) {
            console.error("Failed to update balance:", error);
          }
        }, 2000);
      }

      // Reload player data to get updated high score
      setTimeout(() => {
        loadPlayerData();
      }, 3000);

    } catch (error: any) {
      toast({
        title: "Score Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingScore(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <WalletStatus />
          <WalletConnect onWalletConnected={handleWalletConnected} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Web3 Status Bar */}
      <div className="mb-4">
        <Card className="bg-slate-750 border-slate-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-slate-400">Wallet:</span>
                <span className="text-emerald-400 font-mono ml-2">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-slate-400">MON:</span>
                <span className="text-emerald-400 font-bold ml-2">
                  {parseFloat(monBalance).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {highScore > 0 && (
                <div className="flex items-center text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-slate-300">{highScore}</span>
                </div>
              )}
              
              {hasNFT && (
                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 text-purple-400 mr-1" />
                  <span className="text-purple-400">Champion NFT</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Game Access Control */}
      {!hasGameAccess ? (
        <div className="flex justify-center mb-6">
          <Card className="bg-slate-750 border-slate-600 p-6 text-center max-w-md">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-slate-300 mb-4">Ready to Play?</h3>
            <p className="text-slate-400 mb-6">
              Pay 1 MON token to start playing the Snake Game on Monad blockchain
            </p>
            
            <Button 
              onClick={startWeb3Game}
              disabled={isStartingGame || parseFloat(monBalance) < 1}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
            >
              <Coins className="w-5 h-5 mr-2" />
              {isStartingGame ? "Starting Game..." : "Pay 1 MON & Play"}
            </Button>

            {parseFloat(monBalance) < 1 && (
              <p className="text-red-400 text-sm mt-3">
                Insufficient MON tokens. Use the faucet above to get tokens.
              </p>
            )}
          </Card>
        </div>
      ) : (
        <>
          {/* Game Component */}
          {children}
          
          {/* Score Submission Status */}
          {isSubmittingScore && (
            <div className="fixed bottom-4 right-4">
              <Card className="bg-slate-800 border-slate-600 p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
                  <span className="text-slate-300">Submitting score to blockchain...</span>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Web3 Game Info and Leaderboard */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-750 border-slate-600 p-4">
          <h4 className="text-lg font-semibold text-slate-300 mb-3">🌐 Web3 Features</h4>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🆓</div>
              <div className="text-slate-400">Entry Fee</div>
              <div className="text-emerald-400 font-semibold">Free to Play</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-slate-400">MON Rewards</div>
              <div className="text-emerald-400 font-semibold">Score 50+</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-slate-400">NFT Reward</div>
              <div className="text-emerald-400 font-semibold">Every Game</div>
            </div>
          </div>
        </Card>

        <Web3Leaderboard currentWallet={walletAddress} />
      </div>
    </div>
  );
}