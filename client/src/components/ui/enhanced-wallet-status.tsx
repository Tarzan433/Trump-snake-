import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { checkMonBalance, validateGameRequirements } from "@/lib/balance-checker";
import { Wallet, RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

interface EnhancedWalletStatusProps {
  walletAddress: string;
  onBalanceUpdate?: (balance: string, canPlay: boolean) => void;
}

export function EnhancedWalletStatus({ walletAddress, onBalanceUpdate }: EnhancedWalletStatusProps) {
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const monTokenAddress = import.meta.env.VITE_MON_TOKEN_ADDRESS;

  useEffect(() => {
    if (walletAddress) {
      checkBalance();
    }
  }, [walletAddress]);

  const checkBalance = async () => {
    setIsLoading(true);
    try {
      const validation = await validateGameRequirements(walletAddress, monTokenAddress);
      
      setBalance(validation.balance);
      setCanPlay(validation.canPlay);
      setStatusMessage(validation.message);
      setSuggestions(validation.suggestions);
      
      onBalanceUpdate?.(validation.balance, validation.canPlay);
      
    } catch (error: any) {
      toast({
        title: "Balance Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deployContractsManually = () => {
    toast({
      title: "Contract Deployment Required",
      description: "The MON token contracts need to be deployed to Monad testnet. This requires a private key with testnet ETH for gas fees.",
      duration: 8000,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Status
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={checkBalance}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Address */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address:</div>
            <div className="font-mono text-sm break-all">{walletAddress}</div>
          </div>

          {/* MON Balance */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">MON Balance:</div>
              <div className="text-xl font-bold">
                {balance} MON
              </div>
            </div>
            <div className="flex items-center">
              {canPlay ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Status Message */}
          <Alert>
            <AlertDescription>
              {statusMessage}
            </AlertDescription>
          </Alert>

          {/* Contract Not Deployed Warning */}
          {!monTokenAddress && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>MON Token Contract Not Deployed</strong>
                <br />
                The MON token contract hasn't been deployed to Monad testnet yet. To fix this:
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Get some testnet ETH from a Monad faucet</li>
                  <li>Deploy the contracts using your private key</li>
                  <li>Set the contract addresses in environment variables</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Suggestions:</div>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!monTokenAddress && (
              <Button 
                onClick={deployContractsManually}
                variant="outline"
                className="flex-1"
              >
                Deploy Contracts
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.open('https://explorer.testnet.monad.xyz', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Explorer
            </Button>
          </div>

          {/* Network Info */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div>Network: Monad Testnet</div>
            <div>Chain ID: 10143 (0x279f)</div>
            <div>RPC: https://testnet-rpc.monad.xyz</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export the clean JavaScript balance checking function
export const cleanBalanceChecker = `
// Clean JavaScript MON balance checker for Monad Testnet
async function checkMonadBalance(walletAddress, tokenAddress) {
  try {
    // Check if we're on Monad Testnet
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x279f') { // 10143 in hex
        throw new Error('Please switch to Monad Testnet (Chain ID: 10143)');
      }
    }

    if (!tokenAddress) {
      throw new Error('MON token contract not deployed - deploy contracts first');
    }

    // Create provider and check balance
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    const balanceWei = await tokenContract.balanceOf(walletAddress);
    const balanceEther = ethers.formatEther(balanceWei);
    const balanceNum = parseFloat(balanceEther);

    return {
      balance: balanceEther,
      formatted: balanceNum.toFixed(4),
      canPlay: balanceNum >= 0.01, // Minimum 0.01 MON required
      message: balanceNum >= 0.01 
        ? \`Ready to play! Balance: \${balanceNum.toFixed(4)} MON\`
        : \`Insufficient MON. Current: \${balanceNum.toFixed(4)}, Required: 0.01\`
    };
  } catch (error) {
    return {
      balance: '0',
      formatted: '0.0000',
      canPlay: false,
      message: \`Error: \${error.message}\`
    };
  }
}

// Usage example:
// const result = await checkMonadBalance(walletAddress, monTokenAddress);
// console.log(result.message);
// if (result.canPlay) { startGame(); }
`;