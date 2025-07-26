import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { connectToMonadTestnet, getCurrentWalletAddress, isConnectedToMonadTestnet } from "@/lib/metamask-connect";
import { Wallet, CheckCircle, AlertTriangle } from "lucide-react";

interface MetaMaskConnectButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  className?: string;
}

/**
 * Clean MetaMask connection button for Monad Testnet
 * Works on both desktop and mobile MetaMask browsers
 */
export function MetaMaskConnectButton({ 
  onConnect, 
  onDisconnect,
  className = "" 
}: MetaMaskConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { toast } = useToast();

  // Check initial connection status
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const address = await getCurrentWalletAddress();
      const correctNetwork = await isConnectedToMonadTestnet();
      
      setWalletAddress(address || "");
      setIsCorrectNetwork(correctNetwork);
      
      if (address && correctNetwork) {
        onConnect?.(address);
      }
    } catch (error) {
      // Silent check - don't show errors for initial status check
      setWalletAddress("");
      setIsCorrectNetwork(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const address = await connectToMonadTestnet();
      
      setWalletAddress(address);
      setIsCorrectNetwork(true);
      onConnect?.(address);
      
      toast({
        title: "MetaMask Connected!",
        description: `Connected to Monad Testnet\n${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Provide user-friendly error messages
      if (errorMessage.includes('MetaMask is not installed')) {
        errorMessage = 'Please install MetaMask or open this page in MetaMask mobile browser';
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = 'Connection was cancelled';
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
    setIsCorrectNetwork(false);
    onDisconnect?.();
    
    toast({
      title: "Wallet Disconnected",
      description: "MetaMask has been disconnected",
    });
  };

  // If wallet is connected
  if (walletAddress) {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        <div className="flex items-center space-x-2 text-sm">
          {isCorrectNetwork ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            {isCorrectNetwork ? "Monad Testnet" : "Wrong Network"}
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkConnectionStatus}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  // Connect button
  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`flex items-center space-x-2 ${className}`}
    >
      <Wallet className="h-4 w-4" />
      <span>
        {isConnecting ? "Connecting..." : "Connect MetaMask"}
      </span>
    </Button>
  );
}

// Pure JavaScript function for direct use (no React dependencies)
export const connectMetaMaskToMonad = async () => {
  const MONAD_CONFIG = {
    chainId: '0x279f', // 10143 in hex
    chainName: 'Monad Testnet',
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18,
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://explorer.testnet.monad.xyz'],
  };

  if (!window.ethereum) {
    throw new Error('MetaMask not installed. Please install MetaMask or use MetaMask mobile browser.');
  }

  try {
    // Check if already connected
    const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' });
    const userAddress = existingAccounts?.[0] || 
      (await window.ethereum.request({ method: 'eth_requestAccounts' }))?.[0];

    if (!userAddress) {
      throw new Error('No wallet found');
    }

    // Check current network
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (currentChainId !== MONAD_CONFIG.chainId) {
      try {
        // Try to switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Add network if it doesn't exist
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_CONFIG],
          });
        } else {
          throw switchError;
        }
      }
    }

    return userAddress;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected request');
    }
    throw error;
  }
};