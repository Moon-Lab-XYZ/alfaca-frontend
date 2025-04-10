
import { useState } from "react";
import { Edit, Check, Plus, Trash2, Twitter, Globe, MessageSquare, Share2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface AboutSocialSectionProps {
  about: string;
  onAboutChange: (newAbout: string) => void;
  socialLinks: SocialLink[];
  onSocialLinksChange: (newLinks: SocialLink[]) => void;
}

export const AboutSocialSection = ({ 
  about, 
  onAboutChange,
  socialLinks,
  onSocialLinksChange
}: AboutSocialSectionProps) => {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [localAbout, setLocalAbout] = useState(about);
  const [localLinks, setLocalLinks] = useState<SocialLink[]>(socialLinks);
  const { toast } = useToast();

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalAbout(e.target.value);
  };

  const toggleAboutEdit = () => {
    if (isEditingAbout) {
      onAboutChange(localAbout);
      toast({
        title: "Changes saved",
        description: "Your about section has been updated successfully",
      });
    }
    setIsEditingAbout(!isEditingAbout);
  };

  const toggleSocialEdit = () => {
    if (isEditingSocial) {
      onSocialLinksChange(localLinks);
      toast({
        title: "Changes saved",
        description: "Your social links have been updated",
      });
    }
    setIsEditingSocial(!isEditingSocial);
  };

  const addNewLink = () => {
    const newLink = {
      id: `link-${Date.now()}`,
      platform: "Twitter",
      url: ""
    };
    setLocalLinks([...localLinks, newLink]);
  };

  const removeLink = (id: string) => {
    setLocalLinks(localLinks.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: "platform" | "url", value: string) => {
    setLocalLinks(localLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const renderPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return <Twitter size={18} />;
      case "discord":
        return <MessageSquare size={18} />; 
      case "telegram":
        return <Share2 size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-none rounded-2xl mb-6">
      {/* About Section */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-white">About</h2>
          <button 
            onClick={toggleAboutEdit}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            {isEditingAbout ? <Check size={18} /> : <Edit size={18} />}
          </button>
        </div>
        
        {isEditingAbout ? (
          <Textarea 
            value={localAbout}
            onChange={handleAboutChange}
            className="min-h-[120px] w-full bg-[#2A2A2A] border-white/10 text-white/80 rounded-xl resize-none"
            placeholder="Enter information about your coin..."
          />
        ) : (
          <p className="text-white/80 leading-relaxed">
            {about}
          </p>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Social Links Section */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-white">Social Links</h2>
          <button 
            onClick={toggleSocialEdit}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            {isEditingSocial ? <Check size={18} /> : <Edit size={18} />}
          </button>
        </div>
        
        {isEditingSocial ? (
          <div className="space-y-3">
            {localLinks.map(link => (
              <div key={link.id} className="flex items-center gap-2">
                <select 
                  value={link.platform}
                  onChange={(e) => updateLink(link.id, "platform", e.target.value)}
                  className="bg-[#2A2A2A] border-white/10 text-white/80 rounded-xl p-2 w-1/3"
                >
                  <option value="Twitter">Twitter</option>
                  <option value="Discord">Discord</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Website">Website</option>
                </select>
                <Input 
                  value={link.url}
                  onChange={(e) => updateLink(link.id, "url", e.target.value)}
                  placeholder="https://"
                  className="bg-[#2A2A2A] border-white/10 text-white/80 rounded-xl"
                />
                <button
                  onClick={() => removeLink(link.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors text-white/70 hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <Button 
              onClick={addNewLink}
              variant="outline" 
              className="w-full bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white mt-3"
            >
              <Plus size={16} className="mr-2" /> Add Link
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {socialLinks.length > 0 ? (
              socialLinks.map(link => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl py-2 px-4 text-white/80 hover:text-white"
                >
                  {renderPlatformIcon(link.platform)}
                  <span>{link.platform}</span>
                </a>
              ))
            ) : (
              <p className="text-white/50 italic">No social links added yet</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
