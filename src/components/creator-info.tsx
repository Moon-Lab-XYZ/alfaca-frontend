
import { CreatorAvatar } from "./creator-avatar";
import { formatVolume } from "@/lib/coin-card-utils";

interface CreatorInfoProps {
  username: string;
  image: string;
  volume24h: number;
  volumeCurrentRound: number;
  rank?: number;
  onClick: (e: React.MouseEvent) => void;
}

export const CreatorInfo = ({
  username,
  image,
  volume24h,
  volumeCurrentRound,
  rank,
  onClick
}: CreatorInfoProps) => {
  return (
    <div
      className="flex flex-1 items-center gap-3"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {rank && (
          <span className="text-xl font-bold text-white/90">#{rank}</span>
        )}
        {
          image ?
            <CreatorAvatar
              username={username}
              image={image}
              type="creator"
            /> : null
        }
      </div>
      <div className="flex flex-col">
        <span className="text-base text-white/90">
          @{username}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-[#00FF03]">{formatVolume(volumeCurrentRound)}</span>
          <span className="text-sm text-white/50">Daily Volume</span>
        </div>
      </div>
    </div>
  );
};
