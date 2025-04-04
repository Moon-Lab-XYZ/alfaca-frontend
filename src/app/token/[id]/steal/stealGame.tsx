"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from "react";
import { CoinWebsiteHeader } from "@/components/coin-website/header";
import { useToast } from "@/hooks/use-toast";
import { PrizePoolCard } from "@/components/coin-website/prize-pool-card";
import { UserProfilesSection } from "@/components/coin-website/user-profiles-section";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal
} from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, X } from "lucide-react";
import useSWR from "swr";
import { createClient } from "@supabase/supabase-js";
import { PlayersLeaderboard } from "@/components/coin-website/players-leaderboard";
import sdk from "@farcaster/frame-sdk";
import useUser from "@/lib/user";
import moment from 'moment-timezone';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const CoinWebsite = () => {
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { toast } = useToast();
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [shuffleUsed, setShuffleUsed] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  const { data: user } = useUser();

  const {
    data: tokenData,
    error: tokenDataError,
    mutate: mutateTokenData,
    isLoading: tokenDataLoading,
  } = useSWR(`tokenData-${id}`, async () => {
    try {
      const { data: tokenData, error } = await supabase.from('tokens')
        .select('*,users(*)')
        .eq('id', id)
        .limit(1)
        .single();
      if (error) console.error(error);
      console.log(tokenData);
      return tokenData;
    } catch (error) {
      console.error('Error fetching token data', error);
    }
  });


  const {
    data: stealCandidates,
    error: stealCandidatesError,
    mutate: mutateStealCandidates,
    isLoading: stealCandidatesLoading,
    isValidating: stealCandidatesValidating,
  } = useSWR(`stealCandidates-${id}`, async () => {
    console.log('stealCandidates');
    try {
      const data =
        await fetch(`/api/steal-candidates?tokenId=${id}`, {
          method: 'GET',
        });
      const stealCandidates = await data.json();
      console.log(stealCandidates)
      return stealCandidates;
    } catch (error) {
      console.error('Error fetching token data', error);
      return null;
    }
  }, {
    revalidateOnFocus: false,
  });

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

  // const shuffleUsers = () => {
  //   // Don't check shuffleUsed in the initial load - it should be clickable the first time
  //   const shuffled = [...userList].sort(() => 0.5 - Math.random());
  //   setSelectedUsers(shuffled.slice(0, 3));

  //   // Only set shuffleUsed to true and show toast if not the initial load
  //   if (!shuffleUsed) {
  //     setShuffleUsed(true);

  //     toast({
  //       description: "Users shuffled successfully! ✨",
  //       duration: 2000,
  //     });
  //   } else {
  //     toast({
  //       description: "You can only shuffle once 🔒",
  //       duration: 2000,
  //     });
  //   }
  // };

  const handleSteal = async () => {
    if (cooldownActive) return;
    const context = await sdk.context;
    const url = `https://warpcast.com/~/compose?text=Hello%20world!&embeds[]=https://farcaster.xyz`;
    if (context) {
      await sdk.actions.openUrl(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleCloseModal = () => {
    setShowRequirementModal(false);
  };

  const handleCopyAddress = () => {
    const address = "0x4455...cAD7";
    navigator.clipboard.writeText(address);
    toast({
      description: "Contract address copied to clipboard",
      duration: 2000,
    });
  };

  const handleDexScreener = () => {
    window.open(`https://dexscreener.com/ethereum/${(id as any)?.toLowerCase()}`, '_blank');
  };

  if (!tokenData || tokenDataLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <CoinWebsiteHeader ticker={tokenData.symbol as any} />

      <div className={`max-w-md mx-auto px-4 mt-3`}>
        <PrizePoolCard
          ticker={tokenData.symbol as any}
          contractAddress={tokenData.contract_address}
          link={tokenData.link}
          initialPrizePool={126431.10}
          timeLeft={timeLeft}
        />

        {
          stealCandidates && !stealCandidatesLoading && !stealCandidatesValidating ?
          <UserProfilesSection
            selectedUsers={stealCandidates}
            handleSteal={handleSteal}
            cooldownActive={cooldownActive}
            cooldownTimeLeft={cooldownTimeLeft}
            shuffleUsed={shuffleUsed}
            ticker={tokenData.symbol}
          />
          :
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-[#E5DEFF] border-t-transparent rounded-full animate-spin mb-2"></div>
          </div>
        }

        {
          user ?
          <PlayersLeaderboard
            tokenId={id as any}
            currentUser={user.user}
          />
          : null
        }
      </div>

      {/* <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        ticker={coinDetails.ticker as any}
        selectedUsername={selectedUsers[1]?.username || 'user'}
      /> */}

      {/* Token Requirement Dialog */}
      <AlertDialog open={showRequirementModal}>
        <AlertDialogPortal>
          <AlertDialogOverlay
            className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            onClick={handleCloseModal}
          />
          <AlertDialogContent
            className="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-[#1A1A1A] border border-white/10 max-w-[350px] p-0 rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-black/30 text-white/60 hover:text-white/90 transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-4 pb-6">
              <AlertDialogTitle className="text-center text-lg font-bold text-white">
                Coin Required
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-white/80 mt-2">
                You must hold at least 100,000 ${id} to play
              </AlertDialogDescription>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-2 px-4 text-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                >
                  <Copy size={16} /> CA
                </button>
                <button
                  onClick={handleDexScreener}
                  className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-2 px-4 text-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                >
                  <ExternalLink size={16} /> DEX
                </button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  );
};

export default CoinWebsite;
