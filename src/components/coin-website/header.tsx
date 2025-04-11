
import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import sdk from "@farcaster/frame-sdk";

export const CoinWebsiteHeader = ({ ticker }: { ticker: string }) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.4)] py-4">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center w-full">
          <button
            onClick={handleBackClick}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-medium text-white">
              🥷 Stolen 🥷
            </h1>
            <p className="text-[#E5DEFF] text-xl mt-0.5">${ticker}</p>
          </div>
          <button
            onClick={async () => {
              const context = await sdk.context;
              if (context) {
                await sdk.actions.openUrl("https://docs.google.com/document/d/1KbdMKb3xfMC9WURS3jF92zPkSCUDo_EpBclBZmSz6DY/edit?usp=sharing");
              } else {
                window.open("https://docs.google.com/document/d/1KbdMKb3xfMC9WURS3jF92zPkSCUDo_EpBclBZmSz6DY/edit?usp=sharing", "_blank");
              }
            }}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Game Information"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
