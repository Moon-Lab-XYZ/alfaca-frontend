"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { CoinCard } from "@/components/coin-card";
import { useState, useEffect, useRef, useCallback } from "react";
import sdk, {
  AddFrame,
  FrameNotificationDetails,
  type Context,
} from "@farcaster/frame-sdk";
import { useSession } from "next-auth/react"
import { signIn, getCsrfToken } from "next-auth/react";
import useSWR from "swr";
import { createClient } from "@supabase/supabase-js";
import moment from 'moment-timezone';
import useUser from "@/lib/user";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const DAILY_PRIZE_POOL_BASE_AMOUNT = 100;

const Index = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  // const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const isSDKLoaded = useRef(false);

  const { data: user } = useUser();

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

  const { data: session, status } = useSession();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

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
      }
    }

    if (sdk && !isSDKLoaded.current) {
      isSDKLoaded.current = true;
      load();
    }
  }, [sdk]);

  useEffect(() => {
    const requestAddFrame = async () => {
      const context = await sdk.context;
      if (context && context.client.added === false && user) {
        const result = await sdk.actions.addFrame();
        if (result.notificationDetails && user) {
          await fetch('/api/register-notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: result.notificationDetails.url,
              token: result.notificationDetails.token,
            }),
          });
        }
      }
    }

    if (sdk && user) {
      requestAddFrame();
    }

  }, [sdk, user])

  function getNextRoundEndTime() {
    // Get current time in Pacific Time
    const nowPT = moment().tz('America/Los_Angeles');

    // Create 4PM PT today
    const target4PMPT = moment.tz('America/Los_Angeles')
      .hour(16)
      .minute(0)
      .second(0)
      .millisecond(0);

    // If it's already past 4PM PT, set to 4PM PT tomorrow
    if (nowPT.isAfter(target4PMPT)) {
      target4PMPT.add(1, 'day');
    }

    // Return as a JavaScript Date object in the user's local time zone
    return target4PMPT.toDate();
  }

  useEffect(() => {
    const calculateTimeUntil4PMPT = () => {
      const now = moment();
      const nextRoundEndTime = moment(getNextRoundEndTime());

      // Calculate the difference in milliseconds
      const diff = nextRoundEndTime.diff(now);

      // Convert to hours, minutes, seconds
      const duration = moment.duration(diff);
      const hours = Math.floor(duration.asHours());
      const minutes = Math.floor(duration.minutes());
      const seconds = Math.floor(duration.seconds());

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
                ~${currentRound ? (currentRound.prize_pool_amount_usd + DAILY_PRIZE_POOL_BASE_AMOUNT).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : DAILY_PRIZE_POOL_BASE_AMOUNT}
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