
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const CoinWebsiteHeader = ({ ticker }: { ticker: string }) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.4)] py-4">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center">
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
          </div>
          <div className="w-10"></div> {/* This creates balance for the back button */}
        </div>
      </div>
    </div>
  );
};
