
interface CreatorAvatarProps {
  username: string;
  image: string;
  gradient: string;
  size?: "sm" | "md";
  type?: "creator" | "coin";
}

export const CreatorAvatar = ({ 
  username, 
  image, 
  gradient,
  size = "md",
  type = "coin"
}: CreatorAvatarProps) => {
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const shapeClasses = type === "creator" ? "rounded-full" : "rounded-xl";
  
  return (
    <div 
      className={`${sizeClasses} ${shapeClasses} overflow-hidden border border-white/10`}
      style={{ background: gradient }}
    >
      {image.includes('placeholder') ? (
        <div className="w-full h-full flex items-center justify-center text-black/50 text-lg font-medium">
          {username[0].toUpperCase()}
        </div>
      ) : (
        <img
          src={image}
          alt={username}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};
