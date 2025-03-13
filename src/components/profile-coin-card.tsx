import { useState, useEffect } from "react";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  useWalletClient,
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi";
import { mutate } from "swr";
import useUser from "@/lib/user";
import sdk from "@farcaster/frame-sdk";

const lpLockerAbi = [
  {
    name: "getLpTokenIdsForUser",
    inputs: [{ type: "address", name: "user" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    name: "_userRewardRecipientForToken",
    inputs: [{ type: "uint256" }],
    outputs: [
      { type: "address", name: "recipient" },
      { type: "uint256", name: "lpTokenId" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    name: "collectRewards",
    inputs: [{ type: "uint256", name: "_tokenId" }],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const LP_LOCKER_ADDRESS = "0xD98A99d3c757eB9b115272AF6c5FC311DFA668D2";

// Available gradients for the coin cards
const pastelGradients = [
  "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
  "linear-gradient(90deg, rgb(245,152,168) 0%, rgb(246,237,178) 100%)",
  "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)",
  "linear-gradient(to top, #d299c2 0%, #fef9d7 100%)",
  "linear-gradient(to top, #e6b980 0%, #eacda3 100%)",
  "linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)",
  "linear-gradient(to right, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(to top, #96fbc4 0%, #f9f586 100%)",
  "linear-gradient(to right, #fff1eb 0%, #ace0f9 100%)",
  "linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)",
  "linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(to right, #84fab0 0%, #8fd3f4 100%)",
];

interface ProfileCoinCardProps {
  name: string;
  ticker: string;
  image: string;
  volume24h: number;
  contractAddress: string;
  dexScreenerLink: string;
  userAddress?: string;
  isOwnProfile?: boolean;
  earnedRewards?: number;
}

export const ProfileCoinCard = ({
  name,
  ticker,
  image,
  volume24h,
  contractAddress,
  dexScreenerLink,
  userAddress,
  isOwnProfile = false,
  earnedRewards = 0
}: ProfileCoinCardProps) => {
  const { toast } = useToast();
  const { data: walletClient } = useWalletClient();
  const { data: user } = useUser();

  // Writing contracts
  const {
    writeContract,
    data: claimTxHash,
    isPending: isClaimLoading,
    error: claimError
  } = useWriteContract();

  // Transaction status
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  // Combined loading state
  const collectingTokenId = isClaimLoading || isConfirming ? "all" : null;

  useEffect(() => {
    if (isConfirmed) {
      toast({
        description: `Successfully claimed rewards!`,
        duration: 2000,
      });
    }
  }, [isConfirmed, toast]);

  useEffect(() => {
    if (claimError) {
      toast({
        variant: "destructive",
        description: `Failed to claim rewards: ${claimError.message}`,
        duration: 3000,
      });
    }
  }, [claimError, toast]);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    }
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const getGradient = () => {
    const index = ticker.length % pastelGradients.length;
    return pastelGradients[index];
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contractAddress);
    toast({
      description: "Contract address copied",
      duration: 2000,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/user/${user.user.id}`);
    toast({
      description: "Share link copied",
      duration: 2000,
    });
  };

  const handleDexScreener = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await sdk.actions.openUrl(dexScreenerLink);
  };

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!walletClient) {
      toast({
        variant: "destructive",
        description: "Wallet not connected",
        duration: 3000,
      });
      return;
    }

    try {
      writeContract({
        address: LP_LOCKER_ADDRESS,
        abi: lpLockerAbi,
        functionName: 'collectRewards',
        args: [2241997n], // Using hardcoded token ID as in the original
      }, {
        onSuccess: () => {
          mutate('userTokens');
        }
      });

      toast({
        description: `Transaction submitted, waiting for confirmation...`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error claiming rewards:", error);
      toast({
        variant: "destructive",
        description: `Failed to submit transaction: ${error.message}`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl overflow-hidden border border-white/10"
          style={{ background: getGradient() }}
        >
          {image.includes('placeholder') ? (
            <div className="w-full h-full flex items-center justify-center text-black/50 text-lg font-medium">
              {ticker[0]}
            </div>
          ) : (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white/90">{name}</h3>
              <p className="text-sm text-white/50">${ticker}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-[#00FF03]">
                {formatVolume(volume24h)}
              </p>
              <p className="text-sm text-white/50">Last 24h Volume</p>
            </div>
          </div>

          <div className="flex gap-2 mt-3 justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleCopyAddress}
                className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
              >
                <Copy size={14} /> {contractAddress.slice(0, 5)}...{contractAddress.slice(-4)}
              </button>
              <button
                onClick={handleDexScreener}
                className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
              >
                <ExternalLink size={14} /> DEX
              </button>
            </div>
            <button
              onClick={handleShare}
              className="place-self-end flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              Share
            </button>
          </div>

          {isOwnProfile && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/50">Earned Rewards</p>
                  <p className="text-sm font-medium text-[#E5DEFF]">~${earnedRewards.toFixed(4)}</p>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={!!collectingTokenId}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-4 text-xs transition-colors ${
                    !!collectingTokenId
                      ? "bg-[#E5DEFF]/50 text-black/50 cursor-not-allowed"
                      : "bg-[#E5DEFF] text-black hover:bg-[#E5DEFF]/90"
                  }`}
                >
                  <Wallet size={14} /> {collectingTokenId ? "Claiming..." : "Claim Rewards"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};