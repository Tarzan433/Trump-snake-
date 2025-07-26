import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { connectToMonadTestnet, getCurrentWalletAddress, isConnectedToMonadTestnet } from "@/lib/metamask-connect";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Simple wallet connect component using the standalone MetaMask function
 * This is a basic example showing how to use the connectToMonadTestnet function
 */
export function SimpleWalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectedToCorrectNetwork, setIsConnectedToCorrectNetwork] = useState(false);
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Use the standalone function to connect to MetaMask and switch to Monad Testnet
      const address = await connectToMonadTestnet();
      
      setWalletAddress(address);
      setIsConnectedToCorrectNetwork(true);
      
      toast({
        title: "Wallet Connected Successfully!",
        description: `Connected to Monad Testnet\nAddress: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Connection failed:", error);
      
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnection = async () => {
    try {
      const address = await getCurrentWalletAddress();
      const correctNetwork = await isConnectedToMonadTestnet();
      
      setWalletAddress(address || "");
      setIsConnectedToCorrectNetwork(correctNetwork);
      
      if (address && correctNetwork) {
        toast({
          title: "Wallet Status",
          description: `Connected to Monad Testnet\nAddress: ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } else if (address && !correctNetwork) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Monad Testnet",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Not Connected",
          description: "No wallet connected",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to check connection:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          MetaMask Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletAddress ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isConnectedToCorrectNetwork ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {isConnectedToCorrectNetwork ? "Connected to Monad Testnet" : "Wrong Network"}
              </span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Address:</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={checkConnection}
              className="w-full"
            >
              Check Connection Status
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your MetaMask wallet to the Monad Testnet
            </p>
            <Button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Network:</strong> Monad Testnet</p>
          <p><strong>Chain ID:</strong> 10143 (0x279f)</p>
          <p><strong>RPC URL:</strong> https://testnet-rpc.monad.xyz</p>
          <p><strong>Explorer:</strong> https://explorer.testnet.monad.xyz</p>
        </div>
      </CardContent>
    </Card>
  );
}