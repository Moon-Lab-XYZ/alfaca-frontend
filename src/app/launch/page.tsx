"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { toast } from "@/hooks/use-toast";
import { ImagePlus, Twitter, Share2, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import { signIn, getCsrfToken } from "next-auth/react";
import sdk, {
} from "@farcaster/frame-sdk";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import useUser from "@/lib/user";
import { mutate } from "swr";
import { Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

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
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    image: null as File | null,
    imageUrl: "",
    infeedGame: true,
  });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [showFarcasterModal, setShowFarcasterModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const { data: session, status } = useSession();
  const { data: user } = useUser();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;

      if (context) {
        sdk.actions.ready();
        if (status !== "authenticated") {
          await authenticate();
        }
      } else {
        console.log("sdk context not found");
        setShowFarcasterModal(true);
      }
    };

    const authenticate = async () => {
      try {
        const result = await sdk.actions.signIn({
          nonce: await getNonce(),
        });
        const response = await signIn("credentials", {
          message: result.message,
          signature: result.signature,
          redirect: false,
        });
      } catch (e) {
        console.log("Failed to authenticate: ", e);
      }
    }
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [sdk]);

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

  const isFormValid = formData.name && formData.ticker && formData.imageUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
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
          isSg: formData.infeedGame,
        }),
      });

      if (!result.ok) {
        throw new Error('Failed to create token');
      }

      router.push('/profile');
      mutate('userTokens');
    } catch (error) {
      console.error("Error creating token: ", error);
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
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium font-['Outfit']">Token Ticker</label>
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ticker: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5DEFF] transition-colors font-['Outfit']"
                  placeholder="Enter ticker (e.g. BTC)"
                  required
                  disabled={loading}
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
                  disabled={loading}
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
                      disabled={loading}
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

              {
                user && user.user.is_sg_whitelisted ?
                <Card className="bg-black/30 border border-white/10 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-[#E5DEFF]" />
                      <label className="text-white text-sm font-medium font-['Outfit']">Stolen game</label>
                    </div>
                    <Switch
                      checked={formData.infeedGame}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, infeedGame: checked }))
                      }
                      className="data-[state=checked]:bg-[#E5DEFF] data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2 font-['Outfit']">
                    Enable stolen in-feed game to let users interact with your token on farcaster
                  </p>
                </Card>
                : null
              }

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
      <Dialog open={showFarcasterModal}>
        <DialogContent className="bg-[#000000] border border-white rounded-xl p-6 max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
              <Info className="w-6 h-6 text-white" />
            </div>

            <DialogTitle className="text-white text-center text-lg font-medium font-['Outfit']">
              Farcaster Required
            </DialogTitle>

            <DialogDescription className="text-white/70 text-center font-['Outfit']">
              Use our <a href="https://warpcast.com/" target="_blank" className="underline">Farcaster</a> mini app to launch a coin through Alfaca.
            </DialogDescription>

            <button
              onClick={() => {
                setShowFarcasterModal(false);
                router.push('/');
              }}
              className="w-full bg-[#E5DEFF] hover:bg-[#E5DEFF]/90 text-[#111111] rounded-xl px-6 py-2.5 font-medium transition-all duration-200 mt-2 font-['Outfit']"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Launch;