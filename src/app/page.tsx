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

const coinNames = [
  "Zerebro", "AiXBT", "Quantum Pepe", "NeuroPad", "Sigma Inu",
  "Binary Doge", "AlphaCore", "NexusBrain", "CyberShiba", "MetaLlama",
  "AstroApe", "CosmoSmart", "NeuralX", "OmegaBot", "SynthPad",
  "QuantumLeap", "BrainDAO", "CryptoNova", "AiMatrix", "NeuroBit",
  "TeraCore", "VortexAI", "SynapseX", "ByteLabs"
];

const generateMockCoins = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    name: coinNames[i],
    ticker: coinNames[i].replace(/\s+/g, '').toUpperCase(),
    image: "https://via.placeholder.com/150",
    timestamp: "3 coins created",
    volume24h: Math.floor(Math.random() * 2000000) + 500000,
    rank: i + 1,
    creator: {
      username: `creator${i + 1}`,
      image: "https://via.placeholder.com/150",
      otherCoins: [
        {
          name: `${coinNames[i]}X`,
          ticker: `${coinNames[i].replace(/\s+/g, '')}X`,
          image: "https://via.placeholder.com/150",
          volume24h: 850000
        },
        {
          name: `${coinNames[i]}Pro`,
          ticker: `${coinNames[i].replace(/\s+/g, '')}PRO`,
          image: "https://via.placeholder.com/150",
          volume24h: 420000
        },
        {
          name: `${coinNames[i]}AI`,
          ticker: `${coinNames[i].replace(/\s+/g, '')}AI`,
          image: "https://via.placeholder.com/150",
          volume24h: 230000
        }
      ]
    }
  }));
};

const mockCoins = generateMockCoins(24);

const Index = () => {
  const [prizePool, setPrizePool] = useState(126389.37);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    const prizeInterval = setInterval(() => {
      setPrizePool(current => {
        const increase = Math.random() * 0.5 + 0.1;
        return Number((current + increase).toFixed(2));
      });
    }, 1000);

    return () => clearInterval(prizeInterval);
  }, []);

  useEffect(() => {
    const calculateTimeUntil4PMPT = () => {
      const now = new Date();

      // Get current date in PT (Pacific Time)
      // Note: This correctly accounts for DST by using standard IANA timezone names
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

      // Calculate the difference in milliseconds
      const diff = targetInLocalTime.getTime() - now.getTime();

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
                ${prizePool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-md text-white/50 mt-1 flex items-center justify-center gap-0.5">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-3 pb-12">
        {mockCoins.map((coin, index) => (
          <CoinCard key={index} {...coin} />
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;