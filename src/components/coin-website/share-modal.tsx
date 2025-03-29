
import { Twitter, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  selectedUsername: string;
}

export const ShareModal = ({ open, onOpenChange, ticker, selectedUsername }: ShareModalProps) => {
  const { toast } = useToast();

  const handleShare = (platform: 'twitter' | 'farcaster') => {
    const text = encodeURIComponent(`I just stole the airdrop from @${selectedUsername} on Lovable! Check out $${ticker}`);

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    } else {
      toast({
        description: "Farcaster sharing will be available soon!",
        duration: 2000,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A1A] border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white font-['Outfit']">Share Your Steal</DialogTitle>
          <DialogDescription className="text-white/70">
            Share your successful steal on social media
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center gap-2 w-full bg-[#E5DEFF] hover:bg-[#E5DEFF]/90 text-[#111111] rounded-xl px-6 py-2.5 transition-colors font-['Outfit']"
          >
            <Twitter className="w-5 h-5" />
            Share on X
          </button>
          <button
            onClick={() => handleShare('farcaster')}
            className="flex items-center justify-center gap-2 w-full bg-black/50 hover:bg-black/70 text-white border border-white/10 rounded-xl px-6 py-2.5 transition-colors font-['Outfit']"
          >
            <Share2 className="w-5 h-5" />
            Share on Farcaster
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
