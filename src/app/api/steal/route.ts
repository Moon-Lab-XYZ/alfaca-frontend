import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { ethers } from "ethers";

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

    // 5. Parse castId from data.hash
    const castHash = bodyData.data.hash;
    console.log(`Cast Hash: ${castHash}`);

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

    const castText = bodyData.data.text;

    // 3. Extract usernames from text and convert to user IDs
    const usernames = parseUsernames(castText);
    console.log(`Parsed usernames: ${usernames.join(', ')}`);

    if (usernames.length === 0 && !castText.includes('Launching my')) {
      await fetch('https://api.neynar.com/v2/farcaster/cast', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api_key': process.env.NEYNAR_API_KEY as string,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          signer_uuid: process.env.NEYNAR_SIGNER_UUID as string,
          text: 'An error occurred while trying to steal. Please do not edit the cast text and try again.',
          parent: castHash,
          idem: castHash,
        }),
      });
      return NextResponse.json({ error: "No target usernames found" }, { status: 400 });
    }

    // 2. Parse attackerId from author.fid
    const attackerFid = bodyData.data.author.fid;
    console.log(`Attacker FID: ${attackerFid}`);

    // Look up the user ID from farcaster_id
    const { data: attackerUser, error: attackerError } = await supabase
      .from('users')
      .select('id, verified_addresses')
      .eq('farcaster_id', attackerFid)
      .single();

    if (attackerError || !attackerUser) {
      console.log(`User not found for FID: ${attackerFid}`);
      return NextResponse.json({ error: "Attacker not found" }, { status: 404 });
    }

    // Update the user's status to ACTIVE when they initiate a steal
    await supabase
      .from('users')
      .update({ status: 'ACTIVE' })
      .eq('id', attackerUser.id);

    console.log(`Updated user ${attackerUser.id} status to ACTIVE`);

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

    // Get token details
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('symbol, contract_address')
      .eq('id', tokenId)
      .single();

    if (tokenError || !tokenData) {
      console.log(`Token not found: ${tokenId}`);
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const tokenSymbol = tokenData.symbol;
    const contractAddress = tokenData.contract_address;

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
    const successfulSteals = [];
    const failedSteals = [];

    // Keep track of points for final tally
    let currentAttackerPoints = attackerPoints.points;

    for (const targetId of targetIds) {
      // Check if this steal attempt has already been processed
      const { data: existingAction, error: checkError } = await supabase
        .from('sg_player_actions')
        .select('id')
        .eq('attacker_id', attackerUser.id)
        .eq('target_id', targetId)
        .eq('cast_id', castHash)
        .eq('round_id', roundId)
        .maybeSingle();

      if (existingAction) {
        console.log(`Duplicate steal attempt detected: attacker=${attackerUser.id}, target=${targetId}, cast=${castHash}`);
        continue;
      }

      // Get target's points and username
      const { data: targetPointsData, error: targetPointsError } = await supabase
        .from('sg_player_points')
        .select('points, user_id')
        .eq('user_id', targetId)
        .eq('round_id', roundId)
        .single();

      const { data: targetUserData, error: targetUserError } = await supabase
        .from('users')
        .select('farcaster_username')
        .eq('id', targetId)
        .single();

      console.log(targetUserData);

      if (targetPointsError || !targetPointsData || targetUserError || !targetUserData) {
        results.push({
          targetId,
          username: targetUsers.find(u => u.id === targetId)?.farcaster_username || 'unknown',
          success: false,
          error: "Target not found in this round"
        });
        failedSteals.push(`${targetUsers.find(u => u.id === targetId)?.farcaster_username || 'unknown'} (not in game)`);
        continue;
      }

      const targetPoints = targetPointsData.points;
      const targetUsername = targetUserData.farcaster_username;

      if (targetPoints <= 0) {
        results.push({
          targetId,
          username: targetUsername,
          success: false,
          error: "Target has no points to steal"
        });
        console.log(`Target ${targetUsername} has no points to steal`);
        failedSteals.push(`${targetUsername} (no points)`);
        continue;
      }

      // Get defender's wallet addresses
      const { data: defenderWalletData, error: defenderWalletError } = await supabase
        .from('users')
        .select('verified_addresses')
        .eq('id', targetId)
        .single();

      const percentages = await calculateTokenPercentages(
        contractAddress,
        attackerUser.verified_addresses,
        defenderWalletData?.verified_addresses,
      );

      // Calculate win probability using our new function
      const winProbability = calculateWinProbability(percentages.attackerPct, percentages.defenderPct);

      // Determine success
      const isSuccessful = Math.random() < winProbability;

      // Calculate actual amount to steal (max 10% of attacker's points or target's points, whichever is lower)
      const stealAmount = Math.min(betAmount, targetPoints);

      if (isSuccessful) {
        // Attacker wins, gains points from target
        await supabase
          .from('sg_player_points')
          .update({ points: currentAttackerPoints + stealAmount })
          .eq('user_id', attackerUser.id)
          .eq('round_id', roundId);

        await supabase
          .from('sg_player_points')
          .update({ points: targetPoints - stealAmount })
          .eq('user_id', targetId)
          .eq('round_id', roundId);

        // Update the current attacker points for probability calculations in next iterations
        currentAttackerPoints += stealAmount;

        successfulSteals.push(`${targetUsername} (you won ${stealAmount} pts)`);
      } else {
        // Attacker loses, loses bet amount
        await supabase
          .from('sg_player_points')
          .update({ points: currentAttackerPoints - betAmount })
          .eq('user_id', attackerUser.id)
          .eq('round_id', roundId);

        // Target gains bet amount
        await supabase
          .from('sg_player_points')
          .update({ points: targetPoints + betAmount })
          .eq('user_id', targetId)
          .eq('round_id', roundId);

        // Update the current attacker points for probability calculations in next iterations
        currentAttackerPoints -= betAmount;

        failedSteals.push(`${targetUsername} (you lost ${betAmount} pts)`);
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
          cast_id: castHash || null
        })
        .select()
        .single();

      if (actionError) {
        console.error("Error recording steal action:", actionError);
      }

      results.push({
        targetId,
        username: targetUsername,
        success: isSuccessful,
        amount: isSuccessful ? stealAmount : betAmount,
        actionId: actionData?.id,
        probability: winProbability
      });
    }

    // Build response message
    let responseMessage = `🥷 $${tokenSymbol} Steal Results:\n\n`;

    if (successfulSteals.length > 0) {
      responseMessage += `✅ Successful: ${successfulSteals.join(", ")}\n`;
    }

    if (failedSteals.length > 0) {
      responseMessage += `❌ Failed: ${failedSteals.join(", ")}\n\n`;
    }

    responseMessage += `Your new $${tokenSymbol} 🦙 balance: ${currentAttackerPoints} points`;

    // Send response through Neynar API
    await publishResponseCast(
      castHash,
      responseMessage,
      process.env.NEYNAR_SIGNER_UUID as string,
      tokenId
    );

    return NextResponse.json({
      success: true,
      results,
      newBalance: currentAttackerPoints
    });

  } catch (error) {
    console.error("Error processing steal action:", error);
    return NextResponse.json({ error: "Failed to process steal" }, { status: 500 });
  }
}

/**
 * Calculate token balance percentages for attacker and defender
 * @param {string} contractAddress - The token contract address
 * @param {string[]} attackerAddresses - Array of attacker wallet addresses
 * @param {string[]} defenderAddresses - Array of defender wallet addresses
 * @param {Object} fallbackData - Fallback data to use if blockchain query fails
 * @returns {Object} Object containing attackerPct and defenderPct
 */
async function calculateTokenPercentages(
  contractAddress: any,
  attackerAddresses: any,
  defenderAddresses: any,
) {
  try {
    // Initialize ethers provider to connect to Base network
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

    // Create contract interface for ERC20 to query balances
    const erc20Abi = [
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)"
    ];

    const tokenContract = new ethers.Contract(contractAddress, erc20Abi, provider);

    // Get total supply
    const totalSupply = await tokenContract.totalSupply();

    // Sum up balances across all addresses for attacker
    let attackerTotalBalance = BigInt(0);
    for (const address of attackerAddresses) {
      try {
        const balance = await tokenContract.balanceOf(address);
        attackerTotalBalance += balance;
        console.log(`Attacker address ${address} has balance: ${balance}`);
      } catch (err) {
        console.warn(`Error fetching balance for attacker address ${address}:`, err);
      }
    }

    // Sum up balances across all addresses for defender
    let defenderTotalBalance = BigInt(0);
    for (const address of defenderAddresses) {
      try {
        const balance = await tokenContract.balanceOf(address);
        defenderTotalBalance += balance;
        console.log(`Defender address ${address} has balance: ${balance}`);
      } catch (err) {
        console.warn(`Error fetching balance for defender address ${address}:`, err);
      }
    }

    // Calculate percentages
    const attackerPct = totalSupply > 0 ? Number(attackerTotalBalance) / Number(totalSupply) : 0;
    const defenderPct = totalSupply > 0 ? Number(defenderTotalBalance) / Number(totalSupply) : 0;

    console.log(`Token balances - Total: ${totalSupply}, Attacker: ${attackerTotalBalance}, Defender: ${defenderTotalBalance}`);
    console.log(`Percentages - Attacker: ${attackerPct}, Defender: ${defenderPct}`);

    return { attackerPct, defenderPct };
  } catch (error) {
    console.error("Error fetching token balances:", error);

    return { attackerPct: 0, defenderPct: 0 };
  }
}

function calculateWinProbability(attackerPct: any, defenderPct: any) {
  // Normalize inputs
  attackerPct = Number(attackerPct) || 0;
  defenderPct = Number(defenderPct) || 0;

  const MIN_WIN = 0.05;
  const MAX_WIN = 0.80;
  const EVEN_WIN = 0.50;

  if (attackerPct === 0 && defenderPct === 0) return EVEN_WIN;
  if (attackerPct === defenderPct) return EVEN_WIN;

  if (defenderPct === 0) {
    const ratio = attackerPct / 0.10;
    return Math.min(EVEN_WIN + (MAX_WIN - EVEN_WIN) * Math.min(ratio, 1), MAX_WIN);
  }

  if (attackerPct === 0) {
    const ratio = defenderPct / 0.10;
    return Math.max(EVEN_WIN - (EVEN_WIN - MIN_WIN) * Math.min(ratio, 1), MIN_WIN);
  }

  const share = attackerPct / (attackerPct + defenderPct);

  if (share <= 0) return MIN_WIN;
  if (share >= 1) return MAX_WIN;
  if (share < 0.5) {
    return MIN_WIN + (EVEN_WIN - MIN_WIN) * (share / 0.5);
  } else {
    return EVEN_WIN + (MAX_WIN - EVEN_WIN) * ((share - 0.5) / 0.5);
  }
}

// Function to publish a response cast using Neynar API with fetch
async function publishResponseCast(
  parentHash: string,
  message: string,
  signerUuid: string,
  tokenId: number
) {
  try {
    console.log(`Publishing response to ${parentHash}: ${message}`);

    const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY as string,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        signer_uuid: signerUuid,
        text: message,
        parent: parentHash,
        embeds: [{
          url: `${process.env.NEXT_PUBLIC_URL}/token/${tokenId}/steal`
        }],
        idem: parentHash,
      }),
    });

    if (!response.ok) {
      console.error('Error publishing response cast:', response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Response cast published: ${data.cast.hash}`);

    // update sg_player_actions table with the cast_id
    await supabase
      .from('sg_player_actions')
      .update({ bot_reply_cast_id: data.cast.hash })
      .eq('cast_id', parentHash);

    return data.cast.hash;
  } catch (error) {
    console.error('Error publishing response cast:', error);
    return null;
  }
}

/**
 * Parses usernames from a stealing announcement text
 * @param {string} text - The text containing usernames
 * @returns {string[]} Array of extracted usernames
 */
function parseUsernames(text: string) {
  // Match the text between "from" and "on @alfaca!"
  const regex = /from\s+(.+?)\s+on\s+@alfaca/i;
  const match = text.match(regex);

  if (!match || !match[1]) {
    return [];
  }

  // Get the captured usernames part and split by commas and optional spaces
  const usernamesStr = match[1];
  // Split by comma and optional space, then trim each username
  const usernames = usernamesStr.split(/\s*,\s*/).map((username: string) => username.trim().replace('@', ''));

  return usernames;
}