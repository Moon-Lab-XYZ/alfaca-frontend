"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { CoinCard } from "@/components/coin-card";
import { useState, useEffect, useCallback } from "react";
import sdk, {
  AddFrame,
  FrameNotificationDetails,
  type Context,
} from "@farcaster/frame-sdk";
import { useSession } from "next-auth/react"
import { signIn, getCsrfToken } from "next-auth/react";
import useSWR from "swr";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const Index = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const {
    data: currentRound,
    error,
    mutate: mutateCurrentRound,
    isLoading,
  } = useSWR(`currentRound`, async () => {
    try {
      const nextRoundEndTime = (getNextRoundEndTime()).toISOString();
      const { data: currentRound } = await supabase.from('rounds')
        .select('*')
        .eq('round_end_time', nextRoundEndTime)
        .limit(1)
        .single();
      return currentRound;
    } catch (error) {
      // console.log('Error fetching user tokens', error);
    }
  });

  // update currentRound every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      mutateCurrentRound();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const {
    data: leaderboard,
    error: leaderboardError,
    mutate: mutateLeaderboard,
    isLoading: leaderboardLoading,
  } = useSWR(`leaderboard`, async () => {
    try {
      const { data: leaderboard, error } = await supabase.rpc('get_top_users_and_tokens');
      if (error) console.error(error);
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard', error);
    }
  });

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  function getNextRoundEndTime() {
    const now = new Date();
    const options = { timeZone: 'America/Los_Angeles' };
    const pacificTimeNow = new Date(now.toLocaleString('en-US', options));

    // Create a date object for 4PM Pacific Time today
    const targetDate = new Date(pacificTimeNow);
    targetDate.setHours(16, 0, 0, 0); // Set to 4PM PT

    // If current Pacific Time is past 4PM PT, set target to next day
    if (pacificTimeNow > targetDate) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Convert the PT target time back to the local time of the device
    const targetInLocalTime = new Date(targetDate.toLocaleString('en-US'));

    return targetInLocalTime
  }

  useEffect(() => {
    const calculateTimeUntil4PMPT = () => {
      const now = new Date();
      const nextRoundEndTime = getNextRoundEndTime();

      // Calculate the difference in milliseconds
      const diff = nextRoundEndTime.getTime() - now.getTime();

      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    // Update time initially
    setTimeLeft(calculateTimeUntil4PMPT());

    // Set up interval to update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeUntil4PMPT());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeObj: any) => {
    return (
      <>
        <span className="text-white">{timeObj.hours}</span>
        <span className="text-white/50">h </span>
        <span className="text-white">{timeObj.minutes}</span>
        <span className="text-white/50">min </span>
        <span className="text-white">{timeObj.seconds}</span>
        <span className="text-white/50">sec remaining</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <div className="bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-md mx-auto px-4">
          <div className="py-4 text-center">
            <div>
              <span className="text-white/70 text-lg flex items-center justify-center gap-2">
                🏆<span className="text-white">🦙</span>DAILY PRIZE POOL <span className="text-white">🦙</span>🏆
              </span>
              <div className="font-bold text-3xl text-white">
                ${currentRound ? currentRound.prize_pool_amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}
              </div>
              <div className="text-md text-white/50 mt-1 flex items-center justify-center gap-0.5">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-3 pb-12">
        {leaderboard ? leaderboard.map((coin: any, index: any) => (
          <CoinCard key={index} {...coin} />
        )) : null}
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;