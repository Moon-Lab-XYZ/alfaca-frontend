"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { toast } from "@/hooks/use-toast";
import { ImagePlus, Twitter, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import { signIn, getCsrfToken } from "next-auth/react";
import sdk, {
} from "@farcaster/frame-sdk";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Launch = () => {
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    image: null as File | null,
    imageUrl: "",
  });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);


  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();

      if (status !== "authenticated") {
        const result = await sdk.actions.signIn({
          nonce: await getNonce(),
        });
        const response = await signIn("credentials", {
          message: result.message,
          signature: result.signature,
          redirect: false,
        });
      }
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        setUploadLoading(true);

        // Set local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase
        const { data, error } = await supabase
          .storage
          .from('tokens')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('tokens')
          .getPublicUrl(filePath, {
            transform: {
              width: 500,
              height: 500,
            }
          });

        // Update form with file and URL
        setFormData((prev) => ({
          ...prev,
          image: file,
          imageUrl: urlData.publicUrl
        }));

        toast({
          description: "Image uploaded successfully.",
        });
      } catch (error) {
        console.error("Error uploading image: ", error);
        toast({
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleShare = (platform: 'twitter' | 'farcaster') => {
    const text = encodeURIComponent(`Check out my new token ${formData.name} ($${formData.ticker}) on Lovable!`);

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    } else {
      toast({
        description: "Farcaster sharing will be available soon!",
      });
    }
    setShowShareModal(false);
  };

  const isFormValid = formData.name && formData.ticker && formData.imageUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await fetch('/api/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.ticker,
          imageUrl: formData.imageUrl,
        }),
      });

      if (!result.ok) {
        throw new Error('Failed to create token');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        description: "Your token has been launched successfully.",
      });
      setShowShareModal(true);
    } catch (error) {
      toast({
        description: "Failed to launch token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#000000] pb-24">
        <div className="max-w-sm mx-auto px-4 pt-4">
          <div className="bg-[#000000] rounded-2xl p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium font-['Outfit']">Token Name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5DEFF] transition-colors font-['Outfit']"
                  placeholder="Enter token name"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium font-['Outfit']">Ticker Symbol</label>
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ticker: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5DEFF] transition-colors font-['Outfit']"
                  placeholder="Enter ticker (e.g. BTC)"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium font-['Outfit']">Token Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center justify-center mt-1">
                  {imagePreview ? (
                    <div
                      className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10 group cursor-pointer"
                      onClick={handleImageClick}
                    >
                      {uploadLoading ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                        </div>
                      ) : null}
                      <img
                        src={imagePreview}
                        alt="Token preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/50 hover:text-white hover:border-white/30 transition-colors"
                    >
                      {uploadLoading ? (
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ImagePlus className="w-8 h-8" />
                          <span className="text-sm font-['Outfit']">Upload Image</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadLoading || !isFormValid}
                className="w-full bg-[#E5DEFF] hover:bg-[#E5DEFF]/90 disabled:opacity-50 disabled:hover:bg-[#E5DEFF] text-[#111111] rounded-xl px-6 py-2.5 font-medium transition-all duration-200 font-['Outfit']"
              >
                {loading ? "Launching..." : "Launch Token"}
              </button>
            </form>
          </div>
        </div>
        <BottomNav />
      </div>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="bg-[#1A1A1A] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white font-['Outfit']">Share Your Token</DialogTitle>
            <DialogDescription className="text-white/70">
              Share your newly launched token on social media
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
    </>
  );
};

export default Launch;