import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const body = await request.text();
  const sig = request.headers.get("X-Neynar-Signature");
  if (!sig) {
    return NextResponse.json({ error: "Neynar signature missing from request headers" }, { status: 400 });
  }
  const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Make sure you set NEYNAR_WEBHOOK_SECRET in your .env file" }, { status: 400 });
  }
  const hmac = createHmac("sha512", webhookSecret);
  hmac.update(body);

  const generatedSignature = hmac.digest("hex");

  const isValid = generatedSignature === sig;
  if (!isValid) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  console.log('steal');

  try {
    const { attackerId, targetIds, roundId, castId } = await request.json();

    if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json({ error: "Invalid targets provided" }, { status: 400 });
    }

    if (!roundId) {
      return NextResponse.json({ error: "Round ID is required" }, { status: 400 });
    }

    // Get the current round to ensure it's active
    const { data: roundData, error: roundError } = await supabase
      .from('sg_rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (roundError || !roundData) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (roundData.status !== 'active') {
      return NextResponse.json({ error: "Round is not active" }, { status: 400 });
    }

    // Get attacker's points
    const { data: attackerPoints, error: attackerError } = await supabase
      .from('sg_player_points')
      .select('*')
      .eq('user_id', attackerId)
      .eq('round_id', roundId)
      .single();

    if (attackerError || !attackerPoints) {
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
          .eq('user_id', attackerId)
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
          .eq('user_id', attackerId)
          .eq('round_id', roundId);
      }

      // Record the steal attempt
      const { data: actionData, error: actionError } = await supabase
        .from('sg_player_actions')
        .insert({
          round_id: roundId,
          attacker_id: attackerId,
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