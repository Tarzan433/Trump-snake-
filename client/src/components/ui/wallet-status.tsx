import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { connectToMonadTestnet, getCurrentWalletAddress, isConnectedToMonadTestnet } from "@/lib/metamask-connect";
import { web3Manager } from "@/lib/web3";
import { Wallet, Copy, CheckCircle, AlertCircle, RefreshCw, Coins } from "lucide-react";

export function WalletStatus() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [monBalance, setMonBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletAddress("");
      setIsConnected(false);
      setNetworkStatus("Disconnected");
      setMonBalance("0");
    } else {
      setWalletAddress(accounts[0]);
      checkNetworkStatus();
      loadMonBalance(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    checkNetworkStatus();
  };

  const checkConnection = async () => {
    try {
      const address = await getCurrentWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        checkNetworkStatus();
        loadMonBalance(address);
      }
    } catch (error) {
      console.log("No existing connection");
    }
  };

  const checkNetworkStatus = async () => {
    try {
      const isOnMonad = await isConnectedToMonadTestnet();
      if (isOnMonad) {
        setNetworkStatus("Monad Testnet (Chain ID: 10143)");
        setError("");
      } else {
        setNetworkStatus("Wrong Network");
        setError("Please switch to Monad Testnet");
      }
    } catch (error) {
      setNetworkStatus("Unknown");
      setError("Failed to check network");
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      console.log("🚀 Starting wallet connection process...");
      const address = await connectToMonadTestnet();
      
      setWalletAddress(address);
      setIsConnected(true);
      setNetworkStatus("Monad Testnet (Chain ID: 10143)");
      
      // Initialize Web3Manager and load balance
      await web3Manager.connectWallet();
      await loadMonBalance(address);
      
      console.log("✅ Wallet connected successfully:", address);
    } catch (error: any) {
      console.error("❌ Connection failed:", error);
      setError(error.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const loadMonBalance = async (address?: string) => {
    const targetAddress = address || walletAddress;
    if (!targetAddress) return;
    
    setIsLoadingBalance(true);
    try {
      console.log("🔄 Loading MON balance for:", targetAddress);
      const balance = await web3Manager.getMonBalance(targetAddress);
      setMonBalance(balance);
      console.log("💰 MON Balance:", balance);
    } catch (error: any) {
      console.error("❌ Failed to load MON balance:", error);
      setMonBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        console.log("📋 Address copied to clipboard");
      } catch (error) {
        console.error("Failed to copy address");
      }
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-600 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Wallet Connection</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConnection}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm text-slate-300">
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        </div>

        {/* Wallet Address Display */}
        {walletAddress && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Wallet Address:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 px-2 text-slate-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-sm font-mono text-green-400 break-all">
              {walletAddress}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} (Short)
            </div>
          </div>
        )}

        {/* Network Status */}
        {networkStatus && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-sm text-slate-400 mb-1">Network:</div>
            <div className={`text-sm font-semibold ${
              networkStatus.includes("Monad Testnet") ? "text-green-400" : "text-orange-400"
            }`}>
              {networkStatus}
            </div>
          </div>
        )}

        {/* MON Balance Display */}
        {walletAddress && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">MON Balance:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadMonBalance()}
                disabled={isLoadingBalance}
                className="h-6 px-2 text-slate-400 hover:text-white"
              >
                {isLoadingBalance ? "⏳" : "🔄"}
              </Button>
            </div>
            <div className="text-lg font-bold text-green-400 flex items-center">
              <Coins className="w-4 h-4 mr-2" />
              {parseFloat(monBalance).toFixed(4)} MON
            </div>
            {parseFloat(monBalance) === 0 && (
              <div className="text-xs text-slate-500 mt-1">
                Use the faucet to get test tokens
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
            <div className="text-sm text-red-400">{error}</div>
          </div>
        )}

        {/* Connect Button */}
        {!isConnected && (
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect to Monad Testnet"}
          </Button>
        )}

        {/* Network Configuration Display */}
        <div className="bg-slate-700 rounded-lg p-3 text-xs text-slate-400">
          <div className="font-semibold mb-1">Monad Testnet Config:</div>
          <div>Chain ID: 10143 (0x279f)</div>
          <div>RPC: https://testnet-rpc.monad.xyz</div>
          <div>Symbol: MON</div>
          <div>Explorer: https://explorer.testnet.monad.xyz</div>
        </div>
      </div>
    </Card>
  );
}