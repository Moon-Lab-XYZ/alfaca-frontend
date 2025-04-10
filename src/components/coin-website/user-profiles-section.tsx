import { CreatorAvatar } from "@/components/creator-avatar";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import sdk from "@farcaster/frame-sdk";
import { mutate } from "swr";

interface UserProfilesSectionProps {
  selectedUsers: any[];
  ticker: string;
  tokenId: string;
}

export const UserProfilesSection = ({
  selectedUsers,
  ticker,
  tokenId,
}: UserProfilesSectionProps) => {

  const handleSteal = async () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      console.error("No selected users to steal from.");
      return;
    }

    const selectedUsernames = selectedUsers.map((user) => user.username).join(", ");
    const urlEncodedUsernames = encodeURIComponent(selectedUsernames);

    const context = await sdk.context;
    const url = `https://warpcast.com/~/compose?text=I%27m%20stealing%20%24${ticker}%20from%20${urlEncodedUsernames}%20on%20%40alfaca!%E2%A0%80&embeds[]=${process.env.NEXT_PUBLIC_URL}/token/${tokenId}/steal`;
    if (context) {
      await sdk.actions.openUrl(url);
    } else {
      window.open(url, "_blank");
    }
    mutate(`stealCandidates-${tokenId}`);
  };

  return (
    <div className="mb-10">
      <Card className="bg-[#111111] border-[#222222] shadow-xl rounded-xl mb-6 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {selectedUsers ? selectedUsers.map((user, index) => (
              <div key={index} className="flex flex-col items-center">
                {
                  user.avatar_url ?
                  <CreatorAvatar
                    username={user.username}
                    image={user.avatar_url ? user.avatar_url : "https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//placeholder.png"}
                    size="lg"
                    type="creator"
                  />
                  : null
                }
                <div className="text-white text-lg font-medium text-center truncate w-full">@{user.username}</div>
                <div className="text-[#E5DEFF] text-base font-semibold">
                  {user.tokenHolding?.toLocaleString()} 🦙 {user.points}
                </div>
              </div>
            )) : null}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <button
            onClick={handleSteal}
            className="relative overflow-hidden w-full bg-[#E5DEFF] hover:bg-[#E5DEFF] disabled:opacity-80 disabled:cursor-not-allowed text-[#111111] rounded-xl px-6 py-3 font-medium transition-all duration-200 font-['Outfit']"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <>
                Steal
                <Sparkles className="h-4 w-4 text-amber-600" />
              </>
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
