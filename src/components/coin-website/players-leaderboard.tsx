
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users } from "lucide-react";
import { CreatorAvatar } from "@/components/creator-avatar";
import { Separator } from "@/components/ui/separator";

interface PlayersLeaderboardProps {
  ticker: string;
  currentUser?: any;
}

export const PlayersLeaderboard = ({ ticker, currentUser }: PlayersLeaderboardProps) => {
  // Sample player data - in a real app this would come from an API
  const [players] = useState<any[]>([
    {
      username: "warpcastadmin",
      gradient: "linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)",
      tokenHolding: 125,
    },
    {
      username: "jacek",
      gradient: "linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)",
      tokenHolding: 762,
    },
    {
      username: "jessepollak",
      gradient: "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)",
      tokenHolding: 1485,
    },
    {
      username: "cryptochad",
      gradient: "linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)",
      tokenHolding: 98,
    },
    {
      username: "moonshot",
      gradient: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
      tokenHolding: 276,
    },
    {
      username: "coinmaster",
      gradient: "linear-gradient(90deg, hsla(39, 100%, 77%, 1) 0%, hsla(22, 90%, 57%, 1) 100%)",
      tokenHolding: 542,
    },
  ]);

  // Sort players by token holdings in descending order
  const sortedPlayers = [...players]
    .sort((a, b) => b.tokenHolding - a.tokenHolding)
    .map((player, index) => ({
      ...player,
      position: index + 1,
    }));

  // Find user's position if they are not in the list
  let userRank = -1;
  if (currentUser) {
    userRank = sortedPlayers.findIndex(player => player.tokenHolding <= (currentUser?.tokenHolding || 0)) + 1;
    if (userRank === 0) userRank = sortedPlayers.length + 1;
  }

  return (
    <div className="mt-8 bg-[#2e2e2e] shadow-[0_4px_20px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy size={18} className="text-white/70" /> Player Leaderboard
        </h2>
        <div className="text-sm text-white/60 flex items-center gap-1">
          <Users size={14} /> {players.length} Players
        </div>
      </div>

      {currentUser && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-9 h-9 flex items-center justify-center text-white font-medium rounded-full bg-[#252525] border border-white/10 mr-3">
              #{userRank}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <CreatorAvatar
                username={currentUser.username}
                image={currentUser.avatar_url}
                size="sm"
                type="creator"
              />
              <span className="text-white">You</span>
            </div>
            <div className="text-white font-medium ml-auto">
              🦙
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        <Table>
          <TableHeader className="bg-[#252525]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-white/70 font-medium w-16 text-left">Rank</TableHead>
              <TableHead className="text-white/70 font-medium text-left">Player</TableHead>
              <TableHead className="text-white/70 font-medium text-right">🦙 Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map((player) => (
              <TableRow
                key={player.username}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <TableCell className="text-white font-medium w-16 text-left">
                  #{player.position}
                </TableCell>
                <TableCell className="text-white text-left">
                  <div className="flex items-center gap-2">
                    <CreatorAvatar
                      username={player.username}
                      image=""
                      size="sm"
                      type="creator"
                    />
                    <span>@{player.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-white font-medium">
                  🦙{player.tokenHolding.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
