
import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sdk from "@farcaster/frame-sdk";

interface PrizePoolCardProps {
  ticker: string;
  contractAddress: string;
  link: string;
  initialPrizePool: number;
  timeLeft: number;
}

export const PrizePoolCard = ({ ticker, contractAddress, link, initialPrizePool, timeLeft }: PrizePoolCardProps) => {
  const [prizePool, setPrizePool] = useState(initialPrizePool);
  const { toast } = useToast();

  useEffect(() => {
    const prizeInterval = setInterval(() => {
      setPrizePool(current => {
        const increase = Math.random() * 0.5 + 0.1;
        return Number((current + increase).toFixed(2));
      });
    }, 1000);

    return () => clearInterval(prizeInterval);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = Math.floor((mins % 1) * 60);
    return (
      <>
        <span className="text-white">{hours}</span>
        <span className="text-white/50">h </span>
        <span className="text-white">{Math.floor(mins)}</span>
        <span className="text-white/50">min </span>
        <span className="text-white">{secs}</span>
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
          {/* <span className="text-white text-lg flex items-center justify-center gap-2">
            💎 ${ticker} Prize Pool 💎
          </span> */}
          <div className="font-bold text-2xl text-white">
            ${prizePool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
