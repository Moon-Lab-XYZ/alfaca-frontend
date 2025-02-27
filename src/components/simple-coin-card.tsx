
import { useState } from "react";

interface SimpleCoinCardProps {
  name: string;
  ticker: string;
  image: string;
  timestamp: string;
  volume24h: number;
}

export const SimpleCoinCard = ({ 
  ticker, 
  timestamp, 
  volume24h, 
  image,
}: SimpleCoinCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(1)}`;
  };

  return (
    <div className="bg-[#1a1a1a] backdrop-blur-md rounded-2xl p-3 shadow-sm border border-white/5 transition-all duration-300 hover:shadow-md animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
          <img
            src={image}
            alt={ticker}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white/90">${ticker}</span>
              <span className="text-sm text-white/50">{timestamp}</span>
            </div>
            <p className="text-xs text-white/50">MC: {formatVolume(volume24h)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
