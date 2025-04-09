import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

export async function POST(request: NextRequest) {
  try {
    // Read the request body once and convert to string for verification
    const bodyText = await request.text();
    const bodyData = JSON.parse(bodyText);

    // Verify signature
    const sig = request.headers.get("X-Neynar-Signature");
    if (!sig) {
      return NextResponse.json({ error: "Neynar signature missing from request headers" }, { status: 400 });
    }

    const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Make sure you set NEYNAR_WEBHOOK_SECRET in your .env file" }, { status: 400 });
    }

    const hmac = createHmac("sha512", webhookSecret);
    hmac.update(bodyText);
    const generatedSignature = hmac.digest("hex");

    const isValid = generatedSignature === sig;
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    console.log('steal webhook received');

    // 1. Check if the text contains the invisible braille unicode
    const castText = bodyData.data.text;
    const hiddenCharRegex = /\u2800/;
    if (!hiddenCharRegex.test(castText)) {
      console.log('Missing hidden character marker');
      return NextResponse.json({ error: "Not a valid steal command" }, { status: 400 });
    }

    // 2. Parse attackerId from author.fid
    const attackerId = bodyData.data.author.fid;
    console.log(`Attacker FID: ${attackerId}`);

    // Look up the user ID from farcaster_id
    const { data: attackerUser, error: attackerError } = await supabase
      .from('users')
      .select('id')
      .eq('farcaster_id', attackerId)
      .single();

    if (attackerError || !attackerUser) {
      console.log(`User not found for FID: ${attackerId}`);
      return NextResponse.json({ error: "Attacker not found" }, { status: 404 });
    }

    // 3. Extract usernames from text and convert to user IDs
    const usernames = parseUsernames(castText);
    console.log(`Parsed usernames: ${usernames.join(', ')}`);

    if (usernames.length === 0) {
      return NextResponse.json({ error: "No target usernames found" }, { status: 400 });
    }

    // Convert usernames to user IDs
    const { data: targetUsers, error: targetUsersError } = await supabase
      .from('users')
      .select('id, farcaster_username')
      .in('farcaster_username', usernames);

    if (targetUsersError || !targetUsers || targetUsers.length === 0) {
      console.log('No matching target users found');
      return NextResponse.json({ error: "No matching target users found" }, { status: 404 });
    }

    const targetIds = targetUsers.map(user => user.id);
    console.log(`Target IDs: ${targetIds.join(', ')}`);

    // 4. Extract token ID from embeds and find the latest active round
    let tokenId = null;

    // Check embeds for token ID
    if (bodyData.data.embeds && bodyData.data.embeds.length > 0) {
      for (const embed of bodyData.data.embeds) {
        if (embed.url) {
          const match = embed.url.match(/\/token\/(\d+)\/steal/);
          if (match && match[1]) {
            tokenId = parseInt(match[1]);
            break;
          }
        }
      }
    }

    if (!tokenId) {
      console.log('No token ID found in embeds');
      return NextResponse.json({ error: "Token ID not found" }, { status: 400 });
    }

    console.log(`Token ID: ${tokenId}`);

    // Find the latest active round for this token
    const { data: roundData, error: roundError } = await supabase
      .from('sg_rounds')
      .select('*')
      .eq('token', tokenId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (roundError || !roundData) {
      console.log(`No active round found for token ${tokenId}`);
      return NextResponse.json({ error: "No active round found for this token" }, { status: 404 });
    }

    const roundId = roundData.id;
    console.log(`Round ID: ${roundId}`);

    // 5. Parse castId from data.hash
    const castId = bodyData.data.hash;
    console.log(`Cast ID: ${castId}`);

    // Get attacker's points
    const { data: attackerPoints, error: attackerPointsError } = await supabase
      .from('sg_player_points')
      .select('*')
      .eq('user_id', attackerUser.id)
      .eq('round_id', roundId)
      .single();

    if (attackerPointsError || !attackerPoints) {
      return NextResponse.json({ error: "Attacker not found in this round" }, { status: 404 });
    }

    if (attackerPoints.points <= 0) {
      return NextResponse.json({ error: "Attacker has no points to steal with" }, { status: 400 });
    }

    // Amount to bet (10% of attacker's holding)
    const betAmount = Math.floor(attackerPoints.points * 0.1);

    // Process each target
    const results = [];

    for (const targetId of targetIds) {
      // Get target's points
      const { data: targetPoints, error: targetError } = await supabase
        .from('sg_player_points')
        .select('*')
        .eq('user_id', targetId)
        .eq('round_id', roundId)
        .single();

      if (targetError || !targetPoints) {
        results.push({
          targetId,
          success: false,
          error: "Target not found in this round"
        });
        continue;
      }

      if (targetPoints.points <= 0) {
        results.push({
          targetId,
          success: false,
          error: "Target has no points to steal"
        });
        continue;
      }

      // Calculate win probability using the formula
      // P(win) = min(0.05 + 0.75 * (attacker_pct / (attacker_pct + defender_pct))^1.0, 0.80)
      const totalPoints = attackerPoints.points + targetPoints.points;
      const attackerPct = attackerPoints.points / totalPoints;
      const winProbability = Math.min(0.05 + 0.75 * Math.pow(attackerPct, 1.0), 0.80);

      // Determine success
      const isSuccessful = Math.random() < winProbability;

      // Calculate actual amount to steal (max 10% of attacker's points or target's points, whichever is lower)
      const stealAmount = Math.min(betAmount, targetPoints.points);

      // Update points based on success
      if (isSuccessful) {
        // Attacker wins, gains points from target
        await supabase
          .from('sg_player_points')
          .update({ points: attackerPoints.points + stealAmount })
          .eq('user_id', attackerUser.id)
          .eq('round_id', roundId);

        await supabase
          .from('sg_player_points')
          .update({ points: targetPoints.points - stealAmount })
          .eq('user_id', targetId)
          .eq('round_id', roundId);
      } else {
        // Attacker loses, loses bet amount
        await supabase
          .from('sg_player_points')
          .update({ points: attackerPoints.points - betAmount })
          .eq('user_id', attackerUser.id)
          .eq('round_id', roundId);

        // target wins bet amount
        await supabase
          .from('sg_player_points')
          .update({ points: targetPoints.points + betAmount })
          .eq('user_id', targetId)
          .eq('round_id', roundId);
      }

      // Record the steal attempt
      const { data: actionData, error: actionError } = await supabase
        .from('sg_player_actions')
        .insert({
          round_id: roundId,
          attacker_id: attackerUser.id,
          target_id: targetId,
          amount: isSuccessful ? stealAmount : betAmount,
          successful: isSuccessful,
          cast_id: castId || null
        })
        .select()
        .single();

      if (actionError) {
        console.error("Error recording steal action:", actionError);
      }

      results.push({
        targetId,
        success: isSuccessful,
        amount: isSuccessful ? stealAmount : betAmount,
        actionId: actionData?.id,
        probability: winProbability
      });
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error("Error processing steal action:", error);
    return NextResponse.json({ error: "Failed to process steal" }, { status: 500 });
  }
}

/**
 * Parses usernames from a stealing announcement text
 * @param {string} text - The text containing usernames
 * @returns {string[]} Array of extracted usernames
 */
function parseUsernames(text: string) {
  // Match the text between "from" and "on @alfaca!"
  const regex = /from\s+(.+?)\s+on\s+@alfaca!/i;
  const match = text.match(regex);

  if (!match || !match[1]) {
    return [];
  }

  // Get the captured usernames part and split by commas and optional spaces
  const usernamesStr = match[1];
  // Split by comma and optional space, then trim each username
  const usernames = usernamesStr.split(/\s*,\s*/).map((username: string) => username.trim());

  return usernames;
}