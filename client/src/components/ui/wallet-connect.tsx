import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { web3Manager } from "@/lib/web3";
import { Wallet, Copy, ExternalLink, Coins } from "lucide-react";

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
}

export function WalletConnect({ onWalletConnected }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [monBalance, setMonBalance] = useState<string>("0");
  const [isGettingTokens, setIsGettingTokens] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadMonBalance();
    }
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    if (window.ethereum && web3Manager.isConnected()) {
      try {
        const signer = web3Manager.getSigner();
        if (signer) {
          const address = await signer.getAddress();
          setWalletAddress(address);
          onWalletConnected?.(address);
        }
      } catch (error) {
        console.log("No existing wallet connection");
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      console.log('🚀 Initiating wallet connection...');
      const address = await web3Manager.connectWallet();
      setWalletAddress(address);
      onWalletConnected?.(address);
      
      // Display wallet address on screen
      console.log('✅ Wallet connected successfully:', address);
      
      toast({
        title: "Wallet Connected!",
        description: `Connected to Monad Testnet: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      
      // Show alert with error message
      alert(`Wallet Connection Failed: ${error.message}`);
      
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const loadMonBalance = async () => {
    if (!walletAddress) return;
    
    try {
      const balance = await web3Manager.getMonBalance(walletAddress);
      setMonBalance(balance);
    } catch (error) {
      console.error("Failed to load MON balance:", error);
    }
  };

  const getTokensFromFaucet = async () => {
    setIsGettingTokens(true);
    try {
      await web3Manager.getMonFromFaucet();
      toast({
        title: "Tokens Received!",
        description: "You received 100 MON tokens from the faucet",
      });
      
      // Reload balance after getting tokens
      setTimeout(() => {
        loadMonBalance();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Faucet Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGettingTokens(false);
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openInExplorer = () => {
    if (walletAddress) {
      window.open(`https://testnet-explorer.monad.xyz/address/${walletAddress}`, '_blank');
    }
  };

  if (!walletAddress) {
    return (
      <Card className="bg-slate-750 border-slate-600 p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">🦊</div>
          <h3 className="text-lg font-semibold text-slate-300">Connect Your Wallet</h3>
          <p className="text-sm text-slate-400">
            Connect your MetaMask wallet to play the Snake Game on Monad testnet
          </p>
          
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>

          <div className="text-xs text-slate-500 mt-4">
            <p>Don't have MetaMask? <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Download here
            </a></p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-750 border-slate-600 p-6">
      <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
        <Wallet className="w-5 h-5 mr-2" />
        Wallet Connected
      </h3>
      
      <div className="space-y-4">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Address:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 px-2 text-slate-400 hover:text-slate-300"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openInExplorer}
                className="h-6 px-2 text-slate-400 hover:text-slate-300"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="text-sm font-mono text-emerald-400">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">MON Balance:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMonBalance}
              className="h-6 px-2 text-slate-400 hover:text-slate-300"
            >
              🔄
            </Button>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {parseFloat(monBalance).toFixed(2)} MON
          </div>
        </div>

        {parseFloat(monBalance) < 0.01 && (
          <Button 
            onClick={getTokensFromFaucet}
            disabled={isGettingTokens}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Coins className="w-4 h-4 mr-2" />
            {isGettingTokens ? "Getting Tokens..." : "Get 100 MON (Faucet)"}
          </Button>
        )}

        <div className="text-xs text-slate-500 text-center">
          <p>Network: Monad Testnet</p>
          <p>Need MON tokens to play the game</p>
        </div>
      </div>
    </Card>
  );
}