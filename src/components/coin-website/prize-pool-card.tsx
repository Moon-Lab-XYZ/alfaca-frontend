import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sdk from "@farcaster/frame-sdk";
import { createClient } from "@supabase/supabase-js";
import useSWR from "swr";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Base prize pool amount - we'll add the 0.25% of volume to this
const DAILY_PRIZE_POOL_BASE_AMOUNT = 10;

interface PrizePoolCardProps {
  ticker: string;
  contractAddress: string;
  link: string;
  initialPrizePool?: number;
  timeLeft: any;
  tokenId: number;
}

export const PrizePoolCard = ({
  ticker,
  contractAddress,
  link,
  initialPrizePool,
  timeLeft,
  tokenId
}: PrizePoolCardProps) => {
  const { toast } = useToast();

  // Fetch the prize pool data
  const { data: prizePoolData, isLoading } = useSWR(
    [`prize-pool-${tokenId}`, tokenId],
    async ([_, tokenId]) => {
      try {
        // Get the current round for this token
        const { data: roundData, error: roundError } = await supabase
          .from('sg_rounds')
          .select('id, prize_pool_amount, base_prize_pool_amount')
          .eq('token', tokenId)
          .eq('status', 'ACTIVE')
          .order('round_end_time', { ascending: false })
          .limit(1)
          .single();

        if (roundData) {
          return roundData.prize_pool_amount + roundData.base_prize_pool_amount;
        } else {
          return 0;
        }
      } catch (error) {
        console.error('Error in fetching prize pool data:', error);
        return 0;
      }
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      fallbackData: initialPrizePool || DAILY_PRIZE_POOL_BASE_AMOUNT
    }
  );

  const formatTime = (timeObj: any) => {
    return (
      <>
        <span className="text-white">{timeObj.hours}</span>
        <span className="text-white/50">h </span>
        <span className="text-white">{timeObj.minutes}</span>
        <span className="text-white/50">min </span>
        <span className="text-white">{timeObj.seconds}</span>
        <span className="text-white/50">sec remaining</span>
      </>
    );
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    toast({
      description: "Contract address copied to clipboard",
      duration: 2000,
    });
  };

  const handleDexScreener = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const context = await sdk.context;
    if (context) {
      await sdk.actions.openUrl(link);
    } else {
      window.open(link, "_blank");
    }
  };

  return (
    <div className="bg-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.4)] rounded-2xl mb-8">
      <div className="py-4 px-4 text-center">
        <div>
          <div className="font-bold text-2xl text-white">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : (
              `~$${prizePoolData.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </div>
          <div className="text-sm text-white/50 mt-2 flex items-center justify-center gap-0.5">
            {formatTime(timeLeft)}
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleCopyAddress}
              className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-2 px-4 text-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              <Copy size={16} /> CA
            </button>
            <button
              onClick={handleDexScreener}
              className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-2 px-4 text-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              <ExternalLink size={16} /> DEX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};