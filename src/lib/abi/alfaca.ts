export const ALFACA_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "locker_", "type": "address" },
      { "internalType": "address", "name": "uniswapV3Factory_", "type": "address" },
      { "internalType": "address", "name": "positionManager_", "type": "address" },
      { "internalType": "address", "name": "swapRouter_", "type": "address" },
      { "internalType": "address", "name": "owner_", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "Deprecated",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidConfig",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "NotAdmin",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
    "name": "NotAllowedPairedToken",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
    "name": "TokenNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "version",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "weth",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deprecated",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getTokensDeployedByUser",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "uint256", "name": "positionId", "type": "uint256" },
          { "internalType": "address", "name": "locker", "type": "address" }
        ],
        "internalType": "struct Alfaca.DeploymentInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "admin", "type": "address" },
      { "internalType": "bool", "name": "isAdmin", "type": "bool" }
    ],
    "name": "setAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "bool", "name": "allowed", "type": "bool" }
    ],
    "name": "toggleAllowedPairedToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "_deprecated", "type": "bool" }],
    "name": "setDeprecated",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newLocker", "type": "address" }],
    "name": "updateLiquidityLocker",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "positionId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "deployer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "fid", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "supply", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "lockerAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "castHash", "type": "string" }
    ],
    "name": "TokenCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" },
      { "internalType": "uint256", "name": "_supply", "type": "uint256" },
      { "internalType": "uint24", "name": "_fee", "type": "uint24" },
      { "internalType": "bytes32", "name": "_salt", "type": "bytes32" },
      { "internalType": "address", "name": "_deployer", "type": "address" },
      { "internalType": "uint256", "name": "_fid", "type": "uint256" },
      { "internalType": "string", "name": "_image", "type": "string" },
      { "internalType": "string", "name": "_castHash", "type": "string" },
      {
        "components": [
          { "internalType": "int24", "name": "tick", "type": "int24" },
          { "internalType": "address", "name": "pairedToken", "type": "address" },
          { "internalType": "uint24", "name": "devBuyFee", "type": "uint24" }
        ],
        "internalType": "struct Alfaca.PoolConfig",
        "name": "_poolConfig",
        "type": "tuple"
      }
    ],
    "name": "deployToken",
    "outputs": [
      { "internalType": "contract AlfacaToken", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "positionId", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
]