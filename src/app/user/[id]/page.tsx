"use client";

import { useParams, useRouter } from 'next/navigation'

import { BottomNav } from "@/components/ui/bottom-nav";
import { ProfileCoinCard } from "@/components/profile-coin-card";
import { ChevronLeft } from "lucide-react";
import { CreatorInfo } from "@/components/creator-info";
import { pastelGradients } from "@/lib/coin-card-utils";

const mockCoins = [
  {
    name: "My Token",
    ticker: "MTK",
    image: "https://via.placeholder.com/150",
    volume24h: 125000,
  },
  {
    name: "Super Token",
    ticker: "STKN",
    image: "https://via.placeholder.com/150",
    volume24h: 95000,
  },
  {
    name: "Mega Token",
    ticker: "MEGA",
    image: "https://via.placeholder.com/150",
    volume24h: 82000,
  },
  {
    name: "Ultra Token",
    ticker: "ULTRA",
    image: "https://via.placeholder.com/150",
    volume24h: 71000,
  },
  {
    name: "Power Token",
    ticker: "PWR",
    image: "https://via.placeholder.com/150",
    volume24h: 65000,
  },
  {
    name: "Hyper Token",
    ticker: "HYPR",
    image: "https://via.placeholder.com/150",
    volume24h: 52000,
  }
];

const UserProfile = () => {
  const { username } = useParams();
  const usernameString = String(username);
  const router = useRouter();
  // const location = useLocation();
  // const passedCoins = location.state?.coins;

  // const userCoins = passedCoins || mockCoins;

  // const totalVolume = userCoins.reduce((sum: any, coin: any) => sum + coin.volume24h, 0);
  const creatorGradient = pastelGradients[0];

  // Generate unique total earnings based on volume and username
  const generateTotalEarnings = () => {
    const baseEarning = 0 * 0.15; // 15% of volume
    const usernameHash = (usernameString || "").split("").reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0);
    const randomFactor = (usernameHash % 20 + 90) / 100; // Random factor between 0.9 and 1.1
    return baseEarning * randomFactor;
  };

  // Generate consistent random rank based on username
  const generateRank = () => {
    const usernameHash = (usernameString || "").split("").reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0);
    return (usernameHash % 100) + 1; // Random rank between 1 and 100
  };

  const totalEarnings = generateTotalEarnings();
  const creatorRank = generateRank();

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <div className="bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.4)] py-4">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Ranking</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <CreatorInfo
          username={usernameString || "anonymous"}
          image="https://via.placeholder.com/150"
          volume24h={0}
          gradient={creatorGradient}
          rank={creatorRank}
          onClick={() => {}}
        />

        <div className="bg-[#111111] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] mt-6 mb-6">
          <div className="p-4">
            <div className="text-center">
              <span className="text-white/70 text-lg flex items-center justify-center gap-2">
                💰 Total Earnings
              </span>
              <div className="font-bold text-3xl text-[#E5DEFF]">
                ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* {userCoins.map((coin: any, index: any) => (
            <ProfileCoinCard
              key={index}
              name={coin.name}
              ticker={coin.ticker}
              image={coin.image}
              volume24h={coin.volume24h}
            />
          ))} */}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default UserProfile;
