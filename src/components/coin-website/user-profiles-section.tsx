import { CreatorAvatar } from "@/components/creator-avatar";
import { Shuffle, Sparkles, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  username: string;
  gradient: string;
  tokenHolding?: number;
  farcasterStats?: {
    followers: number;
    following: number;
    posts: number;
  };
}

interface UserProfilesSectionProps {
  selectedUsers: User[];
  shuffleUsers: () => void;
  handleSteal: () => void;
  cooldownActive: boolean;
  cooldownTimeLeft: number;
  shuffleUsed: boolean;
  ticker: string;
}

export const UserProfilesSection = ({
  selectedUsers,
  shuffleUsers,
  handleSteal,
  cooldownActive,
  cooldownTimeLeft,
  shuffleUsed,
  ticker
}: UserProfilesSectionProps) => {
  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const [isShuffling, setIsShuffling] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const usersWithStats = selectedUsers.map(user => {
    if (!user.farcasterStats) {
      return {
        ...user,
        farcasterStats: {
          followers: Math.floor(Math.random() * 10000) + 1000,
          following: Math.floor(Math.random() * 1000) + 100,
          posts: Math.floor(Math.random() * 5000) + 200
        }
      };
    }
    return user;
  });

  const handleShuffleClick = () => {
    if (!shuffleUsed) {
      setIsShuffling(true);

      setAnimationKey(prev => prev + 1);

      setTimeout(() => {
        shuffleUsers();
        setIsShuffling(false);
      }, 600);
    }
  };

  const handleUserClick = (index: number) => {
    setSelectedIndex(index === selectedIndex ? null : index);
    setShowSparkles(true);
    setInteractionCount(prev => prev + 1);
    setTimeout(() => setShowSparkles(false), 1000);
  };

  useEffect(() => {
    setSelectedIndex(null);
  }, [selectedUsers]);

  return (
    <div className="mb-10">
      <Card className="bg-[#111111] border-[#222222] shadow-xl rounded-xl mb-6 overflow-hidden relative" key={animationKey}>
        {showSparkles && (
          <div className="absolute z-10 inset-0 pointer-events-none flex items-center justify-center">
            <Sparkles className="text-yellow-400 animate-pulse w-12 h-12 opacity-70" />
          </div>
        )}

        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {usersWithStats.map((user, index) => (
              <div key={index} className="flex flex-col items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className="transition-all duration-300 cursor-pointer"
                      onClick={() => handleUserClick(index)}
                    >
                      <div className="relative">
                        <div>
                          <CreatorAvatar
                            username={user.username}
                            image="https://via.placeholder.com/150"
                            gradient={user.gradient}
                            size="md"
                            type="creator"
                            className="w-20 h-20"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center mt-2 space-y-1">
                        <p className="text-white text-lg font-medium">@{user.username}</p>
                        <p className="text-[#E5DEFF] text-base font-semibold">
                          {user.tokenHolding?.toLocaleString()} €{ticker}
                        </p>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-black border border-[#E5DEFF]/20 text-white p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#E5DEFF]">@{user.username}</h3>
                        <CreatorAvatar
                          username={user.username}
                          image="https://via.placeholder.com/150"
                          gradient={user.gradient}
                          size="sm"
                          type="creator"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[#E5DEFF]/80">
                        <Users size={14} />
                        <span className="text-sm">{user.farcasterStats?.followers.toLocaleString()} followers</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="flex flex-col items-center p-2 bg-[#111111] rounded-md">
                          <span className="text-sm text-[#E5DEFF]/60">Following</span>
                          <span className="font-bold">{user.farcasterStats?.following.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-[#111111] rounded-md">
                          <span className="text-sm text-[#E5DEFF]/60">Posts</span>
                          <span className="font-bold">{user.farcasterStats?.posts.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-[#111111] rounded-md">
                          <span className="text-sm text-[#E5DEFF]/60">Holding</span>
                          <span className="font-bold">{user.tokenHolding?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <button
            onClick={handleSteal}
            disabled={cooldownActive}
            className="relative overflow-hidden w-full bg-[#E5DEFF] hover:bg-[#E5DEFF] disabled:opacity-80 disabled:cursor-not-allowed text-[#111111] rounded-xl px-6 py-3 font-medium transition-all duration-200 font-['Outfit']"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {cooldownActive ? formatCooldownTime(cooldownTimeLeft) : (
                <>
                  Steal
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </>
              )}
            </span>
          </button>
        </CardFooter>
      </Card>

      {/* <button
        onClick={handleShuffleClick}
        disabled={shuffleUsed || isShuffling}
        className={`flex items-center justify-center gap-2 w-full mt-4 bg-transparent
          text-white/50 hover:text-white/80 disabled:opacity-30 disabled:hover:text-white/50
          rounded-xl px-6 py-2 font-medium transition-all duration-200 font-['Outfit']
          ${isShuffling ? 'animate-pulse' : ''}`}
      >
        Shuffle <Shuffle className={isShuffling ? 'animate-spin' : ''} size={16} />
      </button> */}
    </div>
  );
};
