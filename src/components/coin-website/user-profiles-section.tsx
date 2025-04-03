import { CreatorAvatar } from "@/components/creator-avatar";
import { Shuffle, Sparkles, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserProfilesSectionProps {
  selectedUsers: any[];
  handleSteal: () => void;
  cooldownActive: boolean;
  cooldownTimeLeft: number;
  shuffleUsed: boolean;
  ticker: string;
}

export const UserProfilesSection = ({
  selectedUsers,
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
  const [interactionCount, setInteractionCount] = useState(0);

  const handleUserClick = (index: number) => {
    setSelectedIndex(index === selectedIndex ? null : index);
    setInteractionCount(prev => prev + 1);
  };

  useEffect(() => {
    setSelectedIndex(null);
  }, [selectedUsers]);

  return (
    <div className="mb-10">
      <Card className="bg-[#111111] border-[#222222] shadow-xl rounded-xl mb-6 overflow-hidden relative" key={animationKey}>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {selectedUsers.map((user, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="transition-all duration-300"
                >
                  <div className="flex flex-col items-center mt-2 space-y-1">
                    <CreatorAvatar
                      username={user.username}
                      image={user.avatar_url}
                      size="lg"
                      type="creator"
                    />
                    <p className="text-white text-lg font-medium">@{user.username}</p>
                    <p className="text-[#E5DEFF] text-base font-semibold">
                      {user.tokenHolding?.toLocaleString()} 🦙 {ticker}
                    </p>
                  </div>
                </div>
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
