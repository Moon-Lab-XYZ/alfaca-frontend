
interface Tokenomics {
  totalSupply: string;
  circulating: string;
  burned: string;
  liquidity: string;
  team: string;
  marketing: string;
  community: string;
  ticker?: string; // Make ticker optional since it was missing in the interface
}

interface TokenomicsSectionProps {
  tokenomics: Tokenomics;
}

export const TokenomicsSection = ({ tokenomics }: TokenomicsSectionProps) => {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-white">Tokenomics</h2>
      </div>
      
      <div className="space-y-5">
        <p className="text-white/80 leading-relaxed">
          The total circulating supply is {tokenomics.totalSupply} {tokenomics.ticker || "$TOKEN"}.
        </p>
        
        <p className="text-white/80 leading-relaxed">
          The token starts with only its supply (no ETH backing), as Clanker employs one-sided liquidity on Uniswap v3.
        </p>
      </div>
    </div>
  );
};
