"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { ProfileCoinCard } from "@/components/profile-coin-card";
import { SettingsDialog } from "@/components/settings-dialog";
import { CreatorInfo } from "@/components/creator-info";
import { pastelGradients } from "@/lib/coin-card-utils";
import sdk, {
  type Context,
} from "@farcaster/frame-sdk";
import { useState, useEffect, useCallback } from "react";
import { signIn, getCsrfToken } from "next-auth/react";

const mockUserCoins = [
  {
    name: "My Token",
    ticker: "MTK",
    image: "https://via.placeholder.com/150",
    timestamp: "1 day ago",
    volume24h: 125000,
    rank: 8,
    creator: {
      username: "you",
      image: "https://via.placeholder.com/150"
    }
  },
  {
    name: "Super Token",
    ticker: "STKN",
    image: "https://via.placeholder.com/150",
    timestamp: "2 days ago",
    volume24h: 95000,
    rank: 10,
    creator: {
      username: "you",
      image: "https://via.placeholder.com/150"
    }
  },
  {
    name: "Mega Token",
    ticker: "MEGA",
    image: "https://via.placeholder.com/150",
    timestamp: "3 days ago",
    volume24h: 82000,
    rank: 12,
    creator: {
      username: "you",
      image: "https://via.placeholder.com/150"
    }
  },
  {
    name: "Ultra Token",
    ticker: "ULTRA",
    image: "https://via.placeholder.com/150",
    timestamp: "4 days ago",
    volume24h: 71000,
    rank: 15,
    creator: {
      username: "you",
      image: "https://via.placeholder.com/150"
    }
  },
  {
    name: "Power Token",
    ticker: "PWR",
    image: "https://via.placeholder.com/150",
    timestamp: "5 days ago",
    volume24h: 65000,
    rank: 18,
    creator: {
      username: "you",
      image: "https://via.placeholder.com/150"
    }
  },
  {
    name: "Hyper Token",
    ticker: "HYPR",
    image: "https://via.placeholder.com/150",
    timestamp: "6 days ago",
    volume24h: 52000,
    rank: 20,
    creator: {
      username: "you",
      image: "https://via.placeholder.com/150"
    }
  }
];

const Profile = () => {
  const totalVolume = mockUserCoins.reduce((sum, coin) => sum + coin.volume24h, 0);
  const creatorGradient = pastelGradients[0];

  // Mock data for earnings
  const totalEarnings = 892450.75;

  const [user, setUser] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);


  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();

      if (status !== "authenticated") {
        const result = await sdk.actions.signIn({
          nonce: await getNonce(),
        });
        const response = await signIn("credentials", {
          message: result.message,
          signature: result.signature,
          redirect: false,
        });
      }
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    async function setContext() {
      const user = (await sdk.context).user;
      setUser(user);
      console.log(user);
    }

    if (sdk) {
      setContext();
    }
  }, [sdk]);

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <CreatorInfo
            username={user ? user.username : "you"}
            image={user ? user.pfpUrl: "https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//placeholder.png"}
            volume24h={totalVolume}
            gradient={creatorGradient}
            rank={8}
            onClick={() => {}}
          />
          <SettingsDialog />
        </div>

        <div className="bg-[#111111] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] mb-6">
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

        <div className="space-y-4 pb-12">
          {mockUserCoins.map((coin, index) => (
            <ProfileCoinCard
              key={index}
              name={coin.name}
              ticker={coin.ticker}
              image={coin.image}
              volume24h={coin.volume24h}
            />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
