
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

            <button
              className="p-3 rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => console.log("Discord clicked")}
            >
              <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
