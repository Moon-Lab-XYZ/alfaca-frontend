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
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import useSWR from "swr";
import useUser from "@/lib/user";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const Profile = () => {
  const creatorGradient = pastelGradients[0];

  const [userContext, setUserContext] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: user } = useUser();

  const {
    data: userWithRank,
    mutate: mutateUserWithRank,
  } = useSWR(`userWithRank`, async () => {
    try {
      if (!user) return;
      const { data: userWithRank, error } = await supabase.rpc('get_user_with_rank', {
        user_id: user.user.id,
      })

      if (!userWithRank || userWithRank.length === 0) {
        return null;
      }
      return userWithRank[0];
    } catch (error) {
      console.error('Error fetching user with rank', error);
    }
  });

  const {
    data: tokenData,
    error,
    mutate: mutateUserTokens,
    isLoading,
  } = useSWR(`userTokens`, async () => {
    try {
      if (!user) return;
      const { data: userTokens, error } = await supabase.rpc('get_user_tokens_with_rewards', {
        user_id: user.user.id,
      })
      if (!userTokens) {
        return [];
      }
      console.log(userTokens);
      return userTokens;
    } catch (error) {
      console.error('Error fetching user tokens', error);
    }
  });

  const {
    data: totalEarnings,
    mutate: mutateTotalEarnings,
    isLoading: totalEarningsIsLoading,
  } = useSWR(`totalEarnings`, async () => {
    try {
      if (!user) return 0;
      const { data: totalEarnings, error } = await supabase.rpc('get_user_rewards', {
        user_id: user.user.id,
      })
      if (!totalEarnings || totalEarnings.length === 0) {
        return 0;
      }
      return totalEarnings[0].total_rewards_usdc;
    } catch (error) {
      console.error('Error fetching user tokens', error);
    }
  });


  useEffect(() => {
    const interval = setInterval(() => {
      mutateUserTokens();
      mutateTotalEarnings();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (user) {
      mutateUserTokens();
      mutateTotalEarnings();
      mutateUserWithRank();
    }
  }, [user]);

  useEffect(() => {
  const load = async () => {
    sdk.actions.ready();

    if (status !== "authenticated") {
      await authenticate();
    }
  };

  const authenticate = async () => {
    try {
      const result = await sdk.actions.signIn({
        nonce: await getNonce(),
      });
      const response = await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
      });
    } catch (e) {
      console.log("Failed to authenticate: ", e);
      if (router) router.push("/");
    }
  }
  if (sdk && !isSDKLoaded) {
    setIsSDKLoaded(true);
    load();
  }
  }, [isSDKLoaded]);

  useEffect(() => {
    async function setContext() {
      const user = (await sdk.context).user;
      setUserContext(user);
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
            username={userContext ? userContext.username : "you"}
            image={userContext ? userContext.pfpUrl: "https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//placeholder.png"}
            volume24h={user?.user ? user.user.total_txn_vol_last_24h : 0}
            gradient={creatorGradient}
            rank={userWithRank ? userWithRank.rank : 'N/A'}
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
              {
                totalEarningsIsLoading ?
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-4 border-[#E5DEFF] border-t-transparent rounded-full animate-spin my-2"></div>
                  </div>
                 :
                <div className="font-bold text-3xl text-[#E5DEFF]">
                  ~${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </div>
              }
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 border-[#E5DEFF] border-t-transparent rounded-full animate-spin mb-2"></div>
            </div>
          ) : tokenData && tokenData.length > 0 ? (
            tokenData.map((token: any, index: any) => (
              <ProfileCoinCard
                key={index}
                name={token.name}
                ticker={token.symbol}
                image={token.image}
                volume24h={token.txn_vol_last_24h ? token.txn_vol_last_24h : 0}
                contractAddress={token.contract_address}
                dexScreenerLink={token.link}
                userAddress={user?.user.verified_addresses[0]}
                earnedRewards={token.total_recipient_rewards_usdc ? token.total_recipient_rewards_usdc : 0}
                isOwnProfile={true}
              />
            ))
          ) : (
            <div className="text-center py-6 text-white/70">
              No tokens created
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;