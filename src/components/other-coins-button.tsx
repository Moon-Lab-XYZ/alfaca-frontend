
import { ChevronRight } from "lucide-react";
import { CreatorAvatar } from "./creator-avatar";

interface OtherCoinsButtonProps {
  ticker: string;
  image: string;
  coinsCount: number;
  onClick: (e: React.MouseEvent) => void;
}

export const OtherCoinsButton = ({
  ticker,
  image,
  coinsCount,
  onClick
}: OtherCoinsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full mt-3 flex items-center justify-between p-3 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-white/5 group"
    >
      <div className="flex items-center gap-3">
        <CreatorAvatar
          username={ticker}
          image={image}
          size="sm"
        />
        <div className="text-sm text-white/70">
          ${ticker}
          {coinsCount > 0 && (
            ` + ${coinsCount} more ${coinsCount === 1 ? 'coin' : 'coins'}`
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/70 transition-colors" />
    </button>
  );
};
