
import Link from 'next/link'
import { usePathname } from "next/navigation";
import { Trophy, CircleDollarSign, User } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111111]/80 border-t border-[#E5DEFF]/10 py-3 z-50 backdrop-blur-md">
      <div className="max-w-md mx-auto flex justify-around items-center relative px-4">
        <Link
          href="/"
          className={`flex flex-col items-center space-y-1 p-2.5 rounded-xl transition-all duration-200 ${
            isActive("/")
              ? "text-[#E5DEFF] bg-[#E5DEFF]/5"
              : "text-white/50 hover:text-white/70 hover:bg-white/5"
          }`}
        >
          <Trophy size={22} />
          <span className="text-xs font-medium">Ranking</span>
        </Link>

        <Link
          href="/launch"
          className={`flex flex-col items-center space-y-1 p-2.5 rounded-xl transition-all duration-200`}
        >
          <div className="w-11 h-11 rounded-full
                        bg-gradient-to-br from-[#E5DEFF] to-[#E5DEFF]/80
                        flex items-center justify-center text-[#111111]
                        shadow-[0_4px_12px_rgba(229,222,255,0.3)]
                        hover:shadow-[0_6px_16px_rgba(229,222,255,0.4)]
                        hover:scale-105 active:scale-95
                        transition-all duration-300 ease-out
                        border border-[#E5DEFF]/20"
          >
            <div className="bg-[#E5DEFF]/20 p-1.5 rounded-full">
              <CircleDollarSign size={24} strokeWidth={2.5} className="drop-shadow-lg" />
            </div>
          </div>
          <span className="text-xs font-medium text-white/70">Launch</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center space-y-1 p-2.5 rounded-xl transition-all duration-200 ${
            isActive("/profile")
              ? "text-[#E5DEFF] bg-[#E5DEFF]/5"
              : "text-white/50 hover:text-white/70 hover:bg-white/5"
          }`}
        >
          <User size={22} />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
};
