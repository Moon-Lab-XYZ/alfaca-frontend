
import { useState } from "react";
import { Copy, ExternalLink, Sparkles, AtSign, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import sdk from "@farcaster/frame-sdk";
import { useRouter } from "next/navigation";

interface SimpleCoinCardProps {
  id: number;
  name: string;
  symbol: string;
  image: string;
  txn_vol_last_24h: number;
  market_cap: number;
  contract_address: string;
  link: string;
  users: any;
  is_sg: boolean;
}

export const SimpleCoinCard = ({
  id,
  name,
  symbol,
  image,
  txn_vol_last_24h,
  market_cap,
  contract_address,
  link,
  users,
  is_sg,
}: SimpleCoinCardProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [imageLoaded, setImageLoaded] = useState(false);

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return `$${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `$${(number / 1000).toFixed(1)}K`;
    }
    return `$${number.toFixed(1)}`;
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contract_address);
    toast({
      description: "Contract address copied",
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

  const handleStealClick = () => {
    router.push(`/token/${id}/steal`);
  }

  return (
    <div
      className="bg-[#1a1a1a] backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/5 transition-all duration-300 hover:shadow-md animate-fade-up"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-xl overflow-hidden bg-[#E2D1C3] flex items-center justify-center shrink-0"
        >
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="flex-1 relative">
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-semibold text-white max-w-[200px] overflow-ellipsis overflow-hidden whitespace-nowrap">{name}</h3>
            <p className="text-sm text-white overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
              ${symbol}
            </p>
            <p className="text-xs mt-1 flex items-center">
              <span className="text-white">created by @{users.farcaster_username}</span>
              {/* {creator.followers > 0 && (
                <span className="flex items-center ml-2 text-white/80">
                  <Users size={10} className="mr-1" />
                  <span>{formatFollowers(creator.followers)}</span>
                </span>
              )} */}
            </p>
          </div>

          <div className="absolute top-0 right-0">
            <p className="text-lg font-semibold text-[#00FF03]">
              {formatNumber(txn_vol_last_24h)}
            </p>
            <p className="text-xs text-white/50 text-right">24h Vol</p>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={handleCopyAddress}
              className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              <Copy size={14} /> {contract_address.slice(0, 5)}...{contract_address.slice(-4)}
            </button>
            <button
              onClick={handleDexScreener}
              className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              <ExternalLink size={14} /> DEX
            </button>
          </div>
          {
            is_sg ?
            <button
              onClick={handleStealClick}
              className="flex items-center justify-center gap-1.5 bg-[#E5DEFF] rounded-lg py-1.5 px-3 text-md text-black font-medium hover:bg-[#E5DEFF]/90 transition-all duration-300 hover:scale-105 w-full mt-3"
            >
              Steal <Sparkles size={14} className="text-[#FFB800] ml-1 animate-sword-glow" />
            </button>
            : null
          }
        </div>
      </div>
    </div>
  );
};
