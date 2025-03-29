"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from "react";
import { CoinWebsiteHeader } from "@/components/coin-website/header";
import { useToast } from "@/hooks/use-toast";
import { PrizePoolCard } from "@/components/coin-website/prize-pool-card";
import { UserProfilesSection } from "@/components/coin-website/user-profiles-section";
import { ShareModal } from "@/components/coin-website/share-modal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal
} from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, X } from "lucide-react";

const CoinWebsite = () => {
  const { ticker } = useParams();
  const [timeLeft, setTimeLeft] = useState(1440); // 24 hours in minutes
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [shuffleUsed, setShuffleUsed] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  const [coinDetails] = useState({
    name: "Zerebro",
    ticker: ticker || "ZEREBRO",
    image: "https://via.placeholder.com/150",
    creator: {
      username: "coinmaster",
      image: "https://via.placeholder.com/150",
      volume24h: 235000,
      followers: 11000
    }
  });

  const userList = [
    {
      username: "cryptochad",
      gradient: "linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)",
      tokenHolding: 25478,
      farcasterStats: {
        followers: 8574,
        following: 412,
        posts: 1327
      }
    },
    {
      username: "airdropking",
      gradient: "linear-gradient(90deg, hsla(39, 100%, 77%, 1) 0%, hsla(22, 90%, 57%, 1) 100%)",
      tokenHolding: 42310,
      farcasterStats: {
        followers: 12689,
        following: 843,
        posts: 3251
      }
    },
    {
      username: "tokenmaster",
      gradient: "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)",
      tokenHolding: 18956,
      farcasterStats: {
        followers: 5432,
        following: 231,
        posts: 987
      }
    },
    {
      username: "moonshot",
      gradient: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
      tokenHolding: 35742,
      farcasterStats: {
        followers: 9876,
        following: 567,
        posts: 2134
      }
    },
    {
      username: "satoshibae",
      gradient: "linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)",
      tokenHolding: 29864,
      farcasterStats: {
        followers: 7421,
        following: 321,
        posts: 1564
      }
    },
    {
      username: "hodlqueen",
      gradient: "linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)",
      tokenHolding: 15932,
      farcasterStats: {
        followers: 6345,
        following: 289,
        posts: 1092
      }
    },
  ];

  const [selectedUsers, setSelectedUsers] = useState<typeof userList>([]);

  useEffect(() => {
    // Initial selection of users - this shouldn't mark shuffle as used
    const shuffled = [...userList].sort(() => 0.5 - Math.random());
    setSelectedUsers(shuffled.slice(0, 3));

    // Set page loaded after a short delay for animations
    setTimeout(() => setPageLoaded(true), 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 1440; // Reset to 24 hours when reaching 0
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!cooldownActive) return;

    const cooldownTimer = setInterval(() => {
      setCooldownTimeLeft((prev) => {
        if (prev <= 1) {
          setCooldownActive(false);
          return 30 * 60; // Reset to 30 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [cooldownActive]);

  const shuffleUsers = () => {
    // Don't check shuffleUsed in the initial load - it should be clickable the first time
    const shuffled = [...userList].sort(() => 0.5 - Math.random());
    setSelectedUsers(shuffled.slice(0, 3));

    // Only set shuffleUsed to true and show toast if not the initial load
    if (!shuffleUsed) {
      setShuffleUsed(true);

      toast({
        description: "Users shuffled successfully! ✨",
        duration: 2000,
      });
    } else {
      toast({
        description: "You can only shuffle once 🔒",
        duration: 2000,
      });
    }
  };

  const handleSteal = () => {
    if (cooldownActive) return;

    // Show requirement modal instead of immediately proceeding
    setShowRequirementModal(true);
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
    window.open(`https://dexscreener.com/ethereum/${(ticker as any)?.toLowerCase()}`, '_blank');
  };

  const proceedWithSteal = () => {
    setShowRequirementModal(false);
    setCooldownActive(true);
    setShowShareModal(true);

    toast({
      description: "Stealing in progress... 🚀",
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <CoinWebsiteHeader ticker={coinDetails.ticker as any} />

      <div className={`max-w-md mx-auto px-4 mt-3 transition-opacity duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <PrizePoolCard
          ticker={coinDetails.ticker as any}
          initialPrizePool={126431.10}
          timeLeft={timeLeft}
        />

        <UserProfilesSection
          selectedUsers={selectedUsers}
          shuffleUsers={shuffleUsers}
          handleSteal={handleSteal}
          cooldownActive={cooldownActive}
          cooldownTimeLeft={cooldownTimeLeft}
          shuffleUsed={shuffleUsed}
          ticker={ticker as any || "MTK"}
        />
      </div>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        ticker={coinDetails.ticker as any}
        selectedUsername={selectedUsers[1]?.username || 'user'}
      />

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
                You must hold at least 100,000 ${ticker} to play
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
