
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { formatVolume } from "@/utils/coin-card-utils";

interface CoinInfo {
  name: string;
  ticker: string;
  image: string;
  gradient: string;
}

interface CreatorInfo {
  username: string;
  image: string;
  volume24h: number;
  gradient: string;
  followers?: number;
}

interface CoinCreatorCardProps {
  coin: CoinInfo;
  creator: CreatorInfo;
}

export const CoinCreatorCard = ({ coin, creator }: CoinCreatorCardProps) => {
  const navigate = useNavigate();

  const viewCreatorProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/user/${creator.username}`);
  };

  return (
    <Card className="bg-[#1A1A1A] border-none rounded-2xl mb-4">
      <div className="p-4">
        <div className="flex gap-3">
          {/* Coin icon */}
          <div 
            className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0"
            style={{ background: coin.gradient }}
          >
            {coin.image.includes('placeholder') ? (
              <div className="w-full h-full flex items-center justify-center text-black/50 text-2xl font-medium">
                {coin.ticker[0]}
              </div>
            ) : (
              <img
                src={coin.image}
                alt={coin.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Right side content */}
          <div className="flex flex-col justify-center">
            {/* Coin name */}
            <h1 className="text-3xl font-bold text-white leading-tight text-left">{coin.name}</h1>
            
            {/* Ticker and creator info */}
            <div className="flex items-center mt-0 text-sm">
              <span className="text-white/50">$</span>
              <span className="text-white/50 mr-0.5">{coin.ticker}</span>
              <span className="text-white/40 mx-0.5">by</span>
              
              <div className="flex items-center cursor-pointer" onClick={viewCreatorProfile}>
                <span className="text-white">@{creator.username}</span>
                {creator.followers && (
                  <span className="text-white/50 ml-0.5 text-xs">({creator.followers} followers)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
