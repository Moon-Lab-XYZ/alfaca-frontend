import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/auth'; // Define auth options in your app
import { ethers } from "ethers";
import { CONTRACT_BYTECODE } from "@/lib/alfacaContractByteCode";
import { ALFACA_ABI } from "@/lib/abi/alfaca";

const DEPLOYER_ADDRESS = "0x08F832Fe5763A21a5BDcc04388e29D6b8Cccf469";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC as string).connect(provider);
const alfacaContract = new ethers.Contract(process.env.ALFACA_CONTRACT as string, ALFACA_ABI, wallet);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("🔹 Session:", session);

  if (!session) {
    return NextResponse.json({ message: "❌ Unauthorized"}, { status: 401 });
  }

  const params = await request.json();
  console.log("🔹 Request Params:", params);
  console.log("🔹 Creating Token...");

  const tx = await alfacaContract.toggleAllowedPairedToken(WETH_ADDRESS, true);
  console.log("🔹 Transaction sent, waiting for confirmation...", tx.hash);
  await tx.wait();
  console.log("✅ WETH allowed as paired token");

  // Find an optimal salt
  const optimalSalt = await findOptimalSalt(
    DEPLOYER_ADDRESS,
    CONTRACT_BYTECODE as string, // Load from .env or JSON file
    ["Test", "TT", 100000000000, DEPLOYER_ADDRESS, 1297, "", ""],
    process.env.ALFACA_CONTRACT as string,
    WETH_ADDRESS
  );

  if (!optimalSalt) {
    return Response.json({ message: "❌ No optimal salt found" }, { status: 400});
  }

  console.log("✅ Using optimal salt:", optimalSalt);

  // Deploy the token with the optimal salt
  const result = await deployToken({
    name: "Test",
    symbol: "TT",
    supply: 100000000000,
    fee: 10000,
    salt: optimalSalt,
    deployer: DEPLOYER_ADDRESS,
    fid: 1297,
    image: "",
    castHash: "",
    poolConfig: {
      tick: -230200,
      pairedToken: WETH_ADDRESS,
      devBuyFee: 1000
    },
  });

  if (!result) {
    return Response.json({ success: false, message: "❌ Token deployment failed" });
  }

  // Log transaction hash and deployed token address
  console.log("✅ Token deployed successfully!", result);

  return Response.json({
    success: true,
    transactionHash: result.transactionHash,
    tokenAddress: result.tokenAddress
  });
}

interface PoolConfig {
  tick: number;
  pairedToken: string;
  devBuyFee: number;
}

interface DeployTokenParams {
  name: string;
  symbol: string;
  supply: number;
  fee: number;
  salt: string;
  deployer: string;
  fid: number;
  image: string;
  castHash: string;
  poolConfig: PoolConfig;
  ethValue?: string; // Optional parameter with default value
}

async function findOptimalSalt(deployerAddress: any, contractBytecode: any, constructorArgs: any, factoryAddress: any, wethAddress: any) {
  const timestamp = Math.floor(Date.now() / 1000);

  // Use encode (not solidityPacked) for baseSalt to match abi.encode in Solidity
  const baseSalt = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "address"], [timestamp, deployerAddress])
  );

  for (let i = 0; i < 256; i++) {
    // Use encode (not solidityPacked) to match abi.encode in Solidity
    const salt = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "uint256"], [baseSalt, i])
    );

    // Use encode (not solidityPacked) for the salt transformation
    const transformedSalt = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["address", "bytes32"], [deployerAddress, salt])
    );

    const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "uint256", "address", "uint256", "string", "string"],
      constructorArgs
    );

    // This part looks correct, matching abi.encodePacked in Solidity
    const bytecodeHash = ethers.keccak256(
      ethers.concat([contractBytecode, encodedArgs])
    );

    const predictedAddress = ethers.getCreate2Address(factoryAddress, transformedSalt, bytecodeHash);

    console.log(`Iteration ${i}: Predicted Address:`, predictedAddress);

    if (BigInt(predictedAddress) < BigInt(wethAddress)) {
      console.log("✅ Found optimal salt:", salt);
      console.log("✅ Matching Address:", predictedAddress);
      console.log("✅ WETH Address:", wethAddress);
      return salt;
    }
  }
  return null;
}


async function deployToken({
  name,
  symbol,
  supply,
  fee,
  salt,
  deployer,
  fid,
  image,
  castHash,
  poolConfig,
  ethValue = "0"
}: DeployTokenParams) {
  try {
    // Set up provider and wallet signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC as string).connect(provider);

    // Connect to the contract
    const alfacaContract = new ethers.Contract(
      process.env.ALFACA_CONTRACT as string,
      ALFACA_ABI,
      wallet
    );

    console.log("Deploying token with params:", {
      name,
      symbol,
      supply,
      fee,
      salt,
      deployer,
      fid,
      image,
      castHash,
      poolConfig,
    });

    // Prepare transaction
    const tx = await alfacaContract.deployToken(
      name,
      symbol,
      supply,
      fee,
      salt,
      deployer,
      fid,
      image,
      castHash,
      poolConfig,
      {
        value: ethers.parseEther(ethValue), // Send ETH if required
        gasLimit: 10000000 // Adjust gas limit if necessary
      }
    );

    console.log("Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return receipt;
  } catch (error: any) {
    console.error("🔴 Detailed Error:", JSON.stringify(error, null, 2));

    // Log revert reason (if available)
    if (error?.reason) {
        console.error("❌ Revert Reason:", error.reason);
    }

    // Log transaction details
    if (error?.transaction) {
        console.error("❌ Failed Transaction:", error.transaction);
    }

    // Log the full receipt
    if (error?.receipt) {
        console.error("📜 Transaction Receipt:", error.receipt);
    }
    return null;
  }
}
