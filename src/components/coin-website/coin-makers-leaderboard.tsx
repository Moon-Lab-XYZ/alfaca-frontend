
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sword, Copy, ExternalLink, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal
} from "@/components/ui/alert-dialog";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Sample coin maker data with added gradient colors for avatars
const sampleCoinMakers = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  username: `maker${i + 1}`,
  displayName: `Coin Maker ${i + 1}`,
  points: Math.floor(Math.random() * 1000) + 100,
  gradient: `linear-gradient(135deg, hsl(${Math.floor(Math.random() * 360)}, 70%, 60%), hsl(${Math.floor(Math.random() * 360)}, 70%, 40%))`,
}));

export const CoinMakersLeaderboard = () => {
  const [coinMakers, setCoinMakers] = useState(sampleCoinMakers);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const { toast } = useToast();
  const { ticker } = useParams();

  // Debug log to check state changes
  useEffect(() => {
    console.log("Modal state changed:", showRequirementModal);
  }, [showRequirementModal]);

  const handleSteal = (makerId: number) => {
    console.log("Steal button clicked, opening modal");
    setShowRequirementModal(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setShowRequirementModal(false);
  };

  const handleCopyAddress = () => {
    const address = "0x4455...cAD7";
    navigator.clipboard.writeText(address);
    toast({
      description: "Contract address copied to clipboard",
      duration: 2000,
    });
  };

  const handleDexScreener = () => {
    window.open(`https://dexscreener.com/ethereum/${ticker?.toLowerCase()}`, '_blank');
  };

  return (
    <div className="mt-6 bg-[#1A1A1A] border-none rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Coin Makers Leaderboard</h2>
      </div>
      
      <div className="p-2">
        <Table>
          <TableHeader className="bg-[#252525]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-white/70 font-medium">Rank</TableHead>
              <TableHead className="text-white/70 font-medium">Maker</TableHead>
              <TableHead className="text-white/70 font-medium text-right">Points</TableHead>
              <TableHead className="text-white/70 font-medium text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coinMakers
              .sort((a, b) => b.points - a.points)
              .map((maker, index) => (
                <TableRow 
                  key={maker.id} 
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <TableCell className="text-white font-medium">#{index + 1}</TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-white/10" style={{ background: maker.gradient }}>
                        <AvatarFallback className="text-xs font-medium text-neutral-800">
                          {maker.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      @{maker.username}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white font-medium">{maker.points}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-lavender-300/80 hover:bg-lavender-300 text-white border-none rounded-lg font-medium gap-1.5 py-1 px-3 h-8"
                      onClick={() => handleSteal(maker.id)}
                    >
                      <Sword size={14} className="mr-1" />
                      Steal
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Modal Implementation */}
      <AlertDialog open={showRequirementModal}>
        <AlertDialogPortal>
          <AlertDialogOverlay 
            className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
            onClick={handleCloseModal} 
          />
          <AlertDialogContent 
            className="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-[#1A1A1A] border border-white/10 max-w-[350px] p-0 rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            {/* Close button */}
            <button 
              onClick={handleCloseModal}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-black/30 text-white/60 hover:text-white/90 transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            
            <div className="p-4 pb-6">
              <AlertDialogTitle className="text-center text-lg font-bold text-white">
                Coin Required
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-white/80 mt-2">
                You must hold at least 100,000 ${ticker} to play
              </AlertDialogDescription>
              
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-2 px-4 text-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                >
                  <Copy size={16} /> CA
                </button>
                <button
                  onClick={handleDexScreener}
                  className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-2 px-4 text-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                >
                  <ExternalLink size={16} /> DEX
                </button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  );
};
