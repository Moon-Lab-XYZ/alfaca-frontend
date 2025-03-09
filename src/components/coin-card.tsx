
import { useState, useMemo } from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation'
import { CreatorInfo } from "./creator-info";
import { OtherCoinsButton } from "./other-coins-button";
import { pastelGradients } from "@/lib/coin-card-utils";

interface CoinCardProps {
  user_id: number;
  user_name: string;
  farcaster_username: string;
  avatar_url: string;
  total_txn_vol_last_24h: number;
  token_count: number;
  tokens: any;
  simplified?: boolean;
  rank: number;
}

export const CoinCard = ({
  user_id,
  user_name,
  farcaster_username,
  avatar_url,
  total_txn_vol_last_24h,
  token_count,
  tokens,
  rank,
  simplified = false
}: CoinCardProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const router = useRouter()

  // Use rank to generate consistent but different gradients
  const avatarGradient = useMemo(() => {
    const index = rank % pastelGradients.length;
    return pastelGradients[index];
  }, [rank]);

  const coinGradient = useMemo(() => {
    const index = (rank + 1) % pastelGradients.length;
    return pastelGradients[index];
  }, [rank]);

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubscribed(!isSubscribed);
    toast({
      description: isSubscribed
        ? `Unsubscribed from ${farcaster_username}`
        : `Subscribed to ${farcaster_username}`,
      duration: 2000,
    });
  };

  const handleClick = () => {
    // router.push(`/coin/${ticker.toLowerCase()}`);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/${user_id}`);
  };

  const handleCreatorCoinsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/${user_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-[#1A1A1A] rounded-2xl p-4 ${
        rank === 1
          ? 'border-2 border-[#E5DEFF] shadow-[0_0_15px_rgba(229,222,255,0.3)]'
          : 'border border-white/5 hover:border-white/10'
      } transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center gap-4">
        <div className="text-xl font-semibold text-white/90">
          #{rank}
        </div>

        <CreatorInfo
          username={farcaster_username}
          image={avatar_url}
          volume24h={total_txn_vol_last_24h}
          gradient={avatarGradient}
          onClick={handleCreatorClick}
        />

        {/* <button
          onClick={handleSubscribe}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isSubscribed
              ? 'bg-[#9b87f5]/20 text-[#9b87f5] border border-[#9b87f5]/30'
              : 'text-white/30 hover:text-white/70 bg-black/40 hover:bg-black/60'
          }`}
        >
          <Bell className="w-5 h-5" strokeWidth={2} />
        </button> */}
      </div>

      {tokens && tokens.length > 0 && (
        <OtherCoinsButton
          ticker={tokens[0].symbol}
          image={tokens[0].image}
          gradient={coinGradient}
          coinsCount={token_count - 1}
          onClick={handleCreatorCoinsClick}
        />
      )}
    </div>
  );
};
