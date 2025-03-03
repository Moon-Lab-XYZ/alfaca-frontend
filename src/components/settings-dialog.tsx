
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, LogOut, HelpCircle, ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from 'next/navigation'

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

export const SettingsDialog = ({ trigger }: SettingsDialogProps) => {
  const router = useRouter();

  async function handleSignout() {
    await signOut({
      redirect: false,
    });
    router.push("/");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Settings className="w-6 h-6 text-white/70" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-lg font-semibold text-white/90 hover:bg-white/5 rounded-xl transition-colors"
            onClick={handleSignout}
          >
            <LogOut className="w-6 h-6" />
            Sign out
          </button>

          <div className="h-px bg-white/10" />

          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-lg font-semibold text-white/90 hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => console.log("How to clicked")}
          >
            <HelpCircle className="w-6 h-6" />
            How to
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-lg font-semibold text-white/90 hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => console.log("Support clicked")}
          >
            <ExternalLink className="w-6 h-6" />
            Support
          </button>

          <div className="h-px bg-white/10" />

          <button
            className="w-full flex items-center justify-center px-4 py-3 text-left text-base text-white/50 hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => console.log("Terms clicked")}
          >
            Terms of use
          </button>

          <button
            className="w-full flex items-center justify-center px-4 py-3 text-left text-base text-white/50 hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => console.log("Privacy clicked")}
          >
            Privacy policy
          </button>

          <div className="h-px bg-white/10" />

          <div className="flex justify-center gap-6">
            <button
              className="p-3 rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => console.log("Twitter clicked")}
            >
              <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
