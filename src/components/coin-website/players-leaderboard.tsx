import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users } from "lucide-react";
import { CreatorAvatar } from "@/components/creator-avatar";
import { createClient } from "@supabase/supabase-js";
import useSWR from "swr";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

interface PlayersLeaderboardProps {
  ticker: string;
  tokenId: number;
  currentUser?: any;
}

export const PlayersLeaderboard = ({ ticker, tokenId, currentUser }: PlayersLeaderboardProps) => {
  // Fetch leaderboard data
  const { data: leaderboardData, error: leaderboardError, isLoading: leaderboardLoading } = useSWR(
    [`leaderboard-${tokenId}`, tokenId],
    async ([_, tokenId]) => {
      try {
        const { data, error } = await supabase.rpc('get_sg_token_leaderboard', {
          token_id: tokenId
        });

        if (error) {
          console.error('Error fetching leaderboard data:', error);
          return { players: [], roundId: null };
        }

        const players = data.map((record: any) => ({
          position: record.rank,
          username: record.farcaster_username,
          avatar_url: record.avatar_url,
          tokenHolding: record.points,
          userId: record.user_id
        }));

        return {
          players,
          roundId: data.length > 0 ? data[0].round_id : null
        };
      } catch (error) {
        console.error('Error in data fetching:', error);
        return { players: [], roundId: null };
      }
    }
  );

  // Fetch player count
  const { data: playerCountData } = useSWR(
    [`player-count-${tokenId}`, tokenId],
    async ([_, tokenId]) => {
      try {
        const { data, error } = await supabase.rpc('get_sg_player_count', {
          token_id: tokenId
        });

        if (error) {
          console.error('Error fetching player count:', error);
          return { totalPlayers: 0 };
        }

        return {
          totalPlayers: data[0]?.total_players || 0,
          roundId: data[0]?.round_id
        };
      } catch (error) {
        console.error('Error fetching player count:', error);
        return { totalPlayers: 0 };
      }
    }
  );

  // Fetch user rank if user is logged in
  const { data: userRankData } = useSWR(
    currentUser ? [`user-rank-${tokenId}-${currentUser.id}`, tokenId, currentUser.id] : null,
    async ([_, tokenId, userId]) => {
      try {
        const { data, error } = await supabase.rpc('get_sg_user_rank', {
          token_id: tokenId,
          user_id: userId
        });

        if (error) {
          console.error('Error fetching user rank:', error);
          return null;
        }

        return data[0] || null;
      } catch (error) {
        console.error('Error fetching user rank:', error);
        return null;
      }
    }
  );

  // Get the sorted players from fetched data
  const sortedPlayers = leaderboardData?.players || [];
  const roundId = leaderboardData?.roundId;
  const totalPlayers = playerCountData?.totalPlayers || 0;

  // User's rank and points
  const userRank = userRankData?.rank || -1;
  const userPoints = userRankData?.points || 0;

  return (
    <div className="mt-8 bg-[#2e2e2e] shadow-[0_4px_20px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy size={18} className="text-white/70" />${ticker} Leaderboard
        </h2>
        <div className="text-sm text-white/60 flex items-center gap-1">
          <Users size={14} /> {totalPlayers} Players
        </div>
      </div>

      {currentUser && userRank > 0 && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-9 h-9 flex items-center justify-center text-white font-medium rounded-full bg-[#252525] border border-white/10 mr-3">
              #{userRank}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <CreatorAvatar
                username={currentUser.farcaster_username}
                image={currentUser.avatar_url}
                size="sm"
                type="creator"
              />
              <span className="text-white">You</span>
            </div>
            <div className="text-white font-medium ml-auto">
              🦙 {userPoints.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        {leaderboardLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : leaderboardError ? (
          <div className="text-center p-8 text-white/70">
            Error loading leaderboard data
          </div>
        ) : sortedPlayers.length === 0 ? (
          <div className="text-center p-8 text-white/70">
            No players in this round yet
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#252525]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-white/70 font-medium w-16 text-left">Rank</TableHead>
                <TableHead className="text-white/70 font-medium text-left">Player</TableHead>
                <TableHead className="text-white/70 font-medium text-right">🦙 Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player: any) => (
                <TableRow
                  key={player.userId}
                  className={`border-b border-white/5 hover:bg-white/5 ${
                    currentUser && player.userId === currentUser.id ? "bg-white/10" : ""
                  }`}
                >
                  <TableCell className="text-white font-medium w-16 text-left">
                    #{player.position}
                  </TableCell>
                  <TableCell className="text-white text-left">
                    <div className="flex items-center gap-2">
                      <CreatorAvatar
                        username={player.username}
                        image={player.avatar_url}
                        size="sm"
                        type="creator"
                      />
                      <span>@{player.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white font-medium">
                    🦙 {player.tokenHolding.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};