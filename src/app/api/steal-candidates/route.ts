import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/auth';
import moment from 'moment-timezone';

const IMG_BASE_URL="https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=336";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

interface StealCandidate {
  id: string;
  username: string;
  avatar_url: string;
  farcaster_id: number;
  points?: number;
  source: "warpcast" | "top_points" | "recent_theft" | "followee" | "random";
}

// Main API route handler
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('tokenId');
    const userId = session.user.uid;

    const { data: userData } = await supabase
      .from('users')
      .select('farcaster_id')
      .eq('id', userId)
      .single();

    if (!tokenId) {
      return NextResponse.json({ error: "Missing tokenId parameter" }, { status: 400 });
    }

    console.log("Fetching steal candidates for token:", tokenId);

    // Get or create the current/next round for the token
    const currentRound = await getOrCreateRound(tokenId);

    if (!currentRound) {
      return NextResponse.json({
        error: "Failed to get or create a round for this token"
      }, { status: 500 });
    }

    const candidates: StealCandidate[] = [];

    // 1. Get a candidate from Warpcast top creators
    try {
      const response = await fetch(
        'https://api.warpcast.com/v1/creator-rewards-winner-history',
        {
          headers: {
            accept: 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Warpcast API error: ${response.status}`);
      }

      const data = await response.json();

      console.log(data);

      if (data?.result?.history?.winners && data.result.history.winners.length > 0) {
        const winners = data.result.history.winners;
        // Select a random winner from the list
        const randomWinner = winners[Math.floor(Math.random() * winners.length)];
        const fid = randomWinner?.fid;

        // Find or create the user in our database
        const winnerId = await findOrCreateUser(
          fid
        );

        if (winnerId) {
          // Get user details from our database
          const { data: winnerData } = await supabase
            .from('users')
            .select('id, farcaster_username, avatar_url, farcaster_id')
            .eq('id', winnerId)
            .single();

          if (winnerData) {
            candidates.push({
              id: winnerData.id.toString(),
              username: winnerData.farcaster_username,
              avatar_url: winnerData.avatar_url,
              farcaster_id: winnerData.farcaster_id,
              source: "warpcast"
            });

            // logging
            console.log("Adding farcaster top creator candidate: ", winnerData.farcaster_username);

            // Ensure the candidate has a player_points entry for this round
            await ensurePlayerPointsEntry(currentRound.id, winnerData.id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Warpcast top creators:", error);
      // Continue with the other candidates
    }

    // 2. Get a candidate from top 10 point holders for current round
    try {
      const { data: topPointsUsers } = await supabase
        .from('sg_player_points')
        .select(`
          points,
          users:user_id (
            id,
            farcaster_username,
            avatar_url,
            farcaster_id
          )
        `)
        .eq('round_id', currentRound.id)
        .order('points', { ascending: false })
        .limit(10);

      if (topPointsUsers && topPointsUsers.length > 0) {
        // Safely process the response data
        for (const pointsData of topPointsUsers) {
          // Skip if user is the current user or if data is invalid
          const userData = pointsData.users;

          // Handle both array and object responses
          const userObj = Array.isArray(userData) ? userData[0] : userData;

          if (userObj && userObj.id && userObj.id.toString() !== userId.toString()) {
            candidates.push({
              id: userObj.id.toString(),
              username: userObj.farcaster_username || "Unknown",
              avatar_url: userObj.avatar_url || "",
              farcaster_id: userObj.farcaster_id || 0,
              points: pointsData.points,
              source: "top_points"
            });

            await ensurePlayerPointsEntry(currentRound.id, userObj.id);

            // logging
            console.log("Adding top point holder candidate: ", userObj.farcaster_username);

            // We only need one candidate from this source
            break;
          }
        }
      } else {
        if (userData && userData.farcaster_id) {
          const followeeCandidate = await getRandomFolloweeCandidate(userData.farcaster_id);
          if (followeeCandidate) {
            candidates.push(followeeCandidate);

            // Ensure the candidate has a player_points entry for this round
            await ensurePlayerPointsEntry(currentRound.id, followeeCandidate.id);
          }

          // logging
          console.log("No top point holder candidate, adding followee candidate: ", followeeCandidate?.username);
        }
      }
    } catch (error) {
      console.error("Error fetching top point holders:", error);
      // Continue with the other candidates
    }

    // 3. Get a candidate who recently stole from the user or from followees
    try {
      // Check if anyone has stolen from the user in the past 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: recentThefts } = await supabase
        .from('sg_player_actions')
        .select(`
          attacker_id,
          users:attacker_id (
            id,
            farcaster_username,
            avatar_url,
            farcaster_id
          )
        `)
        .eq('target_id', userId.toString())
        .eq('round_id', currentRound.id)
        .eq('successful', true)
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });

      if (recentThefts && recentThefts.length > 0) {
        // Process one theft record
        for (const theft of recentThefts) {
          const userData = theft.users;

          // Handle both array and object responses
          const userObj = Array.isArray(userData) ? userData[0] : userData;

          if (userObj && userObj.id) {
            candidates.push({
              id: userObj.id.toString(),
              username: userObj.farcaster_username || "Unknown",
              avatar_url: userObj.avatar_url || "",
              farcaster_id: userObj.farcaster_id || 0,
              source: "recent_theft"
            });

            // logging
            console.log("Adding recent theft candidate: ", userObj.farcaster_username);

            // Ensure the candidate has a player_points entry for this round
            await ensurePlayerPointsEntry(currentRound.id, userObj.id);

            // We only need one candidate from this source
            break;
          }
        }
      } else {
        if (userData && userData.farcaster_id) {
          const followeeCandidate = await getRandomFolloweeCandidate(userData.farcaster_id);
          if (followeeCandidate) {
            candidates.push(followeeCandidate);

            // Ensure the candidate has a player_points entry for this round
            await ensurePlayerPointsEntry(currentRound.id, followeeCandidate.id);
          }

          // logging
          console.log("No recent theft candidate, adding followee candidate: ", followeeCandidate?.username);
        }
      }
    } catch (error) {
      console.error("Error fetching recent thieves or followees:", error);
      // Continue with the candidates we have so far
    }

    // Make sure we have at least some candidates
    if (candidates.length === 0) {
      // Fallback: get random users from the database as candidates
      const { data: randomUsers } = await supabase
        .from('users')
        .select('id, farcaster_username, avatar_url, farcaster_id')
        .neq('id', userId.toString())
        .limit(3);

      if (randomUsers && randomUsers.length > 0) {
        // Get the first user as fallback
        const user = randomUsers[0];

        if (user && user.id) {
          candidates.push({
            id: user.id.toString(),
            username: user.farcaster_username || "Unknown",
            avatar_url: user.avatar_url || "",
            farcaster_id: user.farcaster_id || 0,
            source: "random"
          });

          // Ensure the candidate has a player_points entry for this round
          await ensurePlayerPointsEntry(currentRound.id, user.id);
        }
      }
    }

    // Ensure the requesting user also has a player_points entry
    await ensurePlayerPointsEntry(currentRound.id, userId);

    return NextResponse.json(candidates);

  } catch (error) {
    console.error("Error fetching steal candidates:", error);
    return NextResponse.json({ error: "Failed to fetch steal candidates" }, { status: 500 });
  }
}

// Helper function to get the next round end time (4PM Pacific Time)
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

  return target4PMPT;
}

// Helper function to get or create a round for a token
async function getOrCreateRound(tokenId: string) {
  try {
    // Get the next round end time (4PM Pacific Time)
    const nextRoundEndTime = getNextRoundEndTime();
    const utcNextRoundEndTime = nextRoundEndTime.clone().utc().format();

    console.log("Looking for round ending at:", utcNextRoundEndTime);

    // Check if a round already exists for this token and end time
    const { data: existingRound, error: findRoundError } = await supabase
      .from('sg_rounds')
      .select('*')
      .eq('token', tokenId)
      .eq('round_end_time', utcNextRoundEndTime)
      .eq('status', 'ACTIVE')
      .single();

    if (!findRoundError && existingRound) {
      console.log("Found existing round:", existingRound.id);
      return existingRound;
    }

    // Create a new round with the next 4PM PT end time
    const { data: newRound, error: createRoundError } = await supabase
      .from('sg_rounds')
      .insert([
        {
          token: tokenId,
          round_end_time: utcNextRoundEndTime,
          status: 'ACTIVE',
        }
      ])
      .select()
      .single();

    if (createRoundError) {
      console.error("Error creating new round:", createRoundError);
      return null;
    }

    console.log("Created new round:", newRound.id, "ending at", utcNextRoundEndTime);
    return newRound;
  } catch (error) {
    console.error("Error in getOrCreateRound:", error);
    return null;
  }
}

// Helper function to ensure a player has a points entry for the current round
async function ensurePlayerPointsEntry(roundId: number, userId: string | number) {
  try {
    // Check if an entry already exists
    const { data: existingEntry } = await supabase
      .from('sg_player_points')
      .select('id')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single();

    if (existingEntry) {
      // Entry already exists, no need to create one
      return;
    }

    // Create a new entry with starting points
    const { error: createError } = await supabase
      .from('sg_player_points')
      .insert([
        {
          user_id: userId,
          round_id: roundId,
        }
      ]);

    if (createError) {
      console.error("Error creating player points entry:", createError);
    } else {
      console.log(`Created points entry for user ${userId} in round ${roundId}`);
    }
  } catch (error) {
    console.error("Error in ensurePlayerPointsEntry:", error);
  }
}

// Helper function to get a random followee as a candidate
async function getRandomFolloweeCandidate(farcasterId: string): Promise<StealCandidate | null> {
  try {
    // Get the user's Farcaster ID
    const { data: userData } = await supabase
      .from('users')
      .select('farcaster_id')
      .eq('id', farcasterId)
      .single();

    if (!userData || !userData.farcaster_id) {
      return null;
    }

    // Get user's followees from Neynar API
    const followingResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${userData.farcaster_id}&limit=100`,
      {
        headers: {
          api_key: process.env.NEYNAR_API_KEY as string,
          accept: 'application/json',
        },
      }
    );

    if (!followingResponse.ok) {
      throw new Error(`Neynar following API error: ${followingResponse.status}`);
    }

    const followingData = await followingResponse.json();

    if (!followingData?.users?.length) {
      return null;
    }

    // Select a random followee
    const randomIndex = Math.floor(Math.random() * followingData.users.length);
    const randomFollowData = followingData.users[randomIndex];
    const randomFollowee = randomFollowData.user;

    // Find or create the user in our database
    const followeeId = await findOrCreateUser(
      randomFollowee.fid,
    );

    if (!followeeId) {
      return null;
    }

    // Get user details from our database
    const { data: followeeData } = await supabase
      .from('users')
      .select('id, farcaster_username, avatar_url, farcaster_id')
      .eq('id', followeeId)
      .single();

    if (!followeeData) {
      return null;
    }

    return {
      id: followeeData.id.toString(),
      username: followeeData.farcaster_username || "Unknown",
      avatar_url: followeeData.avatar_url || "",
      farcaster_id: followeeData.farcaster_id || 0,
      source: "followee"
    };
  } catch (error) {
    console.error("Error fetching random followee:", error);
    return null;
  }
}

// Helper function to create or update a user based on Farcaster data
async function findOrCreateUser(fid: number): Promise<number | null> {
  // First, check if the user already exists in our database
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('farcaster_id', fid)
    .limit(1)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // User doesn't exist, need to create a new one
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          api_key: process.env.NEYNAR_API_KEY as string,
          accept: 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const userData = data?.users?.[0];

    if (userData) {
      // Upload profile picture to Supabase Storage if it exists
      let avatarUrl = null;

      if (userData.pfp_url) {
        try {
          // Fetch the image from the original URL
          const imageResponse = await fetch(userData.pfp_url);
          const imageBuffer = await imageResponse.arrayBuffer();

          // Determine the file extension and content type based on the URL or Content-Type header
          let fileExtension = 'jpg';
          let contentType = 'image/jpeg';

          // Try to get content type from response headers
          const responseContentType = imageResponse.headers.get('content-type');
          if (responseContentType) {
            contentType = responseContentType;

            // Map content type to file extension
            if (contentType === 'image/png') {
              fileExtension = 'png';
            } else if (contentType === 'image/svg+xml') {
              fileExtension = 'svg';
            } else if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
              fileExtension = 'jpg';
            } else if (contentType === 'image/gif') {
              fileExtension = 'gif';
            } else if (contentType === 'image/webp') {
              fileExtension = 'webp';
            }
          } else {
            // Fallback: try to determine from URL
            const url = userData.pfp_url.toLowerCase();
            if (url.endsWith('.png')) {
              fileExtension = 'png';
              contentType = 'image/png';
            } else if (url.endsWith('.svg')) {
              fileExtension = 'svg';
              contentType = 'image/svg+xml';
            } else if (url.endsWith('.gif')) {
              fileExtension = 'gif';
              contentType = 'image/gif';
            } else if (url.endsWith('.webp')) {
              fileExtension = 'webp';
              contentType = 'image/webp';
            } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
              fileExtension = 'jpg';
              contentType = 'image/jpeg';
            }
          }

          // Generate a unique filename for the image
          const fileName = `${fid}_${Date.now()}.${fileExtension}`;

          // Upload the image to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('user-avatars') // Make sure this bucket exists in your Supabase project
            .upload(fileName, imageBuffer, {
              contentType: 'image/jpeg', // Adjust content type as needed
              upsert: true
            });

          if (uploadError) {
            console.error('Error uploading profile picture:', uploadError);
          } else {
            // Get public URL for the uploaded image
            const { data: publicUrlData } = supabase.storage
              .from('user-avatars')
              .getPublicUrl(fileName);

            avatarUrl = publicUrlData.publicUrl;
          }
        } catch (uploadError) {
          console.error('Error processing profile picture:', uploadError);
          // Fallback to the original URL if upload fails
          avatarUrl = `${IMG_BASE_URL}/${encodeURIComponent(userData.pfp_url)}`;
        }
      }

      // Create the user
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            name: userData.display_name,
            farcaster_username: userData.username,
            farcaster_id: fid,
            avatar_url: avatarUrl,
            custody_address: userData.custody_address,
            verified_addresses: userData.verified_addresses?.eth_addresses || [],
            verified_accounts: userData.verified_accounts || [],
            status: 'PREMADE',
          },
        ])
        .select('id')
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        return null;
      }

      return createdUser.id;
    }
  } catch (error) {
    console.error("Error fetching or creating user:", error);
  }

  return null;
}