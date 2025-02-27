
import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProfileCoinCardProps {
  name: string;
  ticker: string;
  image: string;
  volume24h: number;
}

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

export const ProfileCoinCard = ({ 
  name, 
  ticker, 
  image, 
  volume24h,
}: ProfileCoinCardProps) => {
  const { toast } = useToast();
  
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
    const address = "0x4455...cAD7";
    navigator.clipboard.writeText(address);
    toast({
      description: "Contract address copied to clipboard",
      duration: 2000,
    });
  };

  const handleDexScreener = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://dexscreener.com/ethereum/${ticker.toLowerCase()}`, '_blank');
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
              <p className="text-sm text-white/50">24h Volume</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopyAddress}
              className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              <Copy size={14} /> 0x4455...cAD7
            </button>
            <button
              onClick={handleDexScreener}
              className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 px-3 text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            >
              <ExternalLink size={14} /> DEX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
